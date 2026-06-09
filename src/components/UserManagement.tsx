/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Teacher, Student, Parent, UserRole } from '../types';
import { AppTranslations } from '../translations';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Briefcase, 
  GraduationCap, 
  Heart,
  Smartphone,
  Check,
  Tag,
  AlertTriangle,
  XCircle,
  Info as InfoIcon
} from 'lucide-react';

interface ParsedBatchRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade?: string;
  section?: string;
  studentCode?: string;
  specialization?: string;
  teacherCode?: string;
  isMatched: boolean;
  matchedName?: string;
}

interface ValidationIssue {
  rowNumber: number;
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
}

interface UserManagementProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  parents: Parent[];
  setParents: (parents: Parent[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  t: AppTranslations;
  lang: 'EN' | 'AM' | 'SO';
}

export default function UserManagement({
  students,
  setStudents,
  teachers,
  setTeachers,
  parents,
  setParents,
  users,
  setUsers,
  t,
  lang
}: UserManagementProps) {
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('Student');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State for editing / adding
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);

  // Batch Import state variables
  const [isBatchImportMode, setIsBatchImportMode] = useState(false);
  const [batchRawText, setBatchRawText] = useState("");
  const [batchUpdateOnMatch, setBatchUpdateOnMatch] = useState(true);
  const [batchError, setBatchError] = useState("");
  const [batchSuccess, setBatchSuccess] = useState("");

  // Validation Summary modal states
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [validatedRows, setValidatedRows] = useState<ParsedBatchRow[]>([]);

  // Form Fields
  const [fName, setFName] = useState("");
  const [fNameAmharic, setFNameAmharic] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fStatus, setFStatus] = useState<'Active' | 'Inactive'>('Active');
  const [fPhotoUrl, setFPhotoUrl] = useState("");
  const [fPassword, setFPassword] = useState("");
  const [fStudentCode, setFStudentCode] = useState("");
  const [fTeacherCode, setFTeacherCode] = useState("");
  
  // Role specific fields
  const [fSpecialization, setFSpecialization] = useState("");
  const [fAssignedGrades, setFAssignedGrades] = useState<string[]>([]);
  const [fAssignedSections, setFAssignedSections] = useState<string[]>([]);
  
  const [fRollNo, setFRollNo] = useState("");
  const [fGrade, setFGrade] = useState("Grade 1");
  const [fSection, setFSection] = useState("A");
  const [fParentName, setFParentName] = useState("");
  const [fConductRange, setFConductRange] = useState<any>('Excellent');
  const [fStudentStatus, setFStudentStatus] = useState<'Active' | 'Promoted' | 'Failed' | 'Repeating' | 'Transferred'>('Active');
  
  const [fOccupation, setFOccupation] = useState("");
  const [fChildId, setFChildId] = useState("");

  const resetForm = () => {
    setFName("");
    setFNameAmharic("");
    setFEmail("");
    setFPhone("");
    setFStatus('Active');
    setFPhotoUrl("");
    setFPassword("");
    setFStudentCode("");
    setFTeacherCode("");
    
    setFSpecialization("");
    setFAssignedGrades([]);
    setFAssignedSections([]);
    
    setFRollNo("");
    setFGrade("Grade 8");
    setFSection("A");
    setFParentName("");
    setFConductRange('Excellent');
    setFStudentStatus('Active');
    
    setFOccupation("");
    setFChildId("");
    
    setSelectedUserForEdit(null);
    setIsEditing(false);
    setIsAdding(false);
    setIsBatchImportMode(false);
    setBatchRawText("");
    setBatchError("");
    setBatchSuccess("");
    setShowValidationModal(false);
    setValidationIssues([]);
    setValidatedRows([]);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUserForEdit(user);
    setFName(user.name);
    setFNameAmharic(user.nameAmharic || "");
    setFEmail(user.email);
    setFPhone(user.phone);
    setFStatus(user.status);
    setFPhotoUrl(user.photoUrl || "");
    setFPassword(user.password || "");
    setIsBatchImportMode(false);

    if (selectedRoleTab === 'Teacher') {
      const teacher = user as Teacher;
      setFSpecialization(teacher.specialization || "");
      setFAssignedGrades(teacher.assignedGrades || []);
      setFAssignedSections(teacher.assignedSections || []);
      setFTeacherCode(teacher.teacherCode || "");
    } else if (selectedRoleTab === 'Student') {
      const student = user as Student;
      setFRollNo(student.rollNo || "");
      setFGrade(student.grade || "Grade 8");
      setFSection(student.section || "A");
      setFParentName(student.parentName || "");
      setFConductRange(student.conductRating || "Excellent");
      setFStudentStatus(student.status || "Active");
      setFStudentCode(student.studentCode || "");
    } else if (selectedRoleTab === 'Parent') {
      const parent = user as Parent;
      setFOccupation(parent.occupation || "");
      setFChildId(parent.childId || "");
    }

    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName) return;

    if (isAdding) {
      const newId = `usr-${Date.now()}`;
      const baseUser: User = {
        id: newId,
        name: fName,
        nameAmharic: fNameAmharic || undefined,
        email: fEmail || `${fName.toLowerCase().replace(/\s+/g, '')}@focusacademy.edu.et`,
        phone: fPhone,
        role: selectedRoleTab,
        status: fStatus,
        joinedDate: new Date().toISOString().split('T')[0],
        photoUrl: fPhotoUrl || undefined,
        password: fPassword || "pass123"
      };

      if (selectedRoleTab === 'Teacher') {
        const newTeacher: Teacher = {
          ...baseUser,
          specialization: fSpecialization,
          assignedGrades: fAssignedGrades.length > 0 ? fAssignedGrades : ["Grade 8"],
          assignedSections: fAssignedSections.length > 0 ? fAssignedSections : ["A"],
          teacherCode: fTeacherCode || `TCH-${Math.floor(Math.random() * 9000) + 1000}`
        };
        setTeachers([...teachers, newTeacher]);
      } else if (selectedRoleTab === 'Student') {
        const newStudent: Student = {
          ...baseUser,
          rollNo: fRollNo || `R-${Math.floor(Math.random() * 900) + 100}`,
          grade: fGrade,
          section: fSection,
          parentName: fParentName,
          status: fStudentStatus,
          attendanceRatio: 0.95,
          conductRating: fConductRange,
          studentCode: fStudentCode || `${Math.floor(Math.random() * 9000) + 1000}`
        };
        setStudents([...students, newStudent]);
      } else if (selectedRoleTab === 'Parent') {
        const newParent: Parent = {
          ...baseUser,
          childId: fChildId,
          childName: students.find(s => s.id === fChildId)?.name || "",
          occupation: fOccupation
        };
        setParents([...parents, newParent]);
      } else {
        setUsers([...users, baseUser]);
      }
    } else if (isEditing && selectedUserForEdit) {
      const uId = selectedUserForEdit.id;

      if (selectedRoleTab === 'Teacher') {
        const updated = teachers.map(t => {
          if (t.id === uId) {
            return {
              ...t,
              name: fName,
              nameAmharic: fNameAmharic || undefined,
              email: fEmail,
              phone: fPhone,
              status: fStatus,
              photoUrl: fPhotoUrl || undefined,
              password: fPassword || undefined,
              specialization: fSpecialization,
              assignedGrades: fAssignedGrades,
              assignedSections: fAssignedSections,
              teacherCode: fTeacherCode || undefined
            };
          }
          return t;
        });
        setTeachers(updated);
      } else if (selectedRoleTab === 'Student') {
        const updated = students.map(s => {
          if (s.id === uId) {
            return {
              ...s,
              name: fName,
              nameAmharic: fNameAmharic || undefined,
              email: fEmail,
              phone: fPhone,
              rollNo: fRollNo,
              grade: fGrade,
              section: fSection,
              parentName: fParentName,
              conductRating: fConductRange,
              status: fStudentStatus,
              photoUrl: fPhotoUrl || undefined,
              password: fPassword || undefined,
              studentCode: fStudentCode || undefined
            };
          }
          return s;
        });
        setStudents(updated);
      } else if (selectedRoleTab === 'Parent') {
        const updated = parents.map(p => {
          if (p.id === uId) {
            return {
              ...p,
              name: fName,
              nameAmharic: fNameAmharic || undefined,
              email: fEmail,
              phone: fPhone,
              status: fStatus,
              photoUrl: fPhotoUrl || undefined,
              password: fPassword || undefined,
              occupation: fOccupation,
              childId: fChildId,
              childName: students.find(s => s.id === fChildId)?.name || ""
            };
          }
          return p;
        });
        setParents(updated);
      } else {
        const updated = users.map(u => {
          if (u.id === uId) {
            return {
              ...u,
              name: fName,
              nameAmharic: fNameAmharic || undefined,
              email: fEmail,
              phone: fPhone,
              status: fStatus,
              photoUrl: fPhotoUrl || undefined,
              password: fPassword || undefined
            };
          }
          return u;
        });
        setUsers(updated);
      }
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (selectedRoleTab === 'Teacher') {
      setTeachers(teachers.filter(t => t.id !== id));
    } else if (selectedRoleTab === 'Student') {
      setStudents(students.filter(s => s.id !== id));
    } else if (selectedRoleTab === 'Parent') {
      setParents(parents.filter(p => p.id !== id));
    } else {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // Get active items based on tab selection
  const getActiveList = () => {
    if (selectedRoleTab === 'Teacher') return teachers;
    if (selectedRoleTab === 'Student') return students;
    if (selectedRoleTab === 'Parent') return parents;
    return users.filter(u => u.role === selectedRoleTab);
  };

  const activeList = getActiveList();

  const filteredList = activeList.filter(item => {
    const term = searchQuery.toLowerCase();
    const matchesName = item.name.toLowerCase().includes(term) || (item.nameAmharic && item.nameAmharic.toLowerCase().includes(term));
    const matchesPhone = item.phone.includes(term);
    const matchesEmail = item.email.toLowerCase().includes(term);
    return matchesName || matchesPhone || matchesEmail;
  });

  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
  const sections = ["A", "B", "C", "D", "E"];
  const conductRatings = ["Excellent", "Very Good", "Good", "Satisfactory", "Needs Improvement"];

  const toggleGradeSelection = (g: string) => {
    if (fAssignedGrades.includes(g)) {
      setFAssignedGrades(fAssignedGrades.filter(x => x !== g));
    } else {
      setFAssignedGrades([...fAssignedGrades, g]);
    }
  };

  const toggleSectionSelection = (s: string) => {
    if (fAssignedSections.includes(s)) {
      setFAssignedSections(fAssignedSections.filter(x => x !== s));
    } else {
      setFAssignedSections([...fAssignedSections, s]);
    }
  };


  const parseRows = (): ParsedBatchRow[] => {
    if (!batchRawText.trim()) return [];
    const lines = batchRawText.split('\n');
    const results: ParsedBatchRow[] = [];
    
    let startIndex = 0;
    if (lines.length > 0) {
      const firstLine = lines[0].toLowerCase();
      if (firstLine.includes('id') || firstLine.includes('name') || firstLine.includes('email') || firstLine.includes('code')) {
        startIndex = 1;
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const delimiter = line.includes('\t') ? '\t' : ',';
      const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      
      if (cols.length < 2) continue;

      const rawId = cols[0] || `usr-p-${Date.now()}-${i}`;
      const name = cols[1];
      const email = cols[2] || '';
      const phone = cols[3] || '';
      
      if (selectedRoleTab === 'Student') {
        const grade = cols[4] || 'Grade 1';
        const section = cols[5] || 'A';
        const studentCode = cols[6] || '';
        
        const existing = students.find(s => s.id === rawId || (studentCode && s.studentCode === studentCode));
        results.push({
          id: rawId,
          name,
          email: email || `${name.toLowerCase().replace(/\s+/g, '')}@focusacademy.edu.et`,
          phone,
          grade,
          section,
          studentCode: studentCode || `${Math.floor(Math.random() * 9000) + 1000}`,
          isMatched: !!existing,
          matchedName: existing ? existing.name : undefined
        });
      } else if (selectedRoleTab === 'Teacher') {
        const specialization = cols[4] || 'General';
        const teacherCode = cols[5] || '';
        
        const existing = teachers.find(t => t.id === rawId || (teacherCode && t.teacherCode === teacherCode));
        results.push({
          id: rawId,
          name,
          email: email || `${name.toLowerCase().replace(/\s+/g, '')}@focusacademy.edu.et`,
          phone,
          specialization,
          teacherCode: teacherCode || `TCH-${Math.floor(Math.random() * 9000) + 1000}`,
          isMatched: !!existing,
          matchedName: existing ? existing.name : undefined
        });
      }
    }
    return results;
  };

  const handleValidateAndPreview = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseRows();
    if (parsed.length === 0) {
      setBatchError(lang === 'EN' ? "No valid records parsed from the text area. Please check the columns and fill properly." : "ከሳጥኑ ውስጥ ምንም ትክክለኛ መረጃ አልተገኘም።");
      return;
    }

    const issues: ValidationIssue[] = [];
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();

    parsed.forEach((row, idx) => {
      const rowNum = idx + 1;
      
      // 1. Missing Mandatory field 'Name'
      if (!row.name || !row.name.trim()) {
        issues.push({
          rowNumber: rowNum,
          type: 'error',
          field: 'Name',
          message: lang === 'EN' ? "CRITICAL: 'Name' is a mandatory field and cannot be empty." : "ስህተት፡ 'ስም' የግዴታ መሞላት ያለበት ሜዳ ነው። ሊተው አይችልም።"
        });
      }

      // 2. Custom ID empty status or duplicates inside the paste content
      if (!row.id || row.id.startsWith('usr-p-')) {
        issues.push({
          rowNumber: rowNum,
          type: 'info',
          field: 'ID',
          message: lang === 'EN' ? "Info: ID was not set. Migration engine will auto-assign a randomized ID." : "መረጃ፡ ልዩ መለያ አልተገለጸም። ሲስተሙ በራሱ አዲስ መለያ ይሰጠዋል።"
        });
      } else {
        if (seenIds.has(row.id)) {
          issues.push({
            rowNumber: rowNum,
            type: 'error',
            field: 'ID',
            message: lang === 'EN' ? `Duplicate conflict: The ID '${row.id}' was declared multiple times in this batch spreadsheet.` : `የተደገመ መለያ፡ መለያ ቁጥር '${row.id}' በዚህ የጅምላ ዝርዝር ውስጥ በተደጋጋሚ ተገልጿል።`
          });
        }
        seenIds.add(row.id);
      }

      // Code collisions checks inside the sheet itself
      const codeVal = selectedRoleTab === 'Student' ? row.studentCode : row.teacherCode;
      if (codeVal) {
        if (seenCodes.has(codeVal)) {
          issues.push({
            rowNumber: rowNum,
            type: 'warning',
            field: selectedRoleTab === 'Student' ? 'Student Code' : 'Teacher Code',
            message: lang === 'EN' ? `Pasted Duplicate Collision: The custom Authorization/Access code '${codeVal}' is used by multiple rows.` : `ማስጠንቀቂያ፡ '${codeVal}' የተባለው የመግቢያ/መለያ ኮድ በተደጋጋሚ ጥቅም ላይ ውሏል።`
          });
        }
        seenCodes.add(codeVal);
      }

      // 3. Format integrity checks
      if (row.email && (!row.email.includes('@') || !row.email.includes('.'))) {
        issues.push({
          rowNumber: rowNum,
          type: 'warning',
          field: 'Email Address',
          message: lang === 'EN' ? `Data Format Warning: Email '${row.email}' format is invalid or malformed.` : `የቅርጸት ችግር፡ የኢሜይል አድራሻው '${row.email}' ልክ አይደለም።`
        });
      }

      if (row.phone) {
        // Look for letters inside the phone
        const rawDigitsOnly = row.phone.replace(/[\s\-\+\(\)]/g, '');
        if (/[a-zA-Z]/.test(row.phone) || rawDigitsOnly.length < 7) {
          issues.push({
            rowNumber: rowNum,
            type: 'warning',
            field: 'Phone Number',
            message: lang === 'EN' ? `Data Format Warning: Phone number '${row.phone}' contains alphabets or is too short.` : `የቅርጸት ችግር፡ የስልክ ቁጥር '${row.phone}' ፊደላት አለበት ወይም በጣም አጭር ነው።`
          });
        }
      }

      // 4. Verification with DB Records
      if (selectedRoleTab === 'Student') {
        if (row.grade && !grades.includes(row.grade)) {
          issues.push({
            rowNumber: rowNum,
            type: 'warning',
            field: 'Grade Level',
            message: lang === 'EN' ? `Mismatch warning: Grade '${row.grade}' doesn't match standard classes (Grade 1 - 12).` : `የክፍል አለመጣጣም፡ '${row.grade}' በሲስተሙ የተመዘገበ ክፍል አይደለም።`
          });
        }

        const dbMatch = students.find(s => s.id === row.id || (row.studentCode && s.studentCode === row.studentCode));
        if (dbMatch) {
          if (batchUpdateOnMatch) {
            issues.push({
              rowNumber: rowNum,
              type: 'info',
              field: 'Record Overlay',
              message: lang === 'EN' ? `Match found: ID or Code already exists. This will OVERWRITE student record for '${dbMatch.name}'.` : `ውህደት መረጃ፡ መለያው ከነባር ተማሪ '${dbMatch.name}' ጋር ስለተገኘ መረጃው ይዘመናል (Overwrite)።`
            });
          } else {
            issues.push({
              rowNumber: rowNum,
              type: 'warning',
              field: 'Record Collision',
              message: lang === 'EN' ? `ID conflict: '${row.id}' is already registered to user '${dbMatch.name}'. A distinct entry with an auto-incremented suffix will be generated.` : `ግጭት፡ '${row.id}' ቀደም ሲል ከተማሪ '${dbMatch.name}' ጋር ስለተያያዘ አዲስ ልዩ መለያ ቁጥር ይሰጠዋል።`
            });
          }
        }
      } else if (selectedRoleTab === 'Teacher') {
        const dbMatch = teachers.find(t => t.id === row.id || (row.teacherCode && t.teacherCode === row.teacherCode));
        if (dbMatch) {
          if (batchUpdateOnMatch) {
            issues.push({
              rowNumber: rowNum,
              type: 'info',
              field: 'Record Overlay',
              message: lang === 'EN' ? `Match found: ID or Code already exists. This will OVERWRITE teacher record for '${dbMatch.name}'.` : `ውህደት መረጃ፡ መለያው ከነባር መምህር '${dbMatch.name}' ጋር ስለተገኘ መረጃው ይዘመናል (Overwrite)።`
            });
          } else {
            issues.push({
              rowNumber: rowNum,
              type: 'warning',
              field: 'Record Collision',
              message: lang === 'EN' ? `ID conflict: '${row.id}' is already registered to user '${dbMatch.name}'. A distinct entry with an auto-incremented suffix will be generated.` : `ግጭት፡ '${row.id}' ቀደም ሲል ከመምህር '${dbMatch.name}' ጋር ስለተያያዘ አዲስ ልዩ መለያ ይሰጠዋል።`
            });
          }
        }
      }
    });

    setValidationIssues(issues);
    setValidatedRows(parsed);
    setShowValidationModal(true);
  };

  const executeConfirmedBatchImport = () => {
    setShowValidationModal(false);
    const parsed = validatedRows;
    if (parsed.length === 0) return;

    let updatedStudentsCount = 0;
    let createdStudentsCount = 0;
    let updatedTeachersCount = 0;
    let createdTeachersCount = 0;

    if (selectedRoleTab === 'Student') {
      let currentStudents = [...students];
      parsed.forEach(row => {
        if (!row.name || !row.name.trim()) return;

        const existingIndex = currentStudents.findIndex(s => s.id === row.id || (row.studentCode && s.studentCode === row.studentCode));
        if (existingIndex > -1 && batchUpdateOnMatch) {
          currentStudents[existingIndex] = {
            ...currentStudents[existingIndex],
            name: row.name,
            email: row.email,
            phone: row.phone,
            grade: row.grade || currentStudents[existingIndex].grade,
            section: row.section || currentStudents[existingIndex].section,
            studentCode: row.studentCode || currentStudents[existingIndex].studentCode,
          };
          updatedStudentsCount++;
        } else {
          let finalId = row.id;
          if (existingIndex > -1) {
            finalId = `${row.id}-new-${Math.floor(Math.random() * 1000)}`;
          }
          const newStudent: Student = {
            id: finalId,
            name: row.name,
            email: row.email,
            phone: row.phone,
            role: 'Student',
            status: 'Active',
            joinedDate: new Date().toISOString().split('T')[0],
            password: 'pass123',
            rollNo: `R-${Math.floor(Math.random() * 900) + 100}`,
            grade: row.grade || 'Grade 1',
            section: row.section || 'A',
            parentName: '',
            attendanceRatio: 0.95,
            conductRating: 'Excellent',
            studentCode: row.studentCode
          };
          currentStudents.push(newStudent);
          createdStudentsCount++;
        }
      });
      setStudents(currentStudents);
      setBatchSuccess(lang === 'EN' 
        ? `Batch completed successfully! Added ${createdStudentsCount} student(s), updated ${updatedStudentsCount}.`
        : `የጅምላ ማስገባት ተጠናቋል! ${createdStudentsCount} ተማሪዎች ታክለዋል፣ ${updatedStudentsCount} ተማሪዎች ተዘምነዋል።`);
    } else if (selectedRoleTab === 'Teacher') {
      let currentTeachers = [...teachers];
      parsed.forEach(row => {
        if (!row.name || !row.name.trim()) return;

        const existingIndex = currentTeachers.findIndex(t => t.id === row.id || (row.teacherCode && t.teacherCode === row.teacherCode));
        if (existingIndex > -1 && batchUpdateOnMatch) {
          currentTeachers[existingIndex] = {
            ...currentTeachers[existingIndex],
            name: row.name,
            email: row.email,
            phone: row.phone,
            specialization: row.specialization || currentTeachers[existingIndex].specialization,
            teacherCode: row.teacherCode || currentTeachers[existingIndex].teacherCode
          };
          updatedTeachersCount++;
        } else {
          let finalId = row.id;
          if (existingIndex > -1) {
            finalId = `${row.id}-new-${Math.floor(Math.random() * 1000)}`;
          }
          const newTeacher: Teacher = {
            id: finalId,
            name: row.name,
            email: row.email,
            phone: row.phone,
            role: 'Teacher',
            status: 'Active',
            joinedDate: new Date().toISOString().split('T')[0],
            password: 'pass123',
            specialization: row.specialization || 'General',
            assignedGrades: ['Grade 8'],
            assignedSections: ['A'],
            teacherCode: row.teacherCode
          };
          currentTeachers.push(newTeacher);
          createdTeachersCount++;
        }
      });
      setTeachers(currentTeachers);
      setBatchSuccess(lang === 'EN' 
        ? `Batch completed successfully! Added ${createdTeachersCount} teacher(s), updated ${updatedTeachersCount}.`
        : `የጅምላ ማስገባት ተጠናቋል! ${createdTeachersCount} መምህራን ታክለዋል፣ ${updatedTeachersCount} መምህራን ተዘምነዋል።`);
    }

    setBatchRawText("");
    setValidatedRows([]);
    setValidationIssues([]);
  };

  const loadSampleTemplate = () => {
    if (selectedRoleTab === 'Student') {
      setBatchRawText(
`ID, Name, Email, Phone, Grade, Section, StudentCode
usr-student-1, Johannes Abebe, johannes@example.com, +251911223344, Grade 8, A, 1001
usr-student-new, Salem Hailu, salem@example.com, +251900112233, Grade 9, B, 1004`
      );
    } else {
      setBatchRawText(
`ID, Name, Email, Phone, Specialization, TeacherCode
usr-teacher-1, Aster Hailu, aster@example.com, +251912345678, Mathematics, TCH-2231
usr-teacher-new, Kibrom Gidey, kibrom@example.com, +251987654321, Physics, TCH-4452`
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* Tabs list for Roles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex bg-[#111318] p-1 rounded-xl self-start gap-1 border border-slate-800">
          {([
            { role: 'Student', label: t.student },
            { role: 'Teacher', label: t.teacher },
            { role: 'Parent', label: t.parent },
            { role: 'Principal', label: lang === 'EN' ? "Principal" : "ርዕሰ መምህር" },
            { role: 'Super_Admin', label: lang === 'EN' ? "Super Admin" : "ዋና አድሚን" }
          ] as { role: UserRole; label: string }[]).map((tab) => (
            <button
              key={tab.role}
              onClick={() => { setSelectedRoleTab(tab.role); resetForm(); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedRoleTab === tab.role 
                  ? 'bg-amber-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={() => { resetForm(); setIsAdding(true); setIsBatchImportMode(false); }}
            className={`font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border ${
              (isAdding && !isBatchImportMode) || isEditing
                ? 'bg-amber-600 text-white border-amber-500/10 shadow-md shadow-amber-600/10'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Plus size={14} />
            {lang === 'EN' ? `Add Single` : "አንድ መዝግብ"}
          </button>

          {(selectedRoleTab === 'Student' || selectedRoleTab === 'Teacher') && (
            <button
              onClick={() => { resetForm(); setIsAdding(true); setIsBatchImportMode(true); }}
              className={`font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border ${
                isAdding && isBatchImportMode
                  ? 'bg-amber-600 text-white border-amber-500/10 shadow-md shadow-amber-600/15'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Briefcase size={14} />
              {lang === 'EN' ? `Batch Import Mode` : "በጅምላ ማስገቢያ"}
            </button>
          )}
        </div>
      </div>

      {/* Sub-form container for edit/add */}
      {(isAdding || isEditing) && (
        isBatchImportMode ? (
          <form onSubmit={handleValidateAndPreview} className="bg-[#16181D] border border-slate-800 p-6 rounded-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  {lang === 'EN' ? `Batch Import / Update Wizard:` : `የጅምላ መረጃ ማስገቢያና ማሻሻያ ስልት:`} {selectedRoleTab}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  {lang === 'EN' 
                    ? "Paste comma or tab separated list rows to parse bulk student / teacher information."
                    : "የተማሪዎችን ወይም የመምህራንን መረጃ በጅምላ ለመመዝገብ ከታች ባለው ሰንጠረዥ ያስገቡ።"}
                </p>
              </div>
              <button 
                type="button" 
                onClick={resetForm} 
                className="text-xs font-bold text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>

            {/* Config controls */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={batchUpdateOnMatch}
                    onChange={(e) => setBatchUpdateOnMatch(e.target.checked)}
                    className="rounded border-slate-850 bg-[#111318] text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>
                    {lang === 'EN' 
                      ? "Bulk-update existing student or teacher records instead of creating new ones if an ID match is found." 
                      : "ተመሳሳይ መለያ ID ካገኘህ አዲስ ከመፍጠር ይልቅ ነባሩን መረጃ አዘምን (Batch Update Mode)"}
                  </span>
                </label>
                <p className="text-[10px] text-slate-500 pl-6.5 font-sans">
                  {lang === 'EN'
                    ? "Matches are checked against both DB Record ID and Student/Teacher Code fields."
                    : "መለያዎች የሚረጋገጡት በሲስተሙ የመለያ ኮድ (ID) እና በተማሪ/መምህር ኮድ አማካኝነት ነው።"}
                </p>
              </div>

              <button
                type="button"
                onClick={loadSampleTemplate}
                className="bg-[#111318] hover:bg-slate-805 text-slate-300 hover:text-white border border-slate-800 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-colors cursor-pointer shrink-0 font-sans"
              >
                {lang === 'EN' ? "📄 Load Sample Template" : "📄 ለመሞከሪያ የሚሆን ናሙና ሙላ"}
              </button>
            </div>

            {/* Error and Success screens */}
            {batchError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-sans">
                {batchError}
              </div>
            )}
            {batchSuccess && (
              <div className="bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] p-3 rounded-lg text-xs font-sans font-bold">
                {batchSuccess}
              </div>
            )}

            {/* Text Input area */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>{lang === 'EN' ? "Paste Raw Data Content (CSV / TSV / Tabular Columns)" : "የጥሬ መረጃ ፅሁፍ ሳጥን"}</span>
                <span className="text-amber-550 font-mono text-[10px] tracking-wider font-extrabold">
                  {selectedRoleTab === 'Student' 
                    ? "Required Columns: ID, Name, Email, Phone, Grade, Section, StudentCode" 
                    : "Required Columns: ID, Name, Email, Phone, Specialization, TeacherCode"}
                </span>
              </div>
              <textarea
                value={batchRawText}
                onChange={(e) => { setBatchRawText(e.target.value); setBatchError(""); }}
                rows={5}
                placeholder={
                  selectedRoleTab === 'Student'
                    ? "usr-student-1, Johannes Abebe, johannes@example.com, +251..., Grade 8, A, 1001\nusr-student-2, Salem Tesfaye, salem@example.com, +251..., Grade 9, B, 1002"
                    : "usr-teacher-1, Aster Hailu, aster@example.com, +251..., Mathematics, TCH-2231\nusr-teacher-a, Kibrom Gidey, kibrom@example.com, +251..., Physics, TCH-4452"
                }
                className="w-full bg-[#111318] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            {/* Parsing live preview */}
            {parseRows().length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>{lang === 'EN' ? "Parsed Live Review Output" : "የማስገባት ቅድመ እይታ ሁኔታ"}</span>
                  <span className="font-mono text-[10px] text-slate-500">({parseRows().length} row(s))</span>
                </h4>
                <div className="overflow-hidden border border-slate-800/60 rounded-xl max-h-48 overflow-y-auto">
                  <table className="w-full text-[11px] border-collapse bg-slate-900/10">
                    <thead>
                      <tr className="bg-slate-950/40 text-left text-slate-500 border-b border-slate-800 font-bold font-sans">
                        <th className="p-2">ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Contact Details</th>
                        <th className="p-2">
                          {selectedRoleTab === 'Student' ? "Grade/Section" : "Subject Area"}
                        </th>
                        <th className="p-2">System Action Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-400">
                      {parseRows().map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/10">
                          <td className="p-2 font-mono text-amber-500 font-semibold">{row.id}</td>
                          <td className="p-2 text-slate-205 font-bold">{row.name}</td>
                          <td className="p-2 font-sans text-slate-400">
                            {row.phone && <span className="block">{row.phone}</span>}
                            {row.email && <span className="text-[10px] text-slate-500">{row.email}</span>}
                          </td>
                          <td className="p-2">
                            {selectedRoleTab === 'Student' ? (
                              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 border border-emerald-505/20 px-1.5 py-0.5 rounded">
                                {row.grade} ({row.section})
                              </span>
                            ) : (
                              <span className="text-indigo-400 font-mono text-[10px] bg-indigo-500/10 border border-indigo-505/20 px-1.5 py-0.5 rounded">
                                {row.specialization}
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            {row.isMatched ? (
                              batchUpdateOnMatch ? (
                                <span className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-bold py-0.5 px-1.5 rounded uppercase">
                                  🔄 Update (ID Matched with {row.matchedName})
                                </span>
                              ) : (
                                <span className="inline-block bg-sky-500/10 border border-sky-500/20 text-sky-455 text-[9px] font-bold py-0.5 px-1.5 rounded uppercase">
                                  ➕ Create New (Auto-ID Suffix)
                                </span>
                              )
                            ) : (
                              <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold py-0.5 px-1.5 rounded uppercase">
                                ✨ Create New Record
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Execute panel */}
            <div className="flex gap-2 justify-end border-t border-slate-800 pt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] font-bold text-slate-400 rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                disabled={parseRows().length === 0}
                className={`px-6 py-2 text-white text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                  parseRows().length > 0
                    ? 'bg-amber-600 hover:bg-amber-700 border-amber-600/50 shadow-md shadow-amber-600/15'
                    : 'bg-slate-850 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                }`}
              >
                {lang === 'EN' ? `Bulk Run Batch Import (${parseRows().length} Row)` : `በጅምላ ማስገቢያ ማስኬጃ (${parseRows().length} ገፅ)`}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSave} className="bg-[#16181D] border border-slate-800 p-6 rounded-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                {isAdding 
                  ? (lang === 'EN' ? `Add New Private ${selectedRoleTab}` : `አዲስ ${selectedRoleTab} መረጃ መመዝገቢያ`)
                  : (lang === 'EN' ? `Edit ${selectedRoleTab} Reference` : `${selectedRoleTab} መረጃ ማስተካከያ`)}
              </h3>
              <button 
                type="button" 
                onClick={resetForm} 
                className="text-xs font-bold text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Common fields */}
              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "English Name *" : "ስም በኢንግሊዝኛ *"}</label>
                <input 
                  type="text" 
                  value={fName} 
                  required 
                  onChange={(e) => setFName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Amharic Name" : "ስም በአማርኛ"}</label>
                <input 
                  type="text" 
                  value={fNameAmharic} 
                  onChange={(e) => setFNameAmharic(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{t.phone} *</label>
                <input 
                  type="text" 
                  value={fPhone} 
                  placeholder="+251 9..."
                  required 
                  onChange={(e) => setFPhone(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{t.email}</label>
                <input 
                  type="email" 
                  value={fEmail} 
                  onChange={(e) => setFEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Account Status" : "የአካውንት ገፅታ"}</label>
                <select 
                  value={fStatus} 
                  onChange={(e: any) => setFStatus(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-250 focus:border-amber-600 focus:outline-hidden appearance-none"
                >
                  <option value="Active" className="bg-[#16181D] text-slate-200">Active</option>
                  <option value="Inactive" className="bg-[#16181D] text-slate-200">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Profile Photo URL" : "የመገለጫ ፎቶ URL"}</label>
                <input 
                  type="text" 
                  value={fPhotoUrl} 
                  onChange={(e) => setFPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-205 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-500 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Login Password" : "የይለፍ ቃል"}</label>
                <input 
                  type="text" 
                  value={fPassword} 
                  onChange={(e) => setFPassword(e.target.value)}
                  placeholder="e.g., teacher123"
                  className="w-full bg-slate-900/50 border border-amber-600/30 rounded-lg px-3 py-2 text-xs text-amber-200 font-semibold focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              {selectedRoleTab === 'Student' && (
                <div>
                  <label className="block text-[11px] text-emerald-500 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Student Access Code" : "የተማሪ መግቢያ ኮድ"}</label>
                  <input 
                    type="text" 
                    value={fStudentCode} 
                    onChange={(e) => setFStudentCode(e.target.value)}
                    placeholder="e.g., 1001"
                    className="w-full bg-slate-900/50 border border-emerald-600/30 rounded-lg px-3 py-2 text-xs text-emerald-200 font-bold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Role specific forms conditional rendering */}
              {selectedRoleTab === 'Teacher' && (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Subject Specialization" : "የክፍል ዓይነት ሞያ"}</label>
                    <input 
                      type="text" 
                      value={fSpecialization} 
                      onChange={(e) => setFSpecialization(e.target.value)}
                      placeholder="e.g. Mathematics"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-indigo-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Teacher Authorization Code" : "የመምህር መለያ ቁጥር"}</label>
                    <input 
                      type="text" 
                      value={fTeacherCode} 
                      onChange={(e) => setFTeacherCode(e.target.value)}
                      placeholder="e.g., TCH-1122"
                      className="w-full bg-slate-900/50 border border-indigo-600/30 rounded-lg px-3 py-2 text-xs text-indigo-200 font-bold focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-wider">{lang === 'EN' ? "Select Assigned Grades" : "የሚመድቡባቸው ክልል ክፍሎች"}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {grades.map(g => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => toggleGradeSelection(g)}
                          className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border cursor-pointer ${
                            fAssignedGrades.includes(g)
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-805'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-wider">{lang === 'EN' ? "Select Assigned Sections" : "ክፍሎች (ሴክሽን)"}</label>
                    <div className="flex gap-2 mt-2">
                      {sections.map(s => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleSectionSelection(s)}
                          className={`px-3 py-1 text-[10px] font-semibold rounded-md border cursor-pointer ${
                            fAssignedSections.includes(s)
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-805'
                          }`}
                        >
                          Section {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedRoleTab === 'Student' && (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "ID Roll Number" : "የመታወቂያ ቁጥር"}</label>
                    <input 
                      type="text" 
                      value={fRollNo} 
                      placeholder="e.g., R-045"
                      onChange={(e) => setFRollNo(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{t.grade}</label>
                    <select 
                      value={fGrade} 
                      onChange={(e) => setFGrade(e.target.value)}
                      className="w-full bg-slate-900/55 border border-slate-805 rounded-lg px-3 py-2 text-xs text-slate-250 focus:border-amber-600 focus:outline-hidden appearance-none"
                    >
                      {grades.map(g => (
                        <option key={g} value={g} className="bg-[#16181D] text-slate-200">{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{t.section}</label>
                    <select 
                      value={fSection} 
                      onChange={(e) => setFSection(e.target.value)}
                      className="w-full bg-slate-900/55 border border-slate-805 rounded-lg px-3 py-2 text-xs text-slate-250 focus:border-amber-600 focus:outline-hidden appearance-none"
                    >
                      {sections.map(s => (
                        <option key={s} value={s} className="bg-[#16181D] text-slate-200">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Parent / Guardian Full Name" : "የወላጅ ሙሉ ስም"}</label>
                    <input 
                      type="text" 
                      value={fParentName} 
                      onChange={(e) => setFParentName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{t.conductRating}</label>
                    <select 
                      value={fConductRange} 
                      onChange={(e) => setFConductRange(e.target.value)}
                      className="w-full bg-slate-900/55 border border-slate-805 rounded-lg px-3 py-2 text-xs text-slate-250 focus:border-amber-600 focus:outline-hidden appearance-none"
                    >
                      {conductRatings.map(c => (
                        <option key={c} value={c} className="bg-[#16181D] text-slate-200">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{t.promotedStatus}</label>
                    <select 
                      value={fStudentStatus} 
                      onChange={(e: any) => setFStudentStatus(e.target.value)}
                      className="w-full bg-slate-900/55 border border-slate-805 rounded-lg px-3 py-2 text-xs text-slate-250 focus:border-amber-600 focus:outline-hidden appearance-none"
                    >
                      <option value="Active" className="bg-[#16181D] text-slate-200">Active</option>
                      <option value="Promoted" className="bg-[#16181D] text-slate-200">Promoted</option>
                      <option value="Failed" className="bg-[#16181D] text-slate-200">Failed</option>
                      <option value="Repeating" className="bg-[#16181D] text-slate-200">Repeating</option>
                      <option value="Transferred" className="bg-[#16181D] text-slate-200">Transferred</option>
                    </select>
                  </div>
                </>
              )}

              {selectedRoleTab === 'Parent' && (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Occupation" : "ሥራ (ሞያ)"}</label>
                    <input 
                      type="text" 
                      value={fOccupation} 
                      onChange={(e) => setFOccupation(e.target.value)}
                      placeholder="e.g. Merchant"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A1A1AA] font-bold mb-1.5 uppercase tracking-wider">{lang === 'EN' ? "Assign Student Child" : "የተማሪው ልጅ ምረጥ"}</label>
                    <select 
                      value={fChildId} 
                      onChange={(e) => setFChildId(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-250 focus:border-amber-600 focus:outline-hidden appearance-none"
                    >
                      <option value="" className="bg-[#16181D] text-slate-200">-- Select Child --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#16181D] text-slate-200">{s.name} ({s.grade})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-800 pt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] font-bold text-slate-400 rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl cursor-pointer border border-[#D97706]/10"
              >
                {lang === 'EN' ? "Confirm Changes" : "ለውጦችን አረጋግጥ"}
              </button>
            </div>
          </form>
        )
      )}

      {/* Users List Panel with Search */}
      <div className="bg-[#16181D] p-6 rounded-2xl shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <h2 className="font-display font-medium text-white text-base">
            {selectedRoleTab.replace('_', ' ')} Directory ({filteredList.length} total)
          </h2>

          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full bg-[#111318] border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-600 transition-all"
            />
          </div>
        </div>

        {/* Directory Card List / Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-805 text-left text-xs text-slate-500 font-semibold bg-slate-950/20">
                <th className="p-4">{t.name}</th>
                <th className="p-4">{t.phone} / {t.email}</th>
                <th className="p-4">
                  {selectedRoleTab === 'Student' && t.grade}
                  {selectedRoleTab === 'Teacher' && (lang === 'EN' ? "Subjects SPECIALIZATION" : "ክፍል ሞያ")}
                  {selectedRoleTab === 'Parent' && (lang === 'EN' ? "Child" : "ልጅ")}
                  {selectedRoleTab === 'Principal' && (lang === 'EN' ? "Date Appointed" : "ተጀምሯል")}
                  {selectedRoleTab === 'Super_Admin' && (lang === 'EN' ? "Level" : "ክፍል")}
                </th>
                <th className="p-4">
                  {selectedRoleTab === 'Student' ? (lang === 'EN' ? "Promotion Status" : "ድርጊቶች") : t.status}
                </th>
                <th className="p-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-350">
              {filteredList.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                  {/* Name column */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.photoUrl ? (
                        <img 
                          src={item.photoUrl} 
                          alt={item.name} 
                          referrerPolicy="no-referrer" 
                          className="w-9 h-9 rounded-full object-cover border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 shrink-0 uppercase">
                          {item.name ? item.name.charAt(0) : "U"}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-200 block">{item.name}</span>
                        {item.nameAmharic && (
                          <span className="text-[10px] text-slate-500 block font-sans">{item.nameAmharic}</span>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.password && (
                            <span className="text-[9px] font-bold font-mono tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                              Key: {item.password}
                            </span>
                          )}
                          {selectedRoleTab === 'Student' && item.studentCode && (
                            <span className="text-[9px] font-bold font-mono tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-600/20 px-1.5 py-0.5 rounded-md">
                              Code: {item.studentCode}
                            </span>
                          )}
                          {selectedRoleTab === 'Teacher' && (item as any).teacherCode && (
                            <span className="text-[9px] font-bold font-mono tracking-wider text-indigo-450 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                              Code: {(item as any).teacherCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Contact details */}
                  <td className="p-4 font-sans space-y-0.5">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Smartphone size={12} className="text-slate-500" />
                      {item.phone || "---"}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{item.email}</span>
                  </td>

                  {/* Role unique columns */}
                  <td className="p-4">
                    {selectedRoleTab === 'Student' && (
                      <div className="space-y-0.5">
                        <span className="font-semibold text-amber-500 font-sans">{item.grade}</span>
                        <span className="block text-[10px] text-slate-500 tracking-wider">Section {item.section}</span>
                      </div>
                    )}

                    {selectedRoleTab === 'Teacher' && (
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 font-sans">{item.specialization || "General"}</span>
                        <span className="block text-[10px] text-amber-500 font-mono">
                          Grades: {item.assignedGrades?.join(', ') || "N/A"}
                        </span>
                      </div>
                    )}

                    {selectedRoleTab === 'Parent' && (
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 font-sans">{item.childName || "Linked"}</span>
                        <span className="block text-[10px] text-slate-500 italic">{item.occupation || "N/A"}</span>
                      </div>
                    )}

                    {selectedRoleTab === 'Principal' && (
                      <span className="text-slate-400 font-mono">{item.joinedDate}</span>
                    )}

                    {selectedRoleTab === 'Super_Admin' && (
                      <span className="font-mono text-amber-500 font-semibold uppercase">{lang === 'EN' ? "System Admin" : "ዋና አስተዳዳሪ"}</span>
                    )}
                  </td>

                  {/* Status indicator */}
                  <td className="p-4">
                    {selectedRoleTab === 'Student' ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'Active' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : item.status === 'Promoted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'Failed'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-600/10 text-amber-500 border border-amber-600/20'
                      }`}>
                        {item.status}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-800'
                      }`}>
                        {item.status === 'Active' ? t.active : t.inactive}
                      </span>
                    )}
                  </td>

                  {/* Action buttons */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-slate-400 hover:text-amber-500 transition-colors p-1 cursor-pointer"
                        title={t.edit}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                    {lang === 'EN' 
                      ? "No records comply with your active search parameters." 
                      : "ከተፈለገው መረጃ ጋር የሚገናኝ ምንም አልተገኘም።"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Migration engine - Validation Summary Modal Popup */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fade-in" id="migration_validation_modal">
          <div className="bg-[#16181D] border border-slate-800 rounded-3xl max-w-2xl w-full flex flex-col max-h-[82vh] shadow-2xl shadow-black/80 ring-1 ring-white/5 animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                  {lang === 'EN' ? "Migration Audit & Validation Report" : "የማይግሬሽን ፍተሻና ማረጋገጫ ሪፖርት"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  {lang === 'EN' 
                    ? `Audit report for ${validatedRows.length} parsed batch row(s). Review all conflicts before completing import.`
                    : `${validatedRows.length} የተተነተኑ መረጃዎች የማይግሬሽን ፍተሻ ውጤት። ከመመዝገብዎ በፊት እባክዎ ሁሉንም ግጭቶች ይፈትሹ።`}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="text-slate-500 hover:text-slate-350 p-1.5 hover:bg-slate-900/50 rounded-lg transition-colors cursor-pointer"
                id="close_validation_modal_btn"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Audit Status Stats Bar */}
            <div className="px-6 py-3 bg-slate-900/35 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="text-[10px] uppercase font-bold text-rose-500 tracking-wider font-sans">{lang === 'EN' ? "Critical Errors" : "አስጊ ስህተቶች"}</div>
                <div className="text-lg font-bold text-white mt-0.5">{validationIssues.filter(x => x.type === 'error').length}</div>
              </div>
              <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider font-sans">{lang === 'EN' ? "Warnings" : "ማስጠንቀቂያዎች"}</div>
                <div className="text-lg font-bold text-white mt-0.5">{validationIssues.filter(x => x.type === 'warning').length}</div>
              </div>
              <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider font-sans">{lang === 'EN' ? "Information Only" : "መረጃዎች እይታ"}</div>
                <div className="text-lg font-bold text-white mt-0.5">{validationIssues.filter(x => x.type === 'info').length}</div>
              </div>
            </div>

            {/* Issues Core Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {validationIssues.length === 0 ? (
                <div className="text-center py-8 space-y-3 bg-[#111318]/50 rounded-2xl border border-slate-800/40">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Check size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{lang === 'EN' ? "100% Validated! Zero Conflicts Found" : "ሁሉም መረጃዎች ትክክለኛ ናቸው! ምንም አይነት ችግር አልተገኘም"}</h4>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 font-sans">
                      {lang === 'EN' 
                        ? `The parsed spreadsheet is clean with no duplicates, missing properties, or format conflicts. Ready to save.`
                        : "የተጫነው መረጃ ምንም ድግግሞሽ ወይም የተሳሳተ ፎርማት የለበትም። ማስቀመጥ ይችላሉ።"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {lang === 'EN' ? "Identified Conflicts & Warnings Ledger" : "የተገኙ ግጭቶችና ልዩነቶች ዝርዝር"}
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {validationIssues.map((issue, idx) => {
                      const isError = issue.type === 'error';
                      const isWarning = issue.type === 'warning';
                      return (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                            isError 
                              ? 'bg-rose-500/5 border-rose-500/20 text-rose-350' 
                              : isWarning 
                                ? 'bg-amber-600/5 border-amber-600/20 text-amber-350' 
                                : 'bg-sky-500/5 border-sky-500/15 text-sky-400'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {isError ? (
                              <XCircle size={15} className="text-rose-500" />
                            ) : isWarning ? (
                              <AlertTriangle size={15} className="text-amber-500" />
                            ) : (
                              <InfoIcon size={15} className="text-sky-400" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold tracking-tight bg-black/45 px-1.5 py-0.5 rounded border border-white/5">
                                Row #{issue.rowNumber}
                              </span>
                              <span className="font-semibold uppercase text-[10px] tracking-wider opacity-85">
                                ({issue.field})
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-300 font-sans mt-1">
                              {issue.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Data Rows Preview checklist */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  {lang === 'EN' ? `Data Target Payload Preview (${validatedRows.length})` : `የሚገባው የመረጃ ቅድመ እይታ (${validatedRows.length})`}
                </div>
                <div className="overflow-hidden border border-slate-800/80 rounded-2xl bg-slate-900/10 max-h-36 overflow-y-auto">
                  <table className="w-full text-[11px] border-collapseData text-slate-300">
                    <thead>
                      <tr className="bg-slate-950/50 text-left text-slate-400 border-b border-slate-800/80 font-bold font-sans">
                        <th className="p-2 w-16 text-center">Row</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2 font-mono">
                          {selectedRoleTab === 'Student' ? "Grade/Section" : "Specialization"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300 font-sans">
                      {validatedRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/10">
                          <td className="p-2 text-center text-slate-500 font-mono">#{rIdx + 1}</td>
                          <td className="p-2 font-semibold text-slate-205">
                            {row.name ? row.name : <em className="text-rose-500 font-bold text-[10px]">Empty / Missing *</em>}
                          </td>
                          <td className="p-2 text-slate-400 font-mono text-[10px] truncate max-w-[145px]" title={row.email}>
                            {row.email || "N/A"}
                          </td>
                          <td className="p-2">
                            {selectedRoleTab === 'Student' ? (
                              <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {row.grade} ({row.section})
                              </span>
                            ) : (
                              <span className="text-indigo-400 text-[10px] font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                {row.specialization}
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

            {/* Footer actions */}
            <div className="p-6 border-t border-slate-800/80 bg-slate-950/20 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-b-3xl">
              <div className="text-[11px] text-slate-400 font-sans">
                {validationIssues.filter(x => x.type === 'error').length > 0 ? (
                  <span className="text-rose-400 font-semibold">
                    🚫 {lang === 'EN' ? "Resolve critical validation errors first." : "እባክዎ መጀመሪያ ስህተቶችን ያስተካክሉ።"}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    ✓ {lang === 'EN' ? "Review warning conditions and click Import." : "ማስጠንቀቂያዎችን አስተውለው አስገብ ማለትን ይጫኑ።"}
                  </span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowValidationModal(false)}
                  className="px-4 py-2 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-350 rounded-xl transition-all cursor-pointer"
                  id="cancel_import_btn"
                >
                  {lang === 'EN' ? "Cancel & Edit" : "ተመለስና አስተካክል"}
                </button>
                <button 
                  type="button"
                  disabled={validationIssues.filter(x => x.type === 'error').length > 0}
                  onClick={executeConfirmedBatchImport}
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                    validationIssues.filter(x => x.type === 'error').length > 0
                      ? 'bg-slate-850 hover:bg-slate-850 text-slate-650 border-slate-800/60 cursor-not-allowed opacity-40'
                      : 'bg-amber-600 hover:bg-amber-700 border-amber-600/50 shadow-lg shadow-amber-600/10'
                  }`}
                  id="confirm_import_btn"
                >
                  <Check size={14} />
                  {lang === 'EN' ? "Confirm & Import Now" : "አረጋግጥና መረጃዎችን አስገባ"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
