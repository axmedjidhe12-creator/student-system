/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Teacher, ScoreRecord, Invoice } from '../types';
import { 
  ShieldAlert, 
  RefreshCw, 
  Key, 
  Database, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sliders, 
  Search,
  FileText,
  UserCheck,
  Send,
  AlertTriangle,
  CircleDollarSign,
  Cloud,
  HardDrive,
  Save,
  Upload
} from 'lucide-react';

import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  getFirebaseInstance,
  uploadCollectionToFirestore,
  downloadCollectionFromFirestore
} from '../lib/firebase';

import FirebaseSyncControl from './FirebaseSyncControl';

interface MasterAdminCenterProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  scoreRecords: ScoreRecord[];
  setScoreRecords: (records: ScoreRecord[]) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  lang: 'EN' | 'SO';
  bursarPasscode: string;
  setBursarPasscode: (code: string) => void;
  bursarName: string;
  setBursarName: (name: string) => void;
  isFinanceLocked: boolean;
  setIsFinanceLocked: (locked: boolean) => void;
  authorizedFeesCodes: any[];
  setAuthorizedFeesCodes: React.Dispatch<React.SetStateAction<any[]>>;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  adminPassword: string;
  setAdminPassword: (pass: string) => void;
  principalEmail: string;
  setPrincipalEmail: (email: string) => void;
  principalPassword: string;
  setPrincipalPassword: (pass: string) => void;
}

