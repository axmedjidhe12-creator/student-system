/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SchoolProfile {
  name: string;
  nameAmharic: string;
  nameSomali?: string;
  logoText: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string; // e.g., Addis Ababa, Oromia, Amhara, Tigray, etc.
  gradeSystem: 'Ethiopian National Standard';
  principalName: string;
  photoUrl?: string;
  logoUrl?: string;
}

export interface AcademicYear {
  id: string; // e.g. "2025-2026", "2026-2027"
  label: string; // e.g., "2026/2027 Academic Year" (often aligned with Ethiopian EC - 2018 E.C. / 2019 E.C.)
  status: 'Active' | 'Archived' | 'Draft';
  semester: 'Semester 1' | 'Semester 2';
}

export type UserRole = 'Super_Admin' | 'Principal' | 'Teacher' | 'Student' | 'Parent';

export interface User {
  id: string;
  name: string;
  nameAmharic?: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Promoted' | 'Failed' | 'Repeating' | 'Transferred';
  joinedDate: string;
  photoUrl?: string;
  password?: string;
  gender?: string;
}

export interface Teacher extends User {
  specialization: string;
  assignedGrades: string[]; // e.g., ["Grade 7", "Grade 8"]
  assignedSections: string[]; // e.g., ["A", "B"]
  teacherCode?: string;
}

export interface Student extends User {
  rollNo: string;
  grade: string; // e.g. "Grade 1"
  section: string; // e.g. "A"
  parentId?: string; // Links to Parent.id
  parentName?: string;
  status: 'Active' | 'Promoted' | 'Failed' | 'Repeating' | 'Transferred';
  promotedToGrade?: string;
  attendanceRatio: number; // e.g. 0.94 (94%)
  conductRating: 'Excellent' | 'Very Good' | 'Good' | 'Satisfactory' | 'Needs Improvement';
  schoolReportComments?: string;
  studentCode?: string;
}

export interface Parent extends User {
  childId: string; // Links to Student.id
  childName?: string;
  occupation?: string;
  officePhone?: string;
}

export interface Subject {
  id: string;
  name: string;
  nameAmharic: string;
  code: string;
  gradeLevels: string[]; // applies to which grade levels
  isNationalExamSubject: boolean; // True for Grade 8, Grade 12 (Ethiopian Educational Standards)
}

export interface TimetableEntry {
  id: string;
  grade: string;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1 to 6 or 1 to 8 (Ethiopian school day usually has 6 or 7 periods of 45 mins)
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  timeSlot: string; // e.g., '8:30 AM - 9:15 AM'
}

export interface ScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  subjectId: string;
  subjectName: string;
  semester: 'Semester 1' | 'Semester 2';
  academicYear: string;
  
  // Continuous Assessment score details (total 40%)
  quizzes: number; // Max 15%
  assignments: number; // Max 15%
  participation: number; // Max 10%
  continuousAssessmentTotal: number; // quizzes + assignments + participation = Max 40%

  // Exam scores
  midtermScore: number; // Max 20%
  finalScore: number; // Max 40%
  
  // Totals
  grandTotal: number; // continuousAssessmentTotal + midtermScore + finalScore = Max 100%
  letterGrade: string; // A+, A, A-, B+, B, B-, C+, C, D, F
  rank?: number; // Calculated dynamic performance rank in class section
}

export interface FeeStructure {
  id: string;
  gradeRange: 'Primary' | 'Secondary' | 'All'; // Grade 1-8 (Primary), Grade 9-12 (Secondary)
  type: 'Tuition Fee' | 'Registration Fee' | 'Stationery Fee' | 'Sports & Lab Fee';
  amount: number; // in Ethiopian Birr (ETR / ETB)
  frequency: 'Monthly' | 'One-Time' | 'Term';
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  feeType: string;
  amount: number; // in ETB
  dateIssued: string;
  dueDate: string;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid';
  paymentHistory: PaymentHistoryEntry[];
}

export interface PaymentHistoryEntry {
  receiptId: string;
  date: string;
  amountPaid: number;
  paymentMethod: 'Telebirr' | 'CBE Birr' | 'Awash Bank Transfer' | 'Commercial Bank of Ethiopia (CBE)' | 'Cash';
  referenceNo: string; // Bank slip transaction ID
}

export interface AttendanceRecord {
  date: string;
  grade: string;
  section: string;
  records: {
    studentId: string;
    studentName: string;
    isPresent: boolean;
    remarks?: string;
  }[];
}