export default function MasterAdminCenter({
  students,
  setStudents,
  teachers,
  setTeachers,
  scoreRecords,
  setScoreRecords,
  invoices,
  setInvoices,
  lang,
  bursarPasscode,
  setBursarPasscode,
  bursarName,
  setBursarName,
  isFinanceLocked,
  setIsFinanceLocked,
  authorizedFeesCodes,
  setAuthorizedFeesCodes,
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  principalEmail,
  setPrincipalEmail,
  principalPassword,
  setPrincipalPassword
}: MasterAdminCenterProps) {
  const [activeSubTab, setActiveSubTab] = useState<'MoESync' | 'TeachersCodes' | 'SystemSettings' | 'AuditLogs' | 'DataMigration' | 'FeeAdmin' | 'FirebaseSync'>('MoESync');
  
  // Search query for teachers
  const [teacherSearch, setTeacherSearch] = useState("");
  
  // MoE Transmission states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState("");
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(["Grade 8", "Grade 12"]);
  
  // System parameters
  const [minimumPassingScore, setMinimumPassingScore] = useState(50);
  const [allowTeacherEditScore, setAllowTeacherEditScore] = useState(true);
  const [isParentPortalLock, setIsParentPortalLock] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: "log-1", ev: "DATABASE_INITIALIZE", user: "Admin Team", desc: "Seeded 2018 E.C. national curriculum datasets", date: "2026-06-08 14:22:01", level: "info" },
    { id: "log-2", ev: "AUTHORIZED_TEACHERS_KEYGEN", user: "Principal", desc: "Generated 4 authorization codes for core faculty members", date: "2026-06-08 15:45:10", level: "info" },
    { id: "log-3", ev: "FINANCE_TERM_SET", user: "Finance Officer", desc: "Released Sports & Lab fee invoices for term", date: "2026-06-08 17:09:55", level: "warning" },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Data Migration & Import System States
  const [importSource, setImportSource] = useState<'excel' | 'csv' | 'sheets' | 'database' | 'sms' | 'pdf'>('csv');
  const [importType, setImportType] = useState<'students' | 'teachers' | 'academics' | 'finance'>('students');
  const [csvTextInput, setCsvTextInput] = useState('');
  const [migrationStep, setMigrationStep] = useState<1 | 2 | 3 | 4>(1);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRawRows, setParsedRawRows] = useState<any[][]>([]);
  const [validatedRows, setValidatedRows] = useState<any[]>([]);
  const [conflictResolution, setConflictResolution] = useState<'merge' | 'ignore' | 'skip'>('merge');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migrationCompletedSummary, setMigrationCompletedSummary] = useState<{
    total: number;
    added: number;
    updated: number;
    skipped: number;
  } | null>(null);

  const studentStandardFields = [
    { key: 'id', label: 'Student ID', synonyms: ['id', 'student id', 'code', 'studentcode', 'rollno'], required: true },
    { key: 'name', label: 'Full Name', synonyms: ['name', 'full name', 'student name', 'fullname'], required: true },
    { key: 'rollNo', label: 'Roll Number', synonyms: ['roll', 'roll no', 'roll number'], required: true },
    { key: 'gender', label: 'Gender', synonyms: ['gender', 'sex', 'm/f'], required: false },
    { key: 'grade', label: 'Class / Grade', synonyms: ['class', 'grade', 'level'], required: true },
    { key: 'section', label: 'Section', synonyms: ['section', 'sec', 'class section'], required: true },
    { key: 'parentName', label: 'Parent Name', synonyms: ['parent', 'parent name', 'guardian', 'guardian name'], required: false },
    { key: 'phone', label: 'Phone Number', synonyms: ['phone', 'parent phone', 'phone number', 'contact'], required: false },
    { key: 'email', label: 'Email', synonyms: ['email', 'e-mail', 'parent email', 'student email'], required: false },
    { key: 'attendanceRatio', label: 'Attendance (0-1.0)', synonyms: ['attendance', 'ratio', 'presence'], required: false },
    { key: 'conductRating', label: 'Conduct Rating', synonyms: ['conduct', 'conduct rating', 'behavior'], required: false }
  ];

  const teacherStandardFields = [
    { key: 'id', label: 'Teacher ID', synonyms: ['id', 'teacher id', 'code', 'teacher code'], required: true },
    { key: 'name', label: 'Full Name', synonyms: ['name', 'full name', 'fullname', 'teacher name'], required: true },
    { key: 'email', label: 'Email Address', synonyms: ['email', 'e-mail', 'address'], required: true },
    { key: 'phone', label: 'Phone Number', synonyms: ['phone', 'phone number', 'contact text'], required: false },
    { key: 'specialization', label: 'Specialization Subject', synonyms: ['specialization', 'expert', 'subject', 'department'], required: true },
    { key: 'assignedGrades', label: 'Assigned Grades', synonyms: ['grades', 'assigned grades', 'classes'], required: false },
    { key: 'assignedSections', label: 'Assigned Sections', synonyms: ['sections', 'assigned sections'], required: false },
    { key: 'teacherCode', label: 'Access Pin / Code', synonyms: ['teachercode', 'pin', 'code key'], required: false }
  ];

  const academicStandardFields = [
    { key: 'studentId', label: 'Student ID', synonyms: ['student id', 'student id', 'roll no', 'id'], required: true },
    { key: 'subjectName', label: 'Subject Name', synonyms: ['subject', 'subject name', 'course'], required: true },
    { key: 'quizzes', label: 'Quizzes (Max 15)', synonyms: ['quiz', 'quizzes', 'quiz total'], required: false },
    { key: 'assignments', label: 'Assignments (Max 15)', synonyms: ['assignment', 'assignments'], required: false },
    { key: 'participation', label: 'Participation (Max 10)', synonyms: ['participation', 'part', 'attendance points'], required: false },
    { key: 'midtermScore', label: 'Midterm Exam (Max 20)', synonyms: ['midterm', 'mid term', 'mid'], required: false },
    { key: 'finalScore', label: 'Final Exam (Max 40)', synonyms: ['final', 'final exam', 'finalscore'], required: false },
    { key: 'semester', label: 'Semester', synonyms: ['semester', 'sem'], required: false },
    { key: 'academicYear', label: 'Academic Year', synonyms: ['year', 'academic year'], required: false }
  ];

  const financeStandardFields = [
    { key: 'studentId', label: 'Student ID', synonyms: ['student id', 'id', 'studentcode'], required: true },
    { key: 'studentName', label: 'Student Name', synonyms: ['student name', 'name', 'fullname'], required: true },
    { key: 'feeType', label: 'Fee Category', synonyms: ['type', 'fee', 'fee type', 'category'], required: true },
    { key: 'amount', label: 'Amount (Birr)', synonyms: ['amount', 'bill', 'total birr'], required: true },
    { key: 'paidAmount', label: 'Paid Amount', synonyms: ['paid', 'paid amount', 'collected'], required: false },
    { key: 'dueDate', label: 'Due Date', synonyms: ['due', 'due date'], required: false }
  ];

  const getStandardFields = () => {
    if (importType === 'students') return studentStandardFields;
    if (importType === 'teachers') return teacherStandardFields;
    if (importType === 'academics') return academicStandardFields;
    return financeStandardFields;
  };

  const getSourceLabel = (src: string) => {
    switch (src) {
      case 'excel': return 'Excel Sheet (.xlsx)';
      case 'csv': return 'CSV Comma Separated (.csv)';
      case 'sheets': return 'Google Sheets Export';
      case 'database': return 'Database/SQL Dump';
      case 'sms': return 'Legacy SMS Export File';
      case 'pdf': return 'PDF Student List (Parsed Scan)';
      default: return 'Source File';
    }
  };

  const TEMPLATES: Record<string, string> = {
    students: `Student ID,Full Name,Roll No,Gender,Grade,Section,Parent Name,Parent Phone,Parent Email,Attendance,Conduct
std-2,Seble Hailu Update,Roll-002,Female,Grade 8,B,Hailu Abebe,+251 912-44-5555,seble.h@example.com,0.98,Excellent
std-15,Melaku Belay,Roll-015,Male,Grade 10,A,Belay Gessesse,+251 911-55-9900,belay@example.com,0.94,Very Good
std-16,Eleni Tadesse,Roll-016,Female,Grade 9,A,Tadesse Wolde,+251 920-11-2233,,0.87,Good
std-17,Worku Demeke,Roll-017,Male,Grade 8,A,Demeke Hailu,,demeke@example.com,0.91,Satisfactory`,

    teachers: `Teacher ID,Full Name,Email Address,Phone Number,Specialization,Assigned Grades,Assigned Sections,Access Code
tch-1,Dr. Abraham Assefa updated,abraham.a@focusacademy.edu.et,+251 911-00-1100,Amharic Language,Grade 8,A,TCH-7492
tch-7,Aster Kebede,aster.k@focusacademy.edu.et,+251 900-12-3456,Information Technology,"Grade 7, Grade 8","A, B",TCH-1188
tch-8,Malkamu Hailu,malkamu@focusacademy.edu.et,+251 945-88-9900,Physical Education,Grade 11,A,TCH-8991`,

    academics: `Student ID,Subject,Quizzes,Assignments,Participation,Midterm,Final,Semester,Academic Year
std-1,Mathematics,14,15,10,19,38,Semester 1,2018 E.C.
std-1,Amharic,13,14,9,18,36,Semester 1,2018 E.C.
std-2,Mathematics,11,12,8,15,30,Semester 1,2018 E.C.
std-3,English,15,13,9,17,35,Semester 1,2018 E.C.`,

    finance: `Student ID,Student Name,Fee Category,Amount Birr,Paid Birr,Due Date
std-1,Yonas Bekele,Tuition Fee,5400,5400,2026-06-30
std-2,Seble Hailu,Sports & Lab Fee,1200,800,2026-06-15
std-3,Abebe Kassa,Stationery Fee,2500,0,2026-07-01`
  };

  const loadTemplate = (type: 'students' | 'teachers' | 'academics' | 'finance') => {
    setImportType(type);
    setCsvTextInput(TEMPLATES[type] || '');
  };

  const parseCSV = (text: string): { headers: string[]; rows: any[][] } => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const parseLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine);
    return { headers, rows };
  };

  const handleProcessStep1 = () => {
    if (!csvTextInput.trim()) {
      triggerToast(lang === 'EN' ? 'Please paste some spreadsheet data or choose a template first.' : 'እባክዎ መጀመሪያ ፋይል ይጫኑ ወይም ዝግጁ የተደረገ የመሞከሪያ ዳታ ይምረጡ።');
      return;
    }

    const { headers, rows } = parseCSV(csvTextInput);
    if (headers.length === 0) {
      triggerToast(lang === 'EN' ? 'Invalid CSV / sheet columns detected.' : 'ያልተስተካከለ የሰንጠረዥ ዳታ ተገኝቷል።');
      return;
    }

    setParsedHeaders(headers);
    setParsedRawRows(rows);

    const currentStdFields = getStandardFields();
    const mappings: Record<string, string> = {};
    for (const field of currentStdFields) {
      const match = headers.find(h => {
        const hClean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        return field.synonyms.some(syn => {
          const synClean = syn.toLowerCase().replace(/[^a-z0-9]/g, '');
          return hClean === synClean || hClean.includes(synClean) || synClean.includes(hClean);
        });
      });
      mappings[field.key] = match || '';
    }

    setColumnMappings(mappings);
    setMigrationStep(2);
  };

  const handleProcessStep2 = () => {
    const currentStdFields = getStandardFields();
    
    const missingMaps = currentStdFields.filter(f => f.required && !columnMappings[f.key]);
    if (missingMaps.length > 0) {
      triggerToast(lang === 'EN' 
        ? `Warning: Required fields [${missingMaps.map(m => m.label).join(', ')}] are not mapped yet.` 
        : `ማስጠንቀቂያ ፤ አስገዳጅ የሆኑት [${missingMaps.map(m => m.label).join(', ')}] ገና አልተገናኙም`);
      return;
    }

    const validated = parsedRawRows.map((row, idx) => {
      const record: any = { _rowIdx: idx };
      
      currentStdFields.forEach(field => {
        const csvCol = columnMappings[field.key];
        if (csvCol) {
          const colIdx = parsedHeaders.indexOf(csvCol);
          if (colIdx !== -1) {
            record[field.key] = row[colIdx];
          }
        }
      });

      const errors: string[] = [];
      const warnings: string[] = [];
      let isDuplicate = false;
      let duplicateType: 'existing' | 'file-internal' | 'none' = 'none';

      if (importType === 'students') {
        const idToCheck = record.id;
        if (!idToCheck) {
          errors.push("Missing Student ID");
        } else {
          const existsSystem = students.some(s => s.id === idToCheck);
          if (existsSystem) {
            isDuplicate = true;
            duplicateType = 'existing';
            warnings.push(`ID Already Exists System-wide.`);
          }
          const existsFile = parsedRawRows.some((otherRow, otherIdx) => {
            if (otherIdx >= idx) return false;
            const otherColIdx = parsedHeaders.indexOf(columnMappings['id']);
            return otherColIdx !== -1 && otherRow[otherColIdx] === idToCheck;
          });
          if (existsFile) {
            isDuplicate = true;
            duplicateType = 'file-internal';
            errors.push(`Duplicate ID inside spreadsheet.`);
          }
        }

        if (!record.name) errors.push("Missing Full Name value");
        if (!record.grade) errors.push("Missing class/level assignment");
        
        if (record.attendanceRatio !== undefined && record.attendanceRatio !== '') {
          const parsedAt = parseFloat(record.attendanceRatio);
          if (isNaN(parsedAt) || parsedAt < 0 || parsedAt > 1) {
            errors.push("Attendance ratio must be between 0.00 and 1.00");
          } else {
            record.attendanceRatio = parsedAt;
          }
        } else {
          record.attendanceRatio = 0.95;
        }

        if (record.conductRating) {
          const cleanConduct = record.conductRating.trim();
          const validOptions = ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement'];
          const matchedOption = validOptions.find(o => o.toLowerCase() === cleanConduct.toLowerCase());
          if (!matchedOption) {
            warnings.push(`Setting conduct to default 'Excellent'`);
            record.conductRating = 'Excellent';
          } else {
            record.conductRating = matchedOption;
          }
        } else {
          record.conductRating = 'Excellent';
        }
      } 
      
      else if (importType === 'teachers') {
        const idToCheck = record.id;
        if (!idToCheck) {
          errors.push("Missing Teacher ID");
        } else {
          const existsSystem = teachers.some(t => t.id === idToCheck);
          if (existsSystem) {
            isDuplicate = true;
            duplicateType = 'existing';
            warnings.push(`Teacher code matches existing faculty.`);
          }
        }

        if (!record.name) errors.push("Faculty Name is blank");
        if (!record.email || !record.email.includes('@')) errors.push("Invalid e-mail format");
        if (!record.specialization) errors.push("Specialization is required");
      } 
      
      else if (importType === 'academics') {
        const stuId = record.studentId;
        if (!stuId) {
          errors.push("Missing target ID");
        } else {
          const stdExists = students.some(s => s.id === stuId || s.rollNo === stuId);
          if (!stdExists) {
            warnings.push(`ID [${stuId}] is not linked to any student profile.`);
          }
        }
        if (!record.subjectName) errors.push("Course name stands empty");

        const checkMaxScore = (val: any, limit: number, fieldName: string, defaultVal: number) => {
          if (val === undefined || val === '') return defaultVal;
          const parsed = parseFloat(val);
          if (isNaN(parsed) || parsed < 0 || parsed > limit) {
            errors.push(`${fieldName} raw score [${val}] violates bounds (0-${limit})`);
            return defaultVal;
          }
          return parsed;
        };

        record.quizzes = checkMaxScore(record.quizzes, 15, "Quiz Score", 0);
        record.assignments = checkMaxScore(record.assignments, 15, "Assignment Score", 0);
        record.participation = checkMaxScore(record.participation, 10, "Participation Score", 0);
        record.midtermScore = checkMaxScore(record.midtermScore, 20, "Midterm Exam", 0);
        record.finalScore = checkMaxScore(record.finalScore, 40, "Final Exam Score", 0);
      } 
      
      else if (importType === 'finance') {
        const stuId = record.studentId;
        if (!stuId) {
          errors.push("Missing target ID");
        } else {
          const stdExists = students.some(s => s.id === stuId || s.rollNo === stuId);
          if (!stdExists) {
            warnings.push(`Student ID not matched in rosters.`);
          }
        }
        if (!record.feeType) errors.push("Invoice category is required");
        
        const feeAmount = parseFloat(record.amount || '0');
        if (isNaN(feeAmount) || feeAmount <= 0) {
          errors.push("Amount must be positive decimal fraction.");
        } else {
          record.amount = feeAmount;
        }

        const feePaid = parseFloat(record.paidAmount || '0');
        if (isNaN(feePaid) || feePaid < 0) {
          errors.push("Paid amount must be zero or more");
        } else {
          record.paidAmount = feePaid;
        }
      }

      return {
        ...record,
        _errors: errors,
        _warnings: warnings,
        _isDuplicate: isDuplicate,
        _duplicateType: duplicateType,
        _status: errors.length > 0 ? 'invalid' : (warnings.length > 0 || isDuplicate ? 'warning' : 'valid')
      };
    });

    setValidatedRows(validated);
    setMigrationStep(3);
  };

  const handleUpdateRecordInline = (rowIdx: number, fieldKey: string, newValue: string) => {
    setValidatedRows(prev => prev.map(row => {
      if (row._rowIdx === rowIdx) {
        const updatedRow = { ...row, [fieldKey]: newValue };
        const errors: string[] = [];
        const warnings: string[] = [];
        let isDuplicate = false;
        let duplicateType: 'existing' | 'file-internal' | 'none' = 'none';

        if (importType === 'students') {
          const idToCheck = updatedRow.id;
          if (!idToCheck) {
            errors.push("Missing ID");
          } else {
            const existsSystem = students.some(s => s.id === idToCheck);
            if (existsSystem) {
              isDuplicate = true;
              duplicateType = 'existing';
              warnings.push(`Duplicate ID.`);
            }
          }
          if (!updatedRow.name) errors.push("Missing Full Name");
          if (!updatedRow.grade) errors.push("Missing Grade");
          
          if (updatedRow.attendanceRatio !== undefined && updatedRow.attendanceRatio !== '') {
            const parsedAt = parseFloat(updatedRow.attendanceRatio);
            if (isNaN(parsedAt) || parsedAt < 0 || parsedAt > 1) {
              errors.push("Attendance must be between 0.00 and 1.00");
            } else {
              updatedRow.attendanceRatio = parsedAt;
            }
          }
        } 
        
        else if (importType === 'teachers') {
          const idToCheck = updatedRow.id;
          if (!idToCheck) {
            errors.push("Missing ID");
          } else {
            const existsSystem = teachers.some(t => t.id === idToCheck);
            if (existsSystem) {
              isDuplicate = true;
              duplicateType = 'existing';
              warnings.push(`Duplicate ID.`);
            }
          }
          if (!updatedRow.name) errors.push("Faculty Name blank");
          if (!updatedRow.email || !updatedRow.email.includes('@')) errors.push("Invalid email format");
          if (!updatedRow.specialization) errors.push("Specialization subject empty");
        }

        else if (importType === 'academics') {
          if (!updatedRow.studentId) errors.push("Missing Student ID");
          if (!updatedRow.subjectName) errors.push("Subject empty");
          
          const validateMax = (val: any, limit: number, fieldTitle: string) => {
            const parsed = parseFloat(val);
            if (isNaN(parsed) || parsed < 0 || parsed > limit) {
              errors.push(`${fieldTitle} score violates bounds (0-${limit})`);
            }
          };
          if (updatedRow.quizzes) validateMax(updatedRow.quizzes, 15, "Quiz");
          if (updatedRow.assignments) validateMax(updatedRow.assignments, 15, "Assignment");
          if (updatedRow.participation) validateMax(updatedRow.participation, 10, "Participation");
          if (updatedRow.midtermScore) validateMax(updatedRow.midtermScore, 20, "Midterm");
          if (updatedRow.finalScore) validateMax(updatedRow.finalScore, 40, "Final");
        }

        else if (importType === 'finance') {
          if (!updatedRow.studentId) errors.push("Missing Student ID");
          if (!updatedRow.feeType) errors.push("Fee category required");
          const feeAmount = parseFloat(updatedRow.amount);
          if (isNaN(feeAmount) || feeAmount <= 0) errors.push("Amount must be positive");
        }

        return {
          ...updatedRow,
          _errors: errors,
          _warnings: warnings,
          _isDuplicate: isDuplicate,
          _duplicateType: duplicateType,
          _status: errors.length > 0 ? 'invalid' : (warnings.length > 0 || isDuplicate ? 'warning' : 'valid')
        };
      }
      return row;
    }));
  };

  const handleExecuteImport = () => {
    setIsMigrating(true);
    setMigrationProgress(10);
    setMigrationLogs([lang === 'EN' ? "Activating safe sandbox connection..." : "ደህንነቱ የተጠበቀ ግንኙነት በመመስረት ላይ..."]);

    const processInterval = setTimeout(() => {
      setMigrationProgress(40);
      setMigrationLogs(prev => [...prev, lang === 'EN' ? "Resolving duplicate records / ID conflicts..." : "የተደጋገሙ መረጃዎችን የማስተካከያ ሒደት በመስራት ላይ..."]);

      const processInterval2 = setTimeout(() => {
        setMigrationProgress(75);
        setMigrationLogs(prev => [...prev, lang === 'EN' ? "Writing database files & mapping constraints..." : "በመረጃ ቋቱ ላይ መረጃዎችን በይፋ በማስተናገድ ላይ..."]);

        const processInterval3 = setTimeout(() => {
          let newRecordsCount = 0;
          let updatedRecordsCount = 0;
          let skippedRecordsCount = 0;

          if (importType === 'students') {
            const updatedStudentsList = [...students];
            validatedRows.forEach(row => {
              if (row._status === 'invalid' && conflictResolution !== 'ignore') {
                skippedRecordsCount++;
                return;
              }

              const existsIdx = updatedStudentsList.findIndex(s => s.id === row.id);
              if (existsIdx !== -1) {
                if (conflictResolution === 'merge') {
                  updatedStudentsList[existsIdx] = {
                    ...updatedStudentsList[existsIdx],
                    name: row.name,
                    rollNo: row.rollNo || updatedStudentsList[existsIdx].rollNo,
                    gender: row.gender || updatedStudentsList[existsIdx].gender,
                    grade: row.grade || updatedStudentsList[existsIdx].grade,
                    section: row.section || updatedStudentsList[existsIdx].section,
                    parentName: row.parentName || updatedStudentsList[existsIdx].parentName,
                    phone: row.phone || updatedStudentsList[existsIdx].phone,
                    email: row.email || updatedStudentsList[existsIdx].email,
                    attendanceRatio: parseFloat(row.attendanceRatio) || updatedStudentsList[existsIdx].attendanceRatio,
                    conductRating: row.conductRating || updatedStudentsList[existsIdx].conductRating,
                    status: row.status || updatedStudentsList[existsIdx].status || 'Active'
                  };
                  updatedRecordsCount++;
                } else if (conflictResolution === 'skip') {
                  skippedRecordsCount++;
                } else {
                  const newId = `std-${Math.floor(Math.random() * 900000) + 1000}`;
                  updatedStudentsList.push({
                    id: newId,
                    name: row.name,
                    email: row.email || `${row.name.toLowerCase().replace(/\s+/g, '')}@focusacademy.edu.et`,
                    phone: row.phone || '+251 911-00-0000',
                    role: 'Student',
                    status: 'Active',
                    joinedDate: new Date().toISOString().substring(0, 10),
                    rollNo: row.rollNo || `R ${Math.floor(Math.random() * 1000)}`,
                    grade: row.grade || 'Grade 1',
                    section: row.section || 'A',
                    attendanceRatio: parseFloat(row.attendanceRatio) || 0.95,
                    conductRating: row.conductRating || 'Excellent',
                    parentName: row.parentName,
                    studentCode: `MOE-ST-${Math.floor(1000 + Math.random() * 9000)}`
                  });
                  newRecordsCount++;
                }
              } else {
                updatedStudentsList.push({
                  id: row.id || `std-${Math.floor(Math.random() * 900000) + 1000}`,
                  name: row.name,
                  email: row.email || `${row.name.toLowerCase().replace(/\s+/g, '')}@focusacademy.edu.et`,
                  phone: row.phone || '+251 911-00-0000',
                  role: 'Student',
                  status: 'Active',
                  joinedDate: new Date().toISOString().substring(0, 10),
                  rollNo: row.rollNo || `R ${Math.floor(Math.random() * 1000)}`,
                  grade: row.grade || 'Grade 1',
                  section: row.section || 'A',
                  attendanceRatio: parseFloat(row.attendanceRatio) || 0.95,
                  conductRating: row.conductRating || 'Excellent',
                  parentName: row.parentName,
                  studentCode: `MOE-ST-${Math.floor(1000 + Math.random() * 9000)}`
                });
                newRecordsCount++;
              }
            });
            setStudents(updatedStudentsList);
          } 
          
          else if (importType === 'teachers') {
            const updatedTeachersList = [...teachers];
            validatedRows.forEach(row => {
              if (row._status === 'invalid') {
                skippedRecordsCount++;
                return;
              }
              const existsIdx = updatedTeachersList.findIndex(t => t.id === row.id);
              if (existsIdx !== -1) {
                if (conflictResolution === 'merge') {
                  updatedTeachersList[existsIdx] = {
                    ...updatedTeachersList[existsIdx],
                    name: row.name,
                    email: row.email || updatedTeachersList[existsIdx].email,
                    phone: row.phone || updatedTeachersList[existsIdx].phone,
                    specialization: row.specialization || updatedTeachersList[existsIdx].specialization,
                    teacherCode: row.teacherCode || updatedTeachersList[existsIdx].teacherCode
                  };
                  updatedRecordsCount++;
                } else if (conflictResolution === 'skip') {
                  skippedRecordsCount++;
                } else {
                  const newId = `tch-${Math.floor(Math.random() * 900000) + 1000}`;
                  updatedTeachersList.push({
                    id: newId,
                    name: row.name,
                    email: row.email,
                    phone: row.phone || '+251 911-00-0000',
                    role: 'Teacher',
                    status: 'Active',
                    joinedDate: new Date().toISOString().substring(0, 10),
                    specialization: row.specialization || 'General',
                    assignedGrades: row.assignedGrades ? row.assignedGrades.split(',') : ['Grade 8'],
                    assignedSections: row.assignedSections ? row.assignedSections.split(',') : ['A'],
                    teacherCode: row.teacherCode || `TCH-${Math.floor(Math.random() * 9000) + 1000}`
                  });
                  newRecordsCount++;
                }
              } else {
                updatedTeachersList.push({
                  id: row.id || `tch-${Math.floor(Math.random() * 9000) + 1000}`,
                  name: row.name,
                  email: row.email,
                  phone: row.phone || '+251 911-00-0000',
                  role: 'Teacher',
                  status: 'Active',
                  joinedDate: new Date().toISOString().substring(0, 10),
                  specialization: row.specialization || 'Geography',
                  assignedGrades: row.assignedGrades ? row.assignedGrades.split(',') : ['Grade 8'],
                  assignedSections: row.assignedSections ? row.assignedSections.split(',') : ['A'],
                  teacherCode: row.teacherCode || `TCH-${Math.floor(Math.random() * 9000) + 1000}`
                });
                newRecordsCount++;
              }
            });
            setTeachers(updatedTeachersList);
          } 
          
          else if (importType === 'academics') {
            const updatedScores = [...scoreRecords];
            validatedRows.forEach(row => {
              if (row._status === 'invalid') {
                skippedRecordsCount++;
                return;
              }
              const std = students.find(s => s.id === row.studentId || s.rollNo === row.studentId);
              const studentName = std ? std.name : "Imported Student";
              const grade = std ? std.grade : "Grade 8";
              const section = std ? std.section : "A";

              const continuousAssessmentTotal = (parseFloat(row.quizzes) || 0) + (parseFloat(row.assignments) || 0) + (parseFloat(row.participation) || 0);
              const grandTotal = continuousAssessmentTotal + (parseFloat(row.midtermScore) || 0) + (parseFloat(row.finalScore) || 0);
              
              const calculateLetter = (score: number) => {
                if (score >= 90) return 'A+';
                if (score >= 83) return 'A';
                if (score >= 75) return 'A-';
                if (score >= 68) return 'B+';
                if (score >= 60) return 'B';
                if (score >= 50) return 'C';
                return 'F';
              };

              updatedScores.push({
                id: `scr-${Math.floor(Math.random() * 900000) + 1000}`,
                studentId: row.studentId,
                studentName,
                grade,
                section,
                subjectId: row.subjectName.toLowerCase(),
                subjectName: row.subjectName,
                semester: (row.semester as any) || 'Semester 1',
                academicYear: row.academicYear || '2018 E.C.',
                quizzes: parseFloat(row.quizzes) || 0,
                assignments: parseFloat(row.assignments) || 0,
                participation: parseFloat(row.participation) || 0,
                continuousAssessmentTotal,
                midtermScore: parseFloat(row.midtermScore) || 0,
                finalScore: parseFloat(row.finalScore) || 0,
                grandTotal,
                letterGrade: calculateLetter(grandTotal)
              });
              newRecordsCount++;
            });
            setScoreRecords(updatedScores);
          } 
          
          else if (importType === 'finance') {
            const updatedInvoices = [...invoices];
            validatedRows.forEach(row => {
              if (row._status === 'invalid') {
                skippedRecordsCount++;
                return;
              }
              const std = students.find(s => s.id === row.studentId || s.name.toLowerCase().includes(row.studentName?.toLowerCase()));
              const id = `inv-${Math.floor(Math.random() * 900000) + 1000}`;
              
              const amount = parseFloat(row.amount) || 0;
              const paidAmount = parseFloat(row.paidAmount) || 0;
              const balance = amount - paidAmount;
              const status = balance <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partially Paid' : 'Unpaid');

              updatedInvoices.push({
                id,
                studentId: row.studentId || std?.id || `std-${Math.floor(Math.random() * 9000)}`,
                studentName: row.studentName || std?.name || "Imported Student",
                grade: std?.grade || "Grade 8",
                section: std?.section || "A",
                feeType: row.feeType || "General Tuition Fee",
                amount,
                dateIssued: new Date().toISOString().substring(0, 10),
                dueDate: row.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                paidAmount,
                balance,
                status,
                paymentHistory: paidAmount > 0 ? [{
                  receiptId: `rcpt-${Math.floor(Math.random() * 9000)}`,
                  date: new Date().toISOString().substring(0, 10),
                  amountPaid: paidAmount,
                  paymentMethod: 'Cash',
                  referenceNo: `SLIP-${Math.floor(100000 + Math.random() * 900000)}`
                }] : []
              });
              newRecordsCount++;
            });
            setInvoices(updatedInvoices);
          }

          setMigrationProgress(100);
          setMigrationLogs(prev => [...prev, lang === 'EN' ? "Finalizing schema dependencies... Done!" : "መረጃው በተሳካ ሁኔታ ተዛውሮ አልቋል!"]);
          setMigrationCompletedSummary({
            total: validatedRows.length,
            added: newRecordsCount,
            updated: updatedRecordsCount,
            skipped: skippedRecordsCount
          });

          const newLog = {
            id: `log-${Date.now()}`,
            ev: "DATA_MIGRATION_IMPORT_SUCCESS",
            user: "Principal Admin",
            desc: `Processed database migration containing ${validatedRows.length} records. Created ${newRecordsCount} active entries, merged ${updatedRecordsCount} profiles, and bypassed ${skippedRecordsCount} error rows.`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: "info"
          };
          setAuditLogs(prev => [newLog, ...prev]);

          setIsMigrating(false);
          setMigrationStep(4);
          triggerToast(lang === 'EN' ? "Database data migration successful!" : "የዳታ ማዛወር ተግባር ተጠናቋል!");

        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleRegenerateCodes = () => {
    const updated = teachers.map(t => {
      const randomCode = `TCH-${Math.floor(Math.random() * 9000) + 1000}`;
      return { ...t, teacherCode: randomCode };
    });
    setTeachers(updated);
    
    // Log audit event
    const newLog = {
      id: `log-${Date.now()}`,
      ev: "BATCH_REGENERATION_TEACHER_CODES",
      user: "Master Admin System",
      desc: `Regenerated credentials codes for ${teachers.length} certified teachers`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level: "warning"
    };
    setAuditLogs([newLog, ...auditLogs]);
    triggerToast(lang === 'EN' ? "Regenerated all teacher authorization codes!" : "ሁሉንም የመምህራን መለያ ኮዶች በአዲስ ቀይረናል!");
  };

  // Handle single teacher code regeneration
  const handleSingleRegen = (teacherId: string) => {
    const randomCode = `TCH-${Math.floor(Math.random() * 9000) + 1000}`;
    const updated = teachers.map(t => {
      if (t.id === teacherId) {
        return { ...t, teacherCode: randomCode };
      }
      return t;
    });
    setTeachers(updated);
    triggerToast(lang === 'EN' ? `Code regenerated for teacher!` : `ለመምህሩ አዲስ መለያ ኮድ ተተክቷል!`);
  };

  // Compile and transmit Student Data to Ministry of Education Information Center
  const handleCentralExportAndSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(10);
    setSyncStep(lang === 'EN' ? "Locating active student records from directory..." : "ንቁ የተማሪዎችን መዝገቦች በመሰብሰብ ላይ...");

    const steps = [
      { p: 25, term: lang === 'EN' ? "Filtering students in nominated grades..." : "ከተመረጡት ክፍሎች ያሉ ልጆችን በመለየት ላይ..." },
      { p: 45, term: lang === 'EN' ? "Compiling mid-term and semester GPA grade metrics..." : "የአጋማሽ እና የሙሉ ሰሚስተር ውጤቶችን በማዘጋጀት ላይ..." },
      { p: 60, term: lang === 'EN' ? "Cross-referencing National Exam Eligibility standard checklist..." : "የሀገር አቀፍ ፈተና መመዘኛ ስርዓትን በማመሳከር ላይ..." },
      { p: 80, term: lang === 'EN' ? "Applying secure digital certificate signatures..." : "ደህንነቱ የተጠበቀ ኤሌክትሮኒክ ፊርማ በማያያዝ ላይ..." },
      { p: 95, term: lang === 'EN' ? "Transmitting payload file to MoE Registry Center Center on secure socket..." : "ደህንነቱ በተጠበቀ መስመር ወደ ትምህርት ሚኒስቴር ዳታ ማዕከል በመላክ ላይ..." },
      { p: 100, term: lang === 'EN' ? "Synchronization Complete!" : "ማመሳሰል ተጠናቋል!" }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setSyncProgress(steps[currentStepIdx].p);
        setSyncStep(steps[currentStepIdx].term);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsSyncing(false);
        
        // Generate summary stats
        const activeStudentsCount = students.filter(s => selectedGrades.includes(s.grade)).length;
        const totalPassed = students.filter(s => selectedGrades.includes(s.grade) && s.status === 'Promoted').length;
        const totalFailed = students.filter(s => selectedGrades.includes(s.grade) && s.status === 'Failed').length;
        
        setLastSyncResult({
          timestamp: new Date().toLocaleTimeString(),
          processedCount: activeStudentsCount,
          passed: totalPassed,
          failed: totalFailed,
          hash: `SHA256-FA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        });

        const newLog = {
          id: `log-${Date.now()}`,
          ev: "MOE_INFORMATION_CENTER_SYNC",
          user: "Super Admin Team",
          desc: `Transmitted evaluation profiles for ${activeStudentsCount} students to Central MoE (Registry Hash: ${lastSyncResult?.hash || 'SHA256-FA-B570X'})`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          level: "info"
        };
        setAuditLogs([newLog, ...auditLogs]);
        triggerToast(lang === 'EN' ? "Roster sync with MoE Information Center success!" : "ከተማሪዎች መረጃ ማዕከል ጋር በሚገባ ተመሳስሏል!");
      }
    }, 1200);
  };

  // Toggle grade selection for sync
  const toggleGradeSelectedForSync = (gradeName: string) => {
    if (selectedGrades.includes(gradeName)) {
      if (selectedGrades.length > 1) {
        setSelectedGrades(selectedGrades.filter(g => g !== gradeName));
      } else {
        triggerToast("Select at least one grade to export!");
      }
    } else {
      setSelectedGrades([...selectedGrades, gradeName]);
    }
  };

  // Download simulation
  const downloadBackupJSON = () => {
    const dataToExport = {
      schoolCode: "FA-7819",
      schoolName: lang === 'EN' ? "Focus Academy" : "ፎከስ አካዳሚ",
      academicYear: "2018 E.C.",
      synchronizedDate: new Date().toLocaleDateString(),
      records: students.filter(s => selectedGrades.includes(s.grade)).map(s => {
        // Find academic score records for this student
        const studentScores = scoreRecords.filter(sr => sr.studentId === s.id);
        const gradesSummary = studentScores.map(scr => ({
          subject: scr.subjectName,
          score: scr.grandTotal,
          grade: scr.letterGrade
        }));
        
        return {
          id: s.id,
          name: s.name,
          nationalCode: s.studentCode || `MOE-ST-${s.id.split('-')[1] || '001'}`,
          grade: s.grade,
          section: s.section,
          conduct: s.conductRating,
          promotionStatus: s.status,
          academics: gradesSummary
        };
      })
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `m_information_center_export_${selectedGrades.join('_').replace(/\s+/g, '')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast(lang === 'EN' ? "JSON Backup compiled successfully!" : "የተማሪዎቹ ዝርዝር በJSON ሰነድ ወርዷል!");
  };

  // Filter teachers list
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    (t.nameAmharic && t.nameAmharic.toLowerCase().includes(teacherSearch.toLowerCase())) ||
    (t.teacherCode && t.teacherCode.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Toast simulated message */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-amber-600 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pulse">
          <Sparkles size={16} className="text-amber-500 shrink-0" />
          <span className="text-slate-100">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner introducing the Master Center */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-[#111318] to-[#111318] p-6 rounded-2xl border border-amber-900/30 shadow-md">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 flex items-center justify-center">
          <Database size={180} className="text-amber-500 hover:rotate-12 transition-transform" />
        </div>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] bg-amber-600/10 text-amber-500 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest border border-amber-600/20">
            SYSTEM ADMIN CONSOLE
          </span>
          <h2 className="text-xl font-display font-medium text-slate-100 tracking-tight mt-1.5">
            {lang === 'EN' ? "Central Master Administration System" : "ማዕከላዊ የአስተዳደር መቆጣጠሪያ ክፍል"}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl font-sans">
            {lang === 'EN' 
              ? "Oversee school authorization indices, configure curriculum passing algorithms, manage teacher-validation keys, and export certified academic rosters directly into the Ministry of Education Central Information Center."
              : "የበረከት ትምህርት ቤት የአስተዳደር መረጃ እና የመምህራን መለያ ኮዶችን ይቆጣጠሩ፣ ደንቦችን ያቅዱ እንዲሁም ውጤቶችን ወደ ትምህርት ሚኒስቴር ማዕከላዊ የፈተና መረጃ ጣቢያ ይላኩ።"}
          </p>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex bg-[#111318] p-1.5 rounded-xl self-start gap-1.5 border border-slate-800 shrink-0 select-none overflow-x-auto max-w-full">
        {([
          { id: 'MoESync', label: lang === 'EN' ? "National Information Sync" : "የMoE መረጃ ማዕከል", icon: <Send size={14} /> },
          { id: 'TeachersCodes', label: lang === 'EN' ? "Teachers Keys & Codes" : "የመምህራን ኮዶች", icon: <Key size={14} /> },
          { id: 'SystemSettings', label: lang === 'EN' ? "Academic Settings" : "የትምህርት መመዘኛ", icon: <Sliders size={14} /> },
          { id: 'FeeAdmin', label: lang === 'EN' ? "Fee Security & Keys" : "የክፍያ ፈቃድ ማዕከል", icon: <CircleDollarSign size={14} /> },
          { id: 'AuditLogs', label: lang === 'EN' ? "Security Auditor" : "የደህንነት እንቅስቃሴ", icon: <ShieldAlert size={14} /> },
          { id: 'DataMigration', label: lang === 'EN' ? "Data Migration & Import" : "የዳታ ማዘዣ ማስተባበሪያ", icon: <Database size={14} /> },
          { id: 'FirebaseSync', label: lang === 'EN' ? "Firebase Cloud Sync" : "የደመና ዳታቤዝ", icon: <Cloud size={14} /> }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === tab.id 
                ? 'bg-amber-600 text-white shadow-sm font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. National Sync / MoE Information Center */}
      {activeSubTab === 'MoESync' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Sync Controls */}
          <div className="bg-[#111318] border border-slate-800 p-5 rounded-2xl relative lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="font-display font-medium text-slate-100 text-sm">
                {lang === 'EN' ? "Federal Roster Export & Sync Engine" : "ወደ ሀገር አቀፍ የትምህርት መረጃ ማዕከል መላኪያ"}
              </h3>
              <p className="text-xs text-slate-550 font-sans">
                {lang === 'EN' 
                  ? "Extract, sanitize, and coordinate certified student profile dossiers (scores, attendance, conduct) for electronic broadcast to the MoE Central archives."
                  : "የተማሪዎችን የትምህርት ውጤት፣ ባህሪ እና አጠቃላይ መረጃዎችን አጣርተው ወደ ማዕከላዊ የትምህርት ሚኒስቴር መረጃ ቋት ይላኩ።"}
              </p>
            </div>

            {/* Select Target Roster Grade Range */}
            <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-800/60 space-y-3">
              <label className="block text-[11px] text-amber-500 font-extrabold uppercase tracking-wide">
                {lang === 'EN' ? "Step 1: Nominate Grade Roster Levels to Process" : "ደረጃ ፩ ፤ ለመላክ የተዘጋጁ የክፍል ደረጃዎችን ይምረጡ"}
              </label>
              
              <div className="flex flex-wrap gap-2.5">
                {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(grade => {
                  const isSelected = selectedGrades.includes(grade);
                  return (
                    <button
                      key={grade}
                      onClick={() => toggleGradeSelectedForSync(grade)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-600/10 text-amber-500 border-amber-600/35 font-bold shadow-xs' 
                          : 'bg-[#16181D] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // handled by button click
                        className="accent-amber-600 h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 pointer-events-none" 
                      />
                      <span>{grade}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                * {lang === 'EN' ? "Note: Grades 8 & 12 represent Ethiopian National exam levels and are prioritized automatically for MoE registration code assignments." : "* ማሳሰቢያ ፤ ፰ኛ እና ፲፪ኛ ክፍሎች የሀገር አቀፍ ፈተና የሚወስዱ በመሆናቸው ቅድሚያ ይሰጣቸዋል።"}
              </p>
            </div>

            {/* Synchronize Action Block */}
            <div className="space-y-3">
              <label className="block text-[11px] text-amber-500 font-extrabold uppercase tracking-wide">
                {lang === 'EN' ? "Step 2: Stream Data & Interconnect Terminal" : "ደረጃ ፪ ፤ ከማዕከላዊ መረጃ ማዕከል ጋር ግንኙነት መፍጠር"}
              </label>
              
              {isSyncing ? (
                <div className="bg-[#16181D] border border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-amber-500" />
                      {syncStep}
                    </span>
                    <span className="font-mono text-amber-500 font-extrabold">{syncProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                    <div 
                      className="bg-amber-600 h-full transition-all duration-300 ease-out"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-550 block font-mono text-right">Focus Academy Registry TLS v1.3 • Connected</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCentralExportAndSync}
                    className="flex-1 bg-amber-600 hover:bg-amber-550 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-amber-600/10 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={15} />
                    <span>{lang === 'EN' ? "Compile & Transmit students payload" : "የተማሪዎችን መረጃ አጠናቅር እና ላክ"}</span>
                  </button>

                  <button
                    onClick={downloadBackupJSON}
                    className="py-3.5 px-4 bg-[#16181D] hover:bg-slate-800/85 border border-slate-800 text-slate-350 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>{lang === 'EN' ? "Export Backup Spreadsheet" : "JSON ሰነድ አውርድ"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Last Synchronization receipt details */}
            {lastSyncResult ? (
              <div className="p-4 bg-slate-950/40 border border-emerald-900/30 rounded-xl space-y-3">
                <div className="flex items-center gap-1.8 text-emerald-500 font-bold text-xs">
                  <CheckCircle2 size={16} />
                  <span>{lang === 'EN' ? "Payload Transmitted Successfully" : "መረጃው በተሳካ ሁኔታ ተላልፏል"}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans font-extrabold">{lang === 'EN' ? "Terminal Time" : "የተላከበት ሰዓት"}</span>
                    <span className="text-slate-300 font-bold">{lastSyncResult.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans font-extrabold">{lang === 'EN' ? "Roster Count" : "የተማሪዎች ብዛት"}</span>
                    <span className="text-slate-300 font-bold">{lastSyncResult.processedCount} students</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans font-extrabold">{lang === 'EN' ? "Promoted count" : "ያለፉ"}</span>
                    <span className="text-emerald-400 font-extrabold">{lastSyncResult.passed} / {lastSyncResult.processedCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans font-extrabold">{lang === 'EN' ? "MoE Hash Receipt" : "የምስክር ወረቅ ቁጥር"}</span>
                    <span className="text-amber-500 font-bold truncate">{lastSyncResult.hash}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl flex items-center gap-2.5 text-slate-500 text-xs text-center justify-center py-5 font-sans italic">
                <Clock size={14} />
                <span>{lang === 'EN' ? "No data has been compiled yet in active administrative block. Choose grades above first." : "ውሂብ አልተላከም ፤ የክፍል ደረጃዎችን መርጠው ይጀምሩ።"}</span>
              </div>
            )}

          </div>

          {/* Sync Stats Highlights */}
          <div className="space-y-6">
            <div className="bg-[#111318] border border-slate-800 p-5 rounded-2xl space-y-4">
              <h4 className="font-display font-medium text-slate-100 text-xs uppercase tracking-wider text-amber-500">
                {lang === 'EN' ? "National Information Summary" : "አጠቃላይ የትምህርት መረጃ ቅኝት"}
              </h4>

              <div className="space-y-3 pt-1">
                <div className="p-3 bg-slate-950/25 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{lang === 'EN' ? "Eligible Roster Total" : "የተማሪዎች ድምር"}</span>
                  <span className="font-bold text-slate-200 font-mono text-sm">{students.length}</span>
                </div>
                <div className="p-3 bg-slate-950/25 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{lang === 'EN' ? "National Standard Grade System" : "ብሔራዊ የደረጃ ሚዛን"}</span>
                  <span className="font-bold text-amber-500 font-sans text-xs">MoE standards</span>
                </div>
                <div className="p-3 bg-slate-950/25 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{lang === 'EN' ? "Grade 8 Candidate Roster" : "የ፰ኛ ክፍል ተፈታኞች"}</span>
                  <span className="font-bold text-slate-200 font-mono text-sm">
                    {students.filter(s => s.grade === 'Grade 8').length}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#111318] border border-amber-900/40 rounded-xl">
                <div className="flex gap-2 text-amber-500 text-xs font-bold items-center">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{lang === 'EN' ? "Academic Deadlines" : "የማጠናቀቂያ ቀኖች"}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 font-sans">
                  {lang === 'EN' 
                    ? "In accordance with Ethiopian MoE registry rules, candidate registrations for terminal levels must be coordinated before the Semester 2 evaluation close."
                    : "ለትምህርት ሚኒስቴር የሚላኩ የፈተና መመዝገቢያ ሰነዶች የ2ኛ ሰሚስተር ማጠቃለያ ከመደረጉ በፊት መላክ አለባቸው።"}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. Teachers Key Codes Section */}
      {activeSubTab === 'TeachersCodes' && (
        <div className="bg-[#111318] border border-slate-800 p-5 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-display font-medium text-slate-100 text-sm">
                {lang === 'EN' ? "Faculty Authorization Codes Directory" : "የመምህራን ማረጋገጫ መለያ ቁጥሮች ዝርዝር"}
              </h3>
              <p className="text-xs text-slate-550 font-sans">
                {lang === 'EN' 
                  ? "Track, modify, and assign authorization codes ('Teachers Codes') which faculty use as rapid codes for terminal grading approvals and sandbox logins."
                  : "መምህራን ወደ ስርዓቱ በቀላሉ ለመግባት እና ውጤት በሚያረጋግጡበት ጊዜ የሚጠቀሙባቸውን ('Teachers Codes') መለያ ቁጥሮች እዚህ መቆጣጠር ይችላሉ።"}
              </p>
            </div>

            <button
              onClick={handleRegenerateCodes}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-550 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all self-start cursor-pointer hover:shadow-lg hover:shadow-amber-600/10 active:scale-95 shrink-0"
            >
              <RefreshCw size={13} />
              <span>{lang === 'EN' ? "Regenerate Certified Codes" : "አዲስ ኮድ በጅምላ ቀይር"}</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-550">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder={lang === 'EN' ? "Search teacher or subject..." : "መምህራንን ፈልግ..."}
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              className="w-full bg-[#16181D] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-600 transition-colors"
            />
          </div>

          {/* Teachers Codes list Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-805 text-left text-xs text-slate-550 font-semibold bg-slate-950/20">
                  <th className="p-4">{lang === 'EN' ? "Certified Teacher" : "ስም"}</th>
                  <th className="p-4">{lang === 'EN' ? "Specialization Subject" : "ክልል ዓይነት"}</th>
                  <th className="p-4">{lang === 'EN' ? "Assigned Classes" : "ክፍሎች"}</th>
                  <th className="p-4">{lang === 'EN' ? "Unique Access Code" : "የመለያ ቁጥር"}</th>
                  <th className="p-4 text-center">{lang === 'EN' ? "Action Actions" : "ተግባር"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-805 text-xs text-slate-300">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-950/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-500 overflow-hidden shrink-0 border border-slate-750">
                          {teacher.photoUrl ? (
                            <img src={teacher.photoUrl} alt={teacher.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            teacher.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block">{teacher.name}</span>
                          <span className="text-[10px] text-slate-550 block font-mono">{teacher.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-350">{teacher.specialization || "Generalist"}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-amber-500 font-semibold rounded-md uppercase tracking-wider">
                        {teacher.assignedGrades?.join(', ') || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Key size={12} className="text-indigo-400 shrink-0" />
                        <span className="font-mono font-black text-indigo-400 tracking-widest text-xs bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.8 rounded-md">
                          {teacher.teacherCode || "TCH-9051"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleSingleRegen(teacher.id)}
                        className="p-1 px-2.5 rounded-lg bg-indigo-950/20 hover:bg-indigo-650/10 border border-indigo-900/35 hover:border-indigo-600 font-bold font-sans text-[10px] text-indigo-400 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        {lang === 'EN' ? "Regen Key" : "ቀይር"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-550 italic">
                      {lang === 'EN' ? "No certified teachers matches keyword." : "የተፈለገው መምህር አልተገኘም።"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. System Parameter lock configs */}
      {activeSubTab === 'SystemSettings' && (
        <div className="bg-[#111318] border border-slate-800 p-5 rounded-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-medium text-slate-100 text-sm">
              {lang === 'EN' ? "Central Academic Roster & Standard Parameters" : "ማዕከላዊ የትምህርት መመሪያ ደንቦች"}
            </h3>
            <p className="text-xs text-slate-550 font-sans">
              {lang === 'EN' 
                ? "Establish administrative locks, minimum evaluation thresholds, parent view settings, and curriculum guidelines."
                : "በትምህርት ቤቱ መማር ማስተማር ሒደት እና ውጤት አሰጣጥ ላይ የሚሰሩ ገደቦችን እዚህ ያቅዱ።"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-sans">
            
            {/* GPA Threshold Slide config */}
            <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{lang === 'EN' ? "Minimum Passing Benchmark" : "የዝቅተኛ ማለፊያ ውጤት"}</span>
                <span className="text-xs font-black text-amber-500 font-mono bg-amber-500/10 border border-amber-600/20 px-2 py-0.5 rounded-md">{minimumPassingScore}%</span>
              </div>
              <input 
                type="range" 
                min={40} 
                max={75} 
                value={minimumPassingScore} 
                onChange={(e) => {
                  setMinimumPassingScore(Number(e.target.value));
                  triggerToast(lang === 'EN' ? `Passing benchmark adjusted to ${e.target.value}%!` : `የማለፊያ ውጤት ወደ ${e.target.value}% ተቀይሯል!`);
                }}
                className="w-full h-1.5 bg-slate-805 rounded-lg appearance-none cursor-pointer accent-amber-600" 
              />
              <p className="text-[10px] text-slate-500">
                {lang === 'EN' ? "Students scoring below this cumulative raw percentage in any curriculum block will fail and repeating criteria triggers automatically." : "አጠቃላይ አማካኝ ውጤታቸው ከዚህ በታች የሆኑ ልጆች እንደማያልፉ ተደርገው በሲስተሙ ይወሰናሉ።"}
              </p>
            </div>

            {/* Toggle score input locks */}
            <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{lang === 'EN' ? "Lock Parent View Screen" : "ለወላጆች ውጤት አትሳታይ"}</span>
                <button
                  onClick={() => {
                    setIsParentPortalLock(!isParentPortalLock);
                    triggerToast(isParentPortalLock ? "Parent portal unlocked!" : "Parent portal locked!");
                  }}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                    isParentPortalLock 
                      ? 'bg-red-950/30 text-red-400 border-red-900/50' 
                      : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                  }`}
                >
                  {isParentPortalLock ? "LOCKED" : "UNLOCKED"}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {lang === 'EN' ? "Toggling this hides final exam rankings and report cards from parent dashboards until administrative approval registers." : "ይህ ሲበራ ወላጆች የልጆቻቸውን የፈተና ውጤት ከመረጃ ቋቱ ማየት አይችሉም።"}
              </p>
            </div>

            {/* Toggle teacher edit rights */}
            <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{lang === 'EN' ? "Teacher Score Modification Rights" : "ለመምህራን ማረም ፍቃድ"}</span>
                <button
                  onClick={() => {
                    setAllowTeacherEditScore(!allowTeacherEditScore);
                    triggerToast(allowTeacherEditScore ? "Modification rights closed!" : "Modification rights active!");
                  }}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                    allowTeacherEditScore 
                      ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' 
                      : 'bg-amber-950/30 text-amber-505 border-amber-900/50'
                  }`}
                >
                  {allowTeacherEditScore ? "PERMITTED" : "RESTRICTED"}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {lang === 'EN' ? "Control if teachers can alter finalized continuous assessment databases or midterm weight margins." : "ይህ ሲጠፋ መምህራን ቀድሞ ያስገቧቸውን የፈተና ውጤቶች መልሰው መቀየር አይፈቀድላቸውም።"}
              </p>
            </div>

            {/* Security Certificate check */}
            <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">{lang === 'EN' ? "School Signature Integrity" : "የፊርማ ማረጋገጫ"}</span>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <Lock size={13} />
                <span>Focus-SSL Signature RSA-2048 Activated</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {lang === 'EN' ? "The current registration identity has been validated for legal print-outs of leaving transcripts." : "ይህ በእያንዳንዱ በትምህርት ቤቱ በሚሰጡ ሰነዶች ላይ ህጋዊ ፊርማ ለማሳረፍ ይረዳል።"}
              </p>
            </div>

            {/* Editable Administrator Credentials Form */}
            <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-slate-850/50 pb-2">
                <Key className="text-amber-500" size={16} />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {lang === 'EN' ? "Change Master Admin & Principal Security Credentials" : "የበላይ ማስተዳደሪያ የይለፍ ቃላት ማስተካከያ"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Super Admin Credentials */}
                <div className="space-y-3 bg-[#111318]/50 p-3 rounded-lg border border-slate-850">
                  <span className="text-[11px] font-bold text-amber-500 block uppercase">
                    {lang === 'EN' ? "Super Admin Account" : "ዋና ሥራ አስኪያጅ መለያ ቁጥር"}
                  </span>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-450 block mb-1">{lang === 'EN' ? "Official Email" : "የኢሜይል አድራሻ"}</label>
                      <input 
                        type="email"
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          triggerToast(lang === 'EN' ? "Super Admin Email updated!" : "ዋና ሥራ አስኪያጅ ኢሜይል ተቀይሯል!");
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-600 rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 block mb-1">{lang === 'EN' ? "Account Password" : "መሳሪያ በይለፍ ቃል"}</label>
                      <input 
                        type="text"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          triggerToast(lang === 'EN' ? "Super Admin Password updated!" : "የይለፍ ቃል ተቀይሯል!");
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-600 rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Principal / Director Credentials */}
                <div className="space-y-3 bg-[#111318]/50 p-3 rounded-lg border border-slate-850">
                  <span className="text-[11px] font-bold text-amber-500 block uppercase">
                    {lang === 'EN' ? "Principal Account" : "ዶ/ር አብርሃም አሰፋ መለያ"}
                  </span>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-450 block mb-1">{lang === 'EN' ? "Official Email" : "የኢሜይል አድራሻ"}</label>
                      <input 
                        type="email"
                        value={principalEmail}
                        onChange={(e) => {
                          setPrincipalEmail(e.target.value);
                          triggerToast(lang === 'EN' ? "Principal Email updated!" : "የመምህራን አለቃ ኢሜይል ተቀይሯል!");
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-600 rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 block mb-1">{lang === 'EN' ? "Account Password" : "መሳሪያ በይለፍ ቃል"}</label>
                      <input 
                        type="text"
                        value={principalPassword}
                        onChange={(e) => {
                          setPrincipalPassword(e.target.value);
                          triggerToast(lang === 'EN' ? "Principal Password updated!" : "የይለፍ ቃል ተቀይሯል!");
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-600 rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-600/10 text-amber-500 p-2.5 text-[10px] rounded-lg border border-amber-600/20 font-sans">
                {lang === 'EN' 
                  ? "✓ System changes apply instantly in local memory. Users can login with these new custom configurations immediately." 
                  : "✓ እነዚህ ለውጦች በቀጥታ ሲስተሙ ላይ ወዲያውኑ ይሰራሉ፤ አሁን bashaashi-ka iyo password-da cusub ayaad ku gali kartaa."}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Audit Log timeline */}
      {activeSubTab === 'AuditLogs' && (
        <div className="bg-[#111318] border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="font-display font-medium text-slate-100 text-sm">
              {lang === 'EN' ? "Unified System Audit Trail Log" : "የቁጥጥር እና የስርዓት እንቅስቃሴዎች"}
            </h3>
            <p className="text-xs text-slate-550 font-sans">
              {lang === 'EN' 
                ? "Live forensic telemetry of catalog configurations, teacher credential changes, and Ministry export operations."
                : "የትምህርት ቤቱን ውሂብ እና ደህንነት የተመለከቱ ማናቸውም እንቅስቃሴዎች በዝርዝር እዚህ ይመዘገባሉ።"}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-slate-950/25 border border-slate-850 hover:bg-slate-900/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      log.level === 'warning' 
                        ? 'bg-amber-600/10 text-amber-500 border border-amber-600/25' 
                        : 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/25'
                    }`}>
                      {log.ev}
                    </span>
                    <span className="text-slate-500 text-[10px] flex items-center gap-1">
                      <Clock size={11} />
                      {log.date}
                    </span>
                  </div>
                  <p className="text-slate-350 text-[11px] font-sans font-medium">{log.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-sans block">{lang === 'EN' ? "Initiating User" : "ፈጻሚው ሰው"}</span>
                  <span className="text-amber-500 font-extrabold text-[11px] font-sans">{log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Data Migration & Import Wizard */}
      {activeSubTab === 'DataMigration' && (
        <div className="bg-[#111318] border border-slate-800 p-6 rounded-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 rounded-md bg-amber-500/10 border border-amber-500/15 text-[10px] font-mono uppercase text-amber-500 tracking-wider">Focus Platform</div>
                <h3 className="font-display font-bold text-slate-100 text-base">
                  {lang === 'EN' ? "Legacy Data Migration & Smart Importer" : "የቀድሞ ዳታ ማዛወሪያና ስማርት ማስገቢያ"}
                </h3>
              </div>
              <p className="text-xs text-slate-550 font-sans">
                {lang === 'EN' 
                  ? "Seamless bulk import engine for Focus Academy. Migrate students, teachers, historical score sheets, and billing rosters."
                  : "በትምህርት ቤቱ የቀደሙ የሰንጠረዥ ሰነዶችን ፣ መምህራንን ፣ የአካዳሚክ ውጤቶችና የክፍያ መረጃዎችን በቀላሉ የሚጭኑበት ማሽን።"}
              </p>
            </div>
          </div>

          {/* Stepper Steps Tracker */}
          <div className="grid grid-cols-4 gap-2 text-xs select-none">
            {([
              { step: 1, label: lang === 'EN' ? "Upload & Designate" : "ጫን እና መዝግብ" },
              { step: 2, label: lang === 'EN' ? "Schema Map" : "ዓምድ ማገናኘት" },
              { step: 3, label: lang === 'EN' ? "Audit & Resolve" : "ማረጋገጫና ሒደት" },
              { step: 4, label: lang === 'EN' ? "Completion Log" : "ማጠቃለያ" }
            ] as const).map((s) => {
              const isDone = migrationStep > s.step;
              const isActive = migrationStep === s.step;
              return (
                <div 
                  key={s.step} 
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                    isActive 
                      ? 'bg-amber-600/10 border-amber-600/50 shadow-sm shadow-amber-500/5' 
                      : isDone 
                        ? 'bg-slate-900 border-emerald-900/30' 
                        : 'bg-slate-950/20 border-slate-850 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isDone 
                        ? 'bg-emerald-500 text-slate-950 font-black' 
                        : isActive 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isDone ? "✓" : s.step}
                    </span>
                    <span className={isActive ? 'text-amber-500' : isDone ? 'text-emerald-500' : 'text-slate-400'}>
                      {lang === 'EN' ? `Step 0${s.step}` : `ደረጃ 0${s.step}`}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200 hidden sm:inline truncate">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: SELECT SOURCE & FILE */}
          {migrationStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Source Selection Panel */}
                <div className="space-y-4 lg:col-span-1">
                  <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                    {lang === 'EN' ? "01. Select Original Source Format" : "፩. የቀድሞ ሰነድ ማዕቀፍ ይምረጡ"}
                  </span>
                  <div className="grid grid-cols-2 gap-2.5 font-sans">
                    {([
                      { id: 'csv', name: 'Comma CSV', desc: 'Raw plain text', style: 'border-cyan-900/20 text-cyan-400 focus:bg-cyan-950/20' },
                      { id: 'excel', name: 'MS xlsx', desc: 'Excel spreadsheet', style: 'border-emerald-950/20 text-emerald-400' },
                      { id: 'sheets', name: 'Google Sheets', desc: 'Direct URL / export', style: 'border-indigo-950/15 text-indigo-400' },
                      { id: 'database', name: 'SQL Dump', desc: 'Direct mysql tables', style: 'border-purple-950/15 text-purple-400' },
                      { id: 'sms', name: 'Legacy SMS', desc: 'Previous portal DB', style: 'border-amber-950/15 text-amber-505' },
                      { id: 'pdf', name: 'Raw student lists', desc: 'Pre-existing print sheets', style: 'border-rose-955/15 text-rose-450' }
                    ] as const).map((source) => (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => {
                          setImportSource(source.id);
                          triggerToast(lang === 'EN' ? `Switched source to ${source.name} mode` : `ወደ ${source.name} ቀይረናል`);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          importSource === source.id 
                            ? 'bg-slate-900 border-slate-750 font-extrabold ring-1 ring-slate-800 text-white' 
                            : 'bg-slate-950/30 border-slate-850 hover:bg-slate-900/20 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold block">{source.name}</span>
                        <span className="text-[9px] text-slate-500 font-sans font-medium leading-none block mt-0.5">{source.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 bg-slate-950/30 border border-slate-850 rounded-xl space-y-1.5 text-xs text-slate-400 font-sans">
                    <span className="font-bold text-slate-200 block">✨ Pro-tip:</span>
                    <span>Columns don't need to match perfectly. Our Intelligent Column Parser maps headings in real-time.</span>
                  </div>
                </div>

                {/* Data Target & Input Box Area */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                      {lang === 'EN' ? "02. Select Destination Model" : "፪. የሚዛወረውን የመረጃ ክፍል ይምረጡ"}
                    </span>
                    
                    {/* Switch Data type */}
                    <div className="flex bg-[#111318] p-1 rounded-lg border border-slate-800 self-start select-none">
                      {([
                        { id: 'students', label: lang === 'EN' ? "Students" : "ተማሪዎች" },
                        { id: 'teachers', label: lang === 'EN' ? "Teachers" : "መምህራን" },
                        { id: 'academics', label: lang === 'EN' ? "Grades / Scores" : "ውጤቶች" },
                        { id: 'finance', label: lang === 'EN' ? "Fee Invoices" : "ክፍያ" }
                      ] as const).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => loadTemplate(t.id)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                            importType === t.id 
                              ? 'bg-amber-600 text-white' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drag and Drop Mock Area or Direct text paste */}
                  <div className="border border-slate-800 bg-slate-950/20 rounded-xl overflow-hidden font-sans space-y-3.5 p-4 relative">
                    
                    {/* Simulated Drag & Drop trigger */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-dashed border-slate-800 p-4 rounded-xl bg-slate-950/40 text-center sm:text-left gap-4">
                      <div>
                        <span className="font-bold text-slate-200 text-xs block">
                          {lang === 'EN' ? `Migrate ${getSourceLabel(importSource)} document` : `ሰነዱን እዚህ ይጎትቱ ወይም ይጫኑ`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Drag & drop sheet or select folder directory</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setCsvTextInput(TEMPLATES[importType]);
                          triggerToast(lang === 'EN' ? `Seeded standard template for ${importType} model!` : `ለ ${importType} የመሞከሪያ ዳታ አዘጋጅተናል!`);
                        }}
                        className="px-3 py-1.5 bg-amber-655 text-slate-950 hover:bg-amber-500 font-black text-xs rounded-lg transition-all transform active:scale-95 flex items-center gap-1 shrink-0 self-center"
                      >
                        ⚡ {lang === 'EN' ? "Load Practice Template" : "ናሙና ጫን"}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                        <span>{lang === 'EN' ? "Or Paste spreadsheet raw CSV columns text below:" : "ወይም የሰንጠረዡን ምስል ጽሁፍ እዚህ ጋር ይቅዱ ፤"}</span>
                        <span className="font-mono text-[10px] text-slate-550">comma parsed UTF-8 data format</span>
                      </div>
                      <textarea
                        value={csvTextInput}
                        onChange={(e) => setCsvTextInput(e.target.value)}
                        placeholder={`Student ID,Full Name,Roll No,Gender,Grade,Section...\nstd-1,Yonas Bekele,Roll-001,Male,Grade 8,A`}
                        className="w-full h-44 bg-[#0a0c10] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-350 focus:outline-none focus:border-slate-700 resize-none"
                      />
                    </div>
                  </div>

                  {/* Actions bar step 1 */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleProcessStep1}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-amber-900/10 active:scale-95 transition-all text-sans"
                    >
                      {lang === 'EN' ? "Map Imported Columns" : "ዓምዶችን አስተካክል"} ➙
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: COLUMN SCHEMA TUNING */}
          {migrationStep === 2 && (
            <div className="space-y-6">
              
              <div className="bg-slate-950/20 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 select-none font-bold">🛠</div>
                <div className="space-y-1 font-sans">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">{lang === 'EN' ? "Smart Schema Auto-Mapper" : "ዓምዶችን የማያያዣ ሒደት ማቀናጃ"}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    We matched the spreadsheet headings on the left with our Standard Database Target Fields. Unmatched fields default to empty values. Adjust any incorrect pairings below.
                  </p>
                </div>
              </div>

              {/* Dynamic Mapping List */}
              <div className="border border-slate-800 rounded-xl bg-[#0e1014] p-4 font-sans space-y-4">
                <div className="grid grid-cols-12 gap-4 pb-2.5 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <div className="col-span-12 sm:col-span-5">{lang === 'EN' ? "Database Target Field" : "በትምህርት ቤቱ ሲስተም መለያ"}</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">Status</div>
                  <div className="col-span-12 sm:col-span-5">{lang === 'EN' ? "Matched Spreadsheet Column" : "የማስገቢያው ሰነድ ዓምድ መለያ"}</div>
                </div>

                <div className="space-y-2.5">
                  {getStandardFields().map((field) => {
                    const isMapped = !!columnMappings[field.key];
                    return (
                      <div 
                        key={field.key} 
                        className={`grid grid-cols-12 gap-3 items-center p-3 rounded-xl border transition-all ${
                          isMapped 
                            ? 'bg-slate-900/40 border-slate-800' 
                            : 'bg-slate-950/20 border-slate-850/50 opacity-80'
                        }`}
                      >
                        {/* Target field name */}
                        <div className="col-span-12 sm:col-span-5 space-y-0.5">
                          <span className="font-bold text-xs text-slate-200 flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-red-500 font-bold">*</span>}
                          </span>
                          <span className="text-[9.5px] text-slate-500 block font-mono">key: {field.key}</span>
                        </div>

                        {/* Status bar badge */}
                        <div className="hidden sm:block sm:col-span-2 text-center">
                          {isMapped ? (
                            <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                              ✓ MAPPED
                            </span>
                          ) : (
                            <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 bg-slate-900 text-slate-500 rounded">
                              UNMAPPED
                            </span>
                          )}
                        </div>

                        {/* Selector drop-down */}
                        <div className="col-span-12 sm:col-span-5">
                          <select
                            value={columnMappings[field.key] || ''}
                            onChange={(e) => {
                              setColumnMappings({
                                ...columnMappings,
                                [field.key]: e.target.value
                              });
                            }}
                            className="w-full bg-[#111318] border border-slate-800 focus:border-slate-650 hover:border-slate-700 text-xs text-slate-300 font-sans p-2 rounded-xl focus:outline-none cursor-pointer"
                          >
                            <option value="">-- {lang === 'EN' ? "Do Not Map (Ignore Field)" : "አያያዝ ይለፍ / ባዶ ይሁን"} --</option>
                            {parsedHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stepper buttons 2 */}
              <div className="flex items-center justify-between font-sans">
                <button
                  type="button"
                  onClick={() => setMigrationStep(1)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-820 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all text-sans"
                >
                  ← {lang === 'EN' ? "Back to Upload" : "ወደኋላ መመለሻ"}
                </button>

                <button
                  type="button"
                  onClick={handleProcessStep2}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:shadow-lg active:scale-95 transition-all text-sans"
                >
                  {lang === 'EN' ? "Validate & Audit Records" : "ቀጣይ ደረጃ ፤ ዳታ መመርመሪያ"} ➙
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: AUDIT & INLINE RESOLUTION */}
          {migrationStep === 3 && (
            <div className="space-y-6">
              
              {/* Conflict Resolution Settings & summary widgets */}
              <div className="bg-[#0e1014] border border-slate-800 rounded-xl p-4 space-y-4 font-sans">
                
                {/* Mode Selector and duplicate settings */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">{lang === 'EN' ? "Duplicate Records Strategy" : "የተደጋገሙ መረጃዎችን መፍቻ ስትራቴጂ"}</span>
                    <p className="text-[10px] text-slate-500 font-sans leading-none">{lang === 'EN' ? "What should happen when an imported ID already exists?" : "ማንነታቸው ቀድሞ በሲስተሙ ተመዝግቦ የተገኘ ሰዎችን ምን እናድርግ?"}</p>
                  </div>

                  <div className="flex bg-[#111318] p-1 rounded-lg border border-slate-800 shrink-0 select-none text-[11px]">
                    {([
                      { id: 'merge', label: lang === 'EN' ? "Merge & Bulk Update" : "አዋህድና አድስ" },
                      { id: 'ignore', label: lang === 'EN' ? "Generate New Keys" : "አዲስ መለያ ፍጠር" },
                      { id: 'skip', label: lang === 'EN' ? "Skip Duplicates" : "አትመዝግብ (ዝለል)" }
                    ] as const).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setConflictResolution(r.id);
                          triggerToast(`Conflict resolution: ${r.label}`);
                        }}
                        className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                          conflictResolution === r.id 
                            ? 'bg-amber-600 text-white font-bold' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Validation summary numbers row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">{lang === 'EN' ? "Total In File" : "በሰነዱ ውስጥ ያለው"}</span>
                    <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">{validatedRows.length}</span>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">{lang === 'EN' ? "Healthy Valid" : "ትክክለኛ ሪከርዶች"}</span>
                    <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                      {validatedRows.filter(r => r._status === 'valid').length}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">{lang === 'EN' ? "Conflict Duplicates" : "የተደጋገሙ ስሞች"}</span>
                    <span className="text-xl font-bold font-mono text-amber-505 mt-1 block">
                      {validatedRows.filter(r => r._isDuplicate).length}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <span className="text-[10px] uppercase font-black text-slate-500 block leading-none">{lang === 'EN' ? "Errors Found" : "ስህተት የተገኘባቸው"}</span>
                    <span className="text-xl font-bold font-mono text-red-400 mt-1 block">
                      {validatedRows.filter(r => r._status === 'invalid').length}
                    </span>
                  </div>
                </div>

              </div>

              {/* Spreadsheet Audit Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block font-sans">
                    {lang === 'EN' ? "Interactive Migration Audit Board (Double-click any cell to resolve inline)" : "መረጃ ማረጋገጫና ሒሳብ ሠንጠረዥ ፤ ሴሎችን በመጫን እዚህ ማረም ይችላሉ"}
                  </span>
                  {validatedRows.some(r => r._status === 'invalid') && (
                    <div className="text-[10px] text-red-400 font-bold flex items-center gap-1 font-sans">
                      ⚠️ Contains formats and constraints errors that must be edited.
                    </div>
                  )}
                </div>

                <div className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
                  <div className="overflow-x-auto max-w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-[10.5px] font-bold text-slate-400 uppercase font-sans">
                          <th className="p-3 w-16">{lang === 'EN' ? "Row" : "ተ.ቁ"}</th>
                          <th className="p-3 w-32">Status</th>
                          <th className="p-3 w-36">ID Code</th>
                          <th className="p-3 w-48">Primary Name</th>
                          {importType === 'students' && (
                            <>
                              <th className="p-3 w-28">Class / Grade</th>
                              <th className="p-3 w-24">Section</th>
                              <th className="p-3 w-32">Roll Number</th>
                              <th className="p-3 w-32">Attendance</th>
                            </>
                          )}
                          {importType === 'teachers' && (
                            <>
                              <th className="p-3 w-48">Email Address</th>
                              <th className="p-3 w-32">Specialization</th>
                              <th className="p-3 w-28">Teacher Pin</th>
                            </>
                          )}
                          {importType === 'academics' && (
                            <>
                              <th className="p-3 w-32">Course Subject</th>
                              <th className="p-3 w-20">Quiz (15)</th>
                              <th className="p-3 w-20">Asg (15)</th>
                              <th className="p-3 w-20">Midterm (20)</th>
                              <th className="p-3 w-20">Final (40)</th>
                            </>
                          )}
                          {importType === 'finance' && (
                            <>
                              <th className="p-3 w-40">Fee Category</th>
                              <th className="p-3 w-28">Total Assigned</th>
                              <th className="p-3 w-28">Collected Birr</th>
                            </>
                          )}
                          <th className="p-3 w-56">Diagnostic Audit Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-350 font-mono text-[11px]">
                        {validatedRows.map((row, idx) => {
                          const hasErr = row._errors.length > 0;
                          const isWarning = row._status === 'warning';
                          return (
                            <tr 
                              key={row._rowIdx} 
                              className={`hover:bg-slate-900/20 transition-colors ${
                                hasErr 
                                  ? 'bg-red-950/10' 
                                  : isWarning 
                                    ? 'bg-amber-950/5' 
                                    : 'bg-transparent'
                              }`}
                            >
                              <td className="p-2.5 font-bold text-center text-slate-500 w-16">
                                {idx + 1}
                              </td>

                              {/* Status flag */}
                              <td className="p-2.5 w-32">
                                {hasErr ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-red-650/15 border border-red-900/30 text-red-400">
                                    ERR_BLOCK
                                  </span>
                                ) : isWarning ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-amber-600/10 border border-amber-600/20 text-amber-505">
                                    DUPLICATE
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-emerald-600/10 border border-emerald-600/20 text-emerald-400">
                                    VERIFIED
                                  </span>
                                )}
                              </td>

                              {/* ID Code (mutable) */}
                              <td className="p-1.5 w-32">
                                <input
                                  type="text"
                                  value={row.id || row.studentId || ''}
                                  onChange={(e) => handleUpdateRecordInline(row._rowIdx, importType === 'students' || importType === 'teachers' ? 'id' : 'studentId', e.target.value)}
                                  className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200 focus:border-slate-650 focus:outline-none"
                                />
                              </td>

                              {/* Primary Name */}
                              <td className="p-1.5 w-48 font-sans font-medium">
                                <input
                                  type="text"
                                  value={row.name || row.studentName || ''}
                                  onChange={(e) => handleUpdateRecordInline(row._rowIdx, importType === 'finance' ? 'studentName' : 'name', e.target.value)}
                                  className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200 focus:border-slate-650 focus:outline-none font-sans"
                                />
                              </td>

                              {/* Student dynamic cells */}
                              {importType === 'students' && (
                                <>
                                  <td className="p-1.5 w-28">
                                    <input
                                      type="text"
                                      value={row.grade || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'grade', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-slate-650"
                                    />
                                  </td>
                                  <td className="p-1.5 w-24">
                                    <input
                                      type="text"
                                      value={row.section || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'section', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-slate-650 text-center"
                                    />
                                  </td>
                                  <td className="p-1.5 w-32">
                                    <input
                                      type="text"
                                      value={row.rollNo || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'rollNo', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-slate-650"
                                    />
                                  </td>
                                  <td className="p-1.5 w-32">
                                    <input
                                      type="text"
                                      value={row.attendanceRatio !== undefined ? row.attendanceRatio : ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'attendanceRatio', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-slate-650 text-center"
                                    />
                                  </td>
                                </>
                              )}

                              {/* Teachers dynamic cells */}
                              {importType === 'teachers' && (
                                <>
                                  <td className="p-1.5 w-48">
                                    <input
                                      type="text"
                                      value={row.email || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'email', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-slate-650 text-slate-400"
                                    />
                                  </td>
                                  <td className="p-1.5 w-32">
                                    <input
                                      type="text"
                                      value={row.specialization || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'specialization', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                                    />
                                  </td>
                                  <td className="p-1.5 w-28">
                                    <input
                                      type="text"
                                      value={row.teacherCode || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'teacherCode', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] text-center text-indigo-400 focus:outline-none"
                                    />
                                  </td>
                                </>
                              )}

                              {/* Academics dynamic cells */}
                              {importType === 'academics' && (
                                <>
                                  <td className="p-1.5 w-32">
                                    <input
                                      type="text"
                                      value={row.subjectName || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'subjectName', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5. py-1 text-[11px] focus:outline-none"
                                    />
                                  </td>
                                  <td className="p-1.5 w-20">
                                    <input
                                      type="text"
                                      value={row.quizzes !== undefined ? row.quizzes : ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'quizzes', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1 py-1 text-[11px] text-center"
                                    />
                                  </td>
                                  <td className="p-1.5 w-20">
                                    <input
                                      type="text"
                                      value={row.assignments !== undefined ? row.assignments : ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'assignments', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1 py-1 text-[11px] text-center"
                                    />
                                  </td>
                                  <td className="p-1.5 w-20">
                                    <input
                                      type="text"
                                      value={row.midtermScore !== undefined ? row.midtermScore : ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'midtermScore', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1 py-1 text-[11px] text-center"
                                    />
                                  </td>
                                  <td className="p-1.5 w-20">
                                    <input
                                      type="text"
                                      value={row.finalScore !== undefined ? row.finalScore : ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'finalScore', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1 py-1 text-[11px] text-center"
                                    />
                                  </td>
                                </>
                              )}

                              {/* Finance dynamic cells */}
                              {importType === 'finance' && (
                                <>
                                  <td className="p-1.5 w-40">
                                    <input
                                      type="text"
                                      value={row.feeType || ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'feeType', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px]"
                                    />
                                  </td>
                                  <td className="p-1.5 w-28">
                                    <input
                                      type="text"
                                      value={row.amount !== undefined ? row.amount : ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'amount', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] text-right"
                                    />
                                  </td>
                                  <td className="p-1.5 w-28">
                                    <input
                                      type="text"
                                      value={row.paidAmount !== undefined ? row.paidAmount : ''}
                                      onChange={(e) => handleUpdateRecordInline(row._rowIdx, 'paidAmount', e.target.value)}
                                      className="w-full bg-[#07090d] border border-slate-800 rounded px-1.5 py-1 text-[11px] text-right"
                                    />
                                  </td>
                                </>
                              )}

                              {/* Diagnostic Remarks */}
                              <td className="p-2.5 w-56 font-sans">
                                {hasErr ? (
                                  <span className="text-[10px] text-red-400 font-bold block leading-relaxed">
                                    ⚠️ {row._errors.join(', ')}
                                  </span>
                                ) : isWarning ? (
                                  <span className="text-[10px] text-amber-500 font-bold block leading-relaxed">
                                    ⚡ {row._warnings.join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-emerald-500 font-semibold block">
                                    ✓ Integrity cleared & verified
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Stepper buttons 3 */}
              <div className="flex items-center justify-between font-sans">
                <button
                  type="button"
                  onClick={() => setMigrationStep(2)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-820 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all text-sans"
                >
                  ← {lang === 'EN' ? "Back to Mapping" : "ወደኋላ መመለሻ"}
                </button>

                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={validatedRows.some(r => r._status === 'invalid' && conflictResolution !== 'ignore')}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-900/10 active:scale-95 transition-all text-sans"
                >
                  📥 {lang === 'EN' ? "Finalize & Import to Database" : "አረጋግጥና አስገባ"}
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: PROCESSING / SUCCESS COMPLETE SCREEN */}
          {migrationStep === 4 && (
            <div className="space-y-6">
              
              {/* Active loader simulation */}
              {isMigrating || migrationProgress < 100 ? (
                <div className="bg-[#0e1014] border border-slate-800 p-8 rounded-xl text-center space-y-6 font-sans">
                  
                  <div className="flex justify-center select-none">
                    <RefreshCw size={36} className="text-amber-500 animate-spin" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <span className="text-base font-bold text-slate-200 block">
                      {lang === 'EN' ? "Active Relational DB Injection" : "መረጃው በሲስተሙ እየተዋሃደ ነው ፤"}
                    </span>
                    <span className="text-xs text-slate-500 font-mono block">Import Progress: {migrationProgress}%</span>
                    
                    {/* Progress track */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className="h-full bg-amber-600 transition-all duration-300" 
                        style={{ width: `${migrationProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Log console container */}
                  <div className="max-w-xl mx-auto bg-slate-950 text-left font-mono rounded-xl border border-slate-850 p-4 h-36 overflow-y-auto text-[11px] text-amber-500 space-y-1">
                    {migrationLogs.map((logStr, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2">
                        <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                        <span>{logStr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Completion Report Panel */
                <div className="bg-[#0e1014] border border-slate-800 p-8 rounded-xl text-center space-y-6 font-sans">
                  
                  <div className="flex justify-center select-none">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-bounce">
                      ✓
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-100 text-base">{lang === 'EN' ? "Database Record Synchronization Completed!" : "ዳታ ከሲስተሙ ጋር በተሳካ ሁኔታ ተዋህዷል!"}</h4>
                    <p className="text-xs text-slate-500 font-sans">{lang === 'EN' ? "All validated records are actively searchable inside the main rosters." : "ሁሉም የተጫኑ መረጃዎች በትክክል ተቀምጠዋል ፤ በመረጃ መፈለጊያው ላይ ማግኘት ይችላሉ።"}</p>
                  </div>

                  {/* Summary grid details */}
                  {migrationCompletedSummary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto text-xs">
                      <div className="p-3 bg-slate-955 border border-slate-850 rounded-xl">
                        <span className="text-slate-500 uppercase font-bold tracking-wider text-[9px] block">Processed Records</span>
                        <span className="text-lg font-mono font-black text-slate-300 mt-1 block">{migrationCompletedSummary.total}</span>
                      </div>
                      <div className="p-3 bg-emerald-950/15 border border-emerald-900/15 rounded-xl">
                        <span className="text-emerald-500 uppercase font-bold tracking-wider text-[9px] block">New Profiles Added</span>
                        <span className="text-lg font-mono font-black text-emerald-400 mt-1 block">+{migrationCompletedSummary.added}</span>
                      </div>
                      <div className="p-3 bg-indigo-950/15 border border-indigo-900/15 rounded-xl">
                        <span className="text-indigo-400 uppercase font-bold tracking-wider text-[9px] block">Profiles Updated / Merged</span>
                        <span className="text-lg font-mono font-black text-indigo-400 mt-1 block">+{migrationCompletedSummary.updated}</span>
                      </div>
                      <div className="p-3 bg-red-955 border border-slate-850 rounded-xl">
                        <span className="text-slate-500 uppercase font-bold tracking-wider text-[9px] block">Bypassed Errors</span>
                        <span className="text-lg font-mono font-black text-slate-400 mt-1 block">{migrationCompletedSummary.skipped}</span>
                      </div>
                    </div>
                  )}

                  {/* Option actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMigrationStep(1);
                        setCsvTextInput('');
                        setMigrationCompletedSummary(null);
                      }}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-820 text-slate-350 hover:text-white font-bold text-xs rounded-xl active:scale-95 transition-all text-sans"
                    >
                      🔄 {lang === 'EN' ? "Import Dynamic Dataset" : "ሌላ ሰነድ ማዛወሪያ"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubTab('AuditLogs');
                      }}
                      className="px-4 py-2 bg-[#1a1711] border border-amber-600/20 hover:border-amber-500 text-amber-505 font-semibold text-xs rounded-xl active:scale-95 transition-all text-sans"
                    >
                      🛡️ {lang === 'EN' ? "View Audit Log Entry" : "የደህንነት እንቅስቃሴ መዝገብ"}
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* 6. Fee Administration & Secure Codes */}
      {activeSubTab === 'FeeAdmin' && (
        <div className="space-y-6">
          <div className="bg-[#111318] border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
            {/* Tab Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2.5 rounded-md bg-rose-500/10 border border-rose-500/15 text-[10px] font-mono uppercase text-rose-400 tracking-wider">Security Vault</div>
                  <h3 className="font-display font-medium text-slate-100 text-base">
                    {lang === 'EN' ? "Bursar Security Console & Key Management" : "የበጀት አስተዳደር የቁልፍ እና ደህንነት መቆጣጠሪያ ማዕከል"}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  {lang === 'EN' 
                    ? "Manage financial portal security. Configure active Bursar identities, alter strict 4-digit system access passcodes, toggle emergency lockout, and audit authorized reference codes."
                    : "የትምህርት ቤቱን ክፍያ አስተዳዳሪዎችን ይመዝግቡ፣ ባለ 4-አሃዝ መግቢያ ኮዱን ይቀይሩ፣ የደህንነት እገዳ ያውጡ እንዲሁም የባንክ መግቢያ ኮዶችን እዚህ ይከታተሉ።"}
                </p>
              </div>
            </div>

            {/* Core Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Panel: Passcode & Emergency Lock */}
              <div className="space-y-6 lg:col-span-5 font-sans">
                <div className="bg-[#0e1014] border border-slate-850 p-5 rounded-xl space-y-4 font-sans">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                      {lang === 'EN' ? "Authorization Passcode (PIN)" : "የበጀት መግቢያ ፈቃድ ኮድ"}
                    </span>
                  </div>

                  <div className="space-y-3.5 bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-black text-slate-500 block leading-none tracking-wider">
                      {lang === 'EN' ? "Active System Entry Passcode" : "አሁን የሚሰራው የይለፍ ኮድ"}
                    </span>
                    <div className="text-3xl font-mono font-extrabold text-amber-500 tracking-widest py-1.5 bg-slate-900 border border-slate-805 rounded-xl max-w-[160px] mx-auto select-all">
                      {bursarPasscode}
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
                          setBursarPasscode(randomCode);
                          setAuditLogs([
                            {
                              id: `log-${Date.now()}`,
                              ev: "BURSAR_PASSCODE_REGEN",
                              user: "Principal Admin",
                              desc: `Regenerated secure 4-digit passcode, new active: ${randomCode}`,
                              date: new Date().toISOString().substring(0, 10) + " " + new Date().toTimeString().split(' ')[0],
                              level: "warning"
                            },
                            ...auditLogs
                          ]);
                          triggerToast(lang === 'EN' ? `Bursar passcode changed to ${randomCode}!` : `የበጀት መግቢያ ኮድ ወደ ${randomCode} ተቀይሯል!`);
                        }}
                        className="px-3 py-1.5 bg-[#1a1c22] hover:bg-[#252830] border border-slate-800 text-slate-300 hover:text-white font-semibold text-[10.5px] rounded-lg transition-all active:scale-95 cursor-pointer"
                      >
                        🎲 {lang === 'EN' ? "Randomize" : "በዕድል ቀይር"}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const custom = prompt(lang === 'EN' ? "Enter custom 4-digit system passcode (Numbers Only):" : "እባክዎ ባለ 4-አሃዝ ቁጥር የይለፍ ቃል ያስገቡ፡", bursarPasscode);
                          if (custom !== null) {
                            if (/^\d{4}$/.test(custom)) {
                              setBursarPasscode(custom);
                              setAuditLogs([
                                {
                                  id: `log-${Date.now()}`,
                                  ev: "BURSAR_PASSCODE_CUSTOM",
                                  user: "Principal Admin",
                                  desc: `Custom changed secure 4-digit passcode: ${custom}`,
                                  date: new Date().toISOString().substring(0, 10) + " " + new Date().toTimeString().split(' ')[0],
                                  level: "warning"
                                },
                                ...auditLogs
                              ]);
                              triggerToast(lang === 'EN' ? `Custom passcode set to ${custom}!` : `የይለፍ ቃል ወደ ${custom} ተቀይሯል!`);
                            } else {
                              alert(lang === 'EN' ? "Invalid input! Passcode must be exactly 4 digits containing numbers only." : "ስህተት! የይለፍ ቃሉ በትክክል 4 አሃዝ ቁጥር መሆን አለበት።");
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10.5px] rounded-lg transition-all active:scale-95 cursor-pointer"
                      >
                        ✍️ {lang === 'EN' ? "Manual edit" : "እራስዎ ይጻፉ"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans">
                    {lang === 'EN' 
                      ? "Keep this passcode highly confidential. Registrars and Finance Bursars must punch this code to modify billing, CBE slip clearances, and payment history logs."
                      : "ይህን ሚስጥራዊ ቁጥር በጥብቅ ይያዙ። ክፍያ ተቀባዮች CBE ወይም ቴሌብር በደረሰኝ ሲያረጋግጡ ይህንን ኮድ ማስገባት አለባቸው።"}
                  </p>
                </div>

                {/* Emergency Lock Switch */}
                <div className="bg-[#0e1014] border border-slate-850 p-5 rounded-xl space-y-4 font-sans">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider block font-sans">
                      {lang === 'EN' ? "EMERGENCY SAFETY DISARM" : "ድንገተኛ የበጀት ሲስተም መቆለፊያ"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border transition-all duration-300 space-y-3 bg-[#161313] border-red-955/50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-200 block">
                          {lang === 'EN' ? "Lock Finance Operations" : "ሲስተሙን በሙሉ ዝጋ"}
                        </span>
                        <span className="text-[9.5px] text-slate-500 block leading-none">
                          {lang === 'EN' ? "Instantly blocks all billing changes" : "ሁሉንም የደረሰኝ ስራዎች ያግዳል"}
                        </span>
                      </div>

                      {/* Cool Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isFinanceLocked;
                          setIsFinanceLocked(nextState);
                          setAuditLogs([
                            {
                              id: `log-${Date.now()}`,
                              ev: nextState ? "FINANCE_PORTAL_LOCKED" : "FINANCE_PORTAL_UNLOCKED",
                              user: "Principal Admin",
                              desc: nextState ? "Remotely suspended entire Finance/Bursar Ledger Terminal access" : "Secured Finance Ledger Terminal restored to Active",
                              date: new Date().toISOString().substring(0, 10) + " " + new Date().toTimeString().split(' ')[0],
                              level: nextState ? "danger" : "info"
                            },
                            ...auditLogs
                          ]);
                          triggerToast(lang === 'EN' ? `Finance Remote Lock is now ${nextState ? 'ON' : 'OFF'}!` : `የበጀት መቆለፊያው ${nextState ? 'በስራ ላይ ነው' : 'ተነስቷል'}!`);
                        }}
                        className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                          isFinanceLocked ? 'bg-red-600' : 'bg-slate-800'
                        }`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                          isFinanceLocked ? "translate-x-6" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-mono justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${isFinanceLocked ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                      <span className={isFinanceLocked ? 'text-red-400 font-bold' : 'text-slate-550'}>
                        {isFinanceLocked ? "SUSPENDED (REMOTE LOCK ON)" : "ONLINE (RELIABLE & SECURE)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Bursar profile and authorized codes directory */}
              <div className="space-y-6 lg:col-span-7 font-sans">
                
                {/* Bursar Identity Profile */}
                <div className="bg-[#0e1014] border border-slate-850 p-5 rounded-xl space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                      {lang === 'EN' ? "01. Active Bursar / Finance Officer" : "፩. የአሁን የክፍያ አስተዳዳሪ ማንነት"}
                    </span>
                    <span className="text-[10px] text-slate-550 font-mono">ID: BSR-ASTER-202</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {lang === 'EN' ? "Senior Bursar Name" : "ዋና ሒሳብ ሹም ስም"}
                      </label>
                      <input
                        type="text"
                        value={bursarName}
                        onChange={(e) => setBursarName(e.target.value)}
                        className="w-full bg-[#111318]/70 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {lang === 'EN' ? "Contact / Official Phone" : "የስራ ስልክ ቁጥር"}
                      </label>
                      <input
                        type="text"
                        defaultValue="+251 922-88-1112"
                        className="w-full bg-[#111318]/70 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 focus:outline-none cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Secure Bank Authorized Receipt Codes */}
                <div className="bg-[#0e1014] border border-slate-850 p-5 rounded-xl space-y-4 font-sans text-slate-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                        {lang === 'EN' ? "Authorized Bank Vouchers & Receipt Keys" : "የባንክ መክፈያ ደህንነት ቁልፎች (CBE / Telebirr)"}
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-none">Pre-authorized parent payment verification keys</span>
                    </div>

                    {/* Quick Code generator */}
                    <button
                      type="button"
                      onClick={() => {
                        const codeType = Math.random() > 0.5 ? "CBE-TX" : "TLR-77";
                        const codeVal = `${codeType}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
                        const studentNames = ["Yonas Bekele", "Mahlet Tesfaye", "Bruh Melese", "Kirubel Hailu", "Salem Kebede"];
                        const studentNameValue = studentNames[Math.floor(Math.random() * studentNames.length)];
                        const feeAmt = [4500, 2000, 1500, 3000][Math.floor(Math.random() * 4)];
                        const valNames = ["Tuition Fee", "Registration Fee", "Sports & Lab Fee", "Stationery Fee"];
                        const category = valNames[Math.floor(Math.random() * valNames.length)];
                        
                        const newKeyObj = {
                          id: `fc-${Date.now()}`,
                          code: codeVal,
                          type: category,
                          valName: studentNameValue,
                          amount: feeAmt,
                          state: "Active_Authorized",
                          dateGen: new Date().toISOString().substring(0, 10)
                        };

                        setAuthorizedFeesCodes([newKeyObj, ...authorizedFeesCodes]);
                        triggerToast(lang === 'EN' ? `Generated secure bank key: ${codeVal}` : `የመንገዱ ደህንነት ቁልፍ ተፈጥሯል: ${codeVal}`);
                        
                        setAuditLogs([
                          {
                            id: `log-${Date.now()}`,
                            ev: "SECURE_KEY_GENERATION",
                            user: "Principal Admin",
                            desc: `Created secure bank payment pre-authorization key: ${codeVal} for ${studentNameValue}`,
                            date: new Date().toISOString().substring(0, 10) + " " + new Date().toTimeString().split(' ')[0],
                            level: "info"
                          },
                          ...auditLogs
                        ]);
                      }}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 shrink-0 select-none uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      🔑 {lang === 'EN' ? "Generate Security Key" : "አዲስ ቁልፍ ፍጠር"}
                    </button>
                  </div>

                  {/* Keys Table list */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-[#111318] text-slate-400 font-bold uppercase border-b border-slate-850">
                            <th className="p-3 font-medium">{lang === 'EN' ? "Verification Key" : "የማረጋገጫ ኮድ"}</th>
                            <th className="p-3 font-medium">{lang === 'EN' ? "Applies to Student" : "የትማሪው ስም"}</th>
                            <th className="p-3 font-medium">{lang === 'EN' ? "Fee Type" : "የክፍያ አይነት"}</th>
                            <th className="p-3 font-medium text-right">{lang === 'EN' ? "Approved ETB" : "የተፈቀደው መጠን"}</th>
                            <th className="p-3 font-medium text-center">{lang === 'EN' ? "Voucher Status" : "ድርጊቶች"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 font-mono text-[10.5px] text-slate-300">
                          {authorizedFeesCodes.map((fcode) => (
                            <tr key={fcode.id} className="hover:bg-slate-900/10">
                              <td className="p-2.5 font-bold text-amber-500">
                                {fcode.code}
                              </td>
                              <td className="p-2.5 font-sans font-medium text-slate-200">
                                {fcode.valName}
                              </td>
                              <td className="p-2.5 font-sans text-slate-400">
                                {fcode.type}
                              </td>
                              <td className="p-2.5 text-right font-bold text-slate-205">
                                {fcode.amount} Br
                              </td>
                              <td className="p-2.5 text-center">
                                {fcode.state === 'Claimed_Used' ? (
                                  <span className="px-1.5 py-0.5 bg-slate-850 text-slate-500 rounded text-[8px] font-black uppercase tracking-wider">
                                    CLAIMED
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-wider">
                                    AUTHORIZED
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      )}
      {activeSubTab === 'FirebaseSync' && (
        <FirebaseSyncControl 
          lang={lang}
          students={students}
          setStudents={setStudents}
          teachers={teachers}
          setTeachers={setTeachers}
          scoreRecords={scoreRecords}
          setScoreRecords={setScoreRecords}
          invoices={invoices}
          setInvoices={setInvoices}
          triggerToast={triggerToast}
        />
      )}

    </div>
  );
}
