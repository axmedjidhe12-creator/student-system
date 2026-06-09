/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SchoolProfile,
  AcademicYear,
  Teacher,
  Student,
  Parent,
  Subject,
  Invoice,
  ScoreRecord,
  FeeStructure,
  TimetableEntry,
  AttendanceRecord
} from './types';

export const initialSchoolProfile: SchoolProfile = {
  name: "Focus Academy Private School",
  nameAmharic: "ፎከስ አካዳሚ የግል ትምህርት ቤት",
  nameSomali: "Akaademiyada Focus Dugsiga Gaarka ah",
  logoText: "FA",
  email: "info@focusacademy.edu.et",
  phone: "+251 11-661-2345",
  address: "Bole Sub-City, Woreda 03, House No. 1042",
  city: "Addis Ababa",
  region: "Addis Ababa",
  gradeSystem: "Ethiopian National Standard",
  principalName: "Dr. Abraham Assefa",
  photoUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80"
};

export const initialAcademicYears: AcademicYear[] = [
  { id: "2025-2026", label: "2025/2026 Academic Year (2018 E.C.)", status: "Archived", semester: "Semester 2" },
  { id: "2026-2027", label: "2026/2027 Academic Year (2019 E.C.)", status: "Active", semester: "Semester 1" }
];

export const standardSubjects: Subject[] = [
  { id: "sub-amh", name: "Amharic", nameAmharic: "አማርኛ", code: "AMH", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-eng", name: "English", nameAmharic: "እንግሊዝኛ", code: "ENG", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-mat", name: "Mathematics", nameAmharic: "ሒሳብ", code: "MAT", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-env", name: "Environmental Science", nameAmharic: "አካባቢ ሳይንስ", code: "ENV", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"], isNationalExamSubject: false },
  { id: "sub-gsc", name: "General Science", nameAmharic: "ሳይንስ", code: "GSC", gradeLevels: ["Grade 5", "Grade 6", "Grade 7", "Grade 8"], isNationalExamSubject: true },
  { id: "sub-sst", name: "Social Studies", nameAmharic: "ኅብረተሰብ ሳይንስ", code: "SST", gradeLevels: ["Grade 5", "Grade 6", "Grade 7", "Grade 8"], isNationalExamSubject: true },
  { id: "sub-phy", name: "Physics", nameAmharic: "ፊዚክስ", code: "PHY", gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-che", name: "Chemistry", nameAmharic: "ኬሚስትሪ", code: "CHE", gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-bio", name: "Biology", nameAmharic: "ባዮሎጂ", code: "BIO", gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-geo", name: "Geography", nameAmharic: "ጂኦግራፊ", code: "GEO", gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-his", name: "History", nameAmharic: "ታሪክ", code: "HIS", gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: true },
  { id: "sub-civ", name: "Civics and Ethical Education", nameAmharic: "ሥነ-ዜጋ", code: "CIV", gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: false },
  { id: "sub-ict", name: "Information Technology", nameAmharic: "መረጃ ቴክኖሎጂ", code: "ICT", gradeLevels: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], isNationalExamSubject: false }
];

export const initialTeachers: Teacher[] = [
  {
    id: "tch-1",
    name: "Alemayehu Tadesse",
    nameAmharic: "አለማየሁ ታደሰ",
    email: "alemayehu.t@focusacademy.edu.et",
    phone: "+251 911-23-4567",
    role: "Teacher",
    status: "Active",
    joinedDate: "2023-09-01",
    specialization: "Mathematics",
    assignedGrades: ["Grade 7", "Grade 8", "Grade 9"],
    assignedSections: ["A", "B"],
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
    teacherCode: "TCH-9081"
  },
  {
    id: "tch-2",
    name: "Tigist Gidey",
    nameAmharic: "ትዕግስት ግደይ",
    email: "tigist.g@focusacademy.edu.et",
    phone: "+251 912-88-1122",
    role: "Teacher",
    status: "Active",
    joinedDate: "2024-09-11",
    specialization: "Physics & General Science",
    assignedGrades: ["Grade 8", "Grade 9", "Grade 10"],
    assignedSections: ["A", "B", "C"],
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
    teacherCode: "TCH-3129"
  },
  {
    id: "tch-3",
    name: "Mulugeta Kebede",
    nameAmharic: "ሙሉጌታ ከበደ",
    email: "mulugeta.k@focusacademy.edu.et",
    phone: "+251 920-33-4455",
    role: "Teacher",
    status: "Active",
    joinedDate: "2022-09-01",
    specialization: "Amharic & English Literature",
    assignedGrades: ["Grade 6", "Grade 7", "Grade 8"],
    assignedSections: ["A", "B", "C", "D"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    teacherCode: "TCH-5110"
  },
  {
    id: "tch-4",
    name: "Helen Yosef",
    nameAmharic: "ሄለን ዮሴፍ",
    email: "helen.y@focusacademy.edu.et",
    phone: "+251 911-50-6070",
    role: "Teacher",
    status: "Active",
    joinedDate: "2025-01-15",
    specialization: "Biology & Chemistry",
    assignedGrades: ["Grade 11", "Grade 12"],
    assignedSections: ["A", "B"],
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    teacherCode: "TCH-4040"
  }
];

export const initialParents: Parent[] = [
  {
    id: "prnt-1",
    name: "Bekele Wolde",
    nameAmharic: "በቀለ ወልዴ",
    email: "bekele.w@gmail.com",
    phone: "+251 911-34-5890",
    role: "Parent",
    status: "Active",
    joinedDate: "2023-09-01",
    childId: "std-1",
    childName: "Yonas Bekele",
    occupation: "Senior Engineer",
    officePhone: "+251 11-445-6789"
  },
  {
    id: "prnt-2",
    name: "Aster Gebre",
    nameAmharic: "አስቴር ገብሬ",
    email: "aster.g@yahoo.com",
    phone: "+251 912-55-6677",
    role: "Parent",
    status: "Active",
    joinedDate: "2024-09-11",
    childId: "std-2",
    childName: "Seble Hailu",
    occupation: "Merchant",
    officePhone: "+251 11-555-1212"
  },
  {
    id: "prnt-3",
    name: "Dr. Birhanu Demissie",
    nameAmharic: "ዶ/ር ብርሃኑ ደሚሴ",
    email: "birhanu.dem@gmail.com",
    phone: "+251 911-12-3499",
    role: "Parent",
    status: "Active",
    joinedDate: "2025-09-01",
    childId: "std-3",
    childName: "Elias Birhanu",
    occupation: "Medical Doctor",
    officePhone: "+251 11-551-2345"
  },
  {
    id: "prnt-4",
    name: "Genet Mengistu",
    nameAmharic: "ገነት መንግስቱ",
    email: "genet.m@outlook.com",
    phone: "+251 913-77-8899",
    role: "Parent",
    status: "Active",
    joinedDate: "2025-09-01",
    childId: "std-4",
    childName: "Tsion Samuel",
    occupation: "Bank Manager",
    officePhone: "+251 11-662-8090"
  },
  {
    id: "prnt-5",
    name: "Kassa Tekle",
    nameAmharic: "ካሳ ተክሌ",
    email: "kassa.tekle@cbe.com.et",
    phone: "+251 911-40-5060",
    role: "Parent",
    status: "Active",
    joinedDate: "2023-09-01",
    childId: "std-5",
    childName: "Abebe Kassa",
    occupation: "Accountant"
  }
];

export const initialStudents: Student[] = [
  {
    id: "std-1",
    name: "Yonas Bekele",
    nameAmharic: "ዮናስ በቀለ",
    email: "yonas.bek@focusacademy.edu.et",
    phone: "+251 988-12-3456",
    role: "Student",
    status: "Active",
    joinedDate: "2024-09-01",
    rollNo: "R-045",
    grade: "Grade 8",
    section: "A",
    parentId: "prnt-1",
    parentName: "Bekele Wolde",
    attendanceRatio: 0.95,
    conductRating: "Excellent",
    schoolReportComments: "Yonas is an outstanding student with an exceptional logical mindset. Excellent behavior.",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80",
    studentCode: "1001"
  },
  {
    id: "std-2",
    name: "Seble Hailu",
    nameAmharic: "ሰምል ኃይሉ",
    email: "seble.h@focusacademy.edu.et",
    phone: "+251 944-55-6677",
    role: "Student",
    status: "Active",
    joinedDate: "2024-09-01",
    rollNo: "R-012",
    grade: "Grade 8",
    section: "A",
    parentId: "prnt-2",
    parentName: "Aster Gebre",
    attendanceRatio: 0.92,
    conductRating: "Very Good",
    schoolReportComments: "Seble shows great dedication in her studies, particularly in literature, and is very polite.",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80",
    studentCode: "1002"
  },
  {
    id: "std-3",
    name: "Elias Birhanu",
    nameAmharic: "ኤልያስ ብርሃኑ",
    email: "elias.b@focusacademy.edu.et",
    phone: "+251 966-22-3344",
    role: "Student",
    status: "Active",
    joinedDate: "2025-09-01",
    rollNo: "R-109",
    grade: "Grade 11",
    section: "B",
    parentId: "prnt-3",
    parentName: "Dr. Birhanu Demissie",
    attendanceRatio: 0.98,
    conductRating: "Excellent",
    schoolReportComments: "Elias demonstrates immense analytical depth in senior science subjects. Reliable and helpful leader.",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80",
    studentCode: "1003"
  },
  {
    id: "std-4",
    name: "Tsion Samuel",
    nameAmharic: "ፅዮን ሳሙኤል",
    email: "tsion.s@focusacademy.edu.et",
    phone: "+251 915-44-3322",
    role: "Student",
    status: "Active",
    joinedDate: "2025-09-01",
    rollNo: "R-112",
    grade: "Grade 11",
    section: "B",
    parentId: "prnt-4",
    parentName: "Genet Mengistu",
    attendanceRatio: 0.89,
    conductRating: "Good",
    schoolReportComments: "Tsion has great potential but gets distracted easily in class. Additional revision will assist her.",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80",
    studentCode: "1004"
  },
  {
    id: "std-5",
    name: "Abebe Kassa",
    nameAmharic: "አበበ ካሳ",
    email: "abebe.k@focusacademy.edu.et",
    phone: "+251 922-11-0011",
    role: "Student",
    status: "Active",
    joinedDate: "2023-09-01",
    rollNo: "R-002",
    grade: "Grade 8",
    section: "B",
    parentId: "prnt-5",
    parentName: "Kassa Tekle",
    attendanceRatio: 0.94,
    conductRating: "Very Good",
    schoolReportComments: "Abebe performs solid work persistently. Fully cooperative and displays keen interest.",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80"
  },
  {
    id: "std-6",
    name: "Kalkidan Tesfaye",
    nameAmharic: "ቃልኪዳን ተስፋዬ",
    email: "kalkidan.t@focusacademy.edu.et",
    phone: "+251 911-30-2010",
    role: "Student",
    status: "Active",
    joinedDate: "2025-09-01",
    rollNo: "R-201",
    grade: "Grade 12",
    section: "A",
    attendanceRatio: 0.96,
    conductRating: "Excellent",
    schoolReportComments: "Preparing well for her National Leaving Exams. Focused and hardworking.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"
  },
  {
    id: "std-7",
    name: "Bruk Daniel",
    nameAmharic: "ብሩክ ዳንኤል",
    email: "bruk.d@focusacademy.edu.et",
    phone: "+251 912-40-5060",
    role: "Student",
    status: "Active",
    joinedDate: "2025-09-01",
    rollNo: "R-205",
    grade: "Grade 12",
    section: "A",
    attendanceRatio: 0.82,
    conductRating: "Satisfactory",
    schoolReportComments: "Frequent absences are impacting his physics modules. Needs to pay closer attention.",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80"
  },
  {
    id: "std-8",
    name: "Hana Kebede",
    nameAmharic: "ሃና ከበደ",
    email: "hana.k@focusacademy.edu.et",
    phone: "+251 915-55-9988",
    role: "Student",
    status: "Active",
    joinedDate: "2025-09-01",
    rollNo: "R-001",
    grade: "Grade 1",
    section: "C",
    attendanceRatio: 0.91,
    conductRating: "Very Good",
    schoolReportComments: "A delightful first grader. Quick to learn colors, alphabets, and basic arithmetic.",
    photoUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=256&h=256&q=80"
  },
  {
    id: "std-9",
    name: "Dawit Abebe",
    nameAmharic: "ዳዊት አበበ",
    email: "dawit.a@focusacademy.edu.et",
    phone: "+251 911-66-7788",
    role: "Student",
    status: "Active",
    joinedDate: "2025-09-01",
    rollNo: "R-018",
    grade: "Grade 1",
    section: "C",
    attendanceRatio: 0.88,
    conductRating: "Good",
    schoolReportComments: "Dawit loves games and is active. He should write his alphabets more patiently.",
    photoUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=256&h=256&q=80"
  },
  {
    id: "std-10",
    name: "Lydia Solomon",
    nameAmharic: "ሊዲያ ሰለሞን",
    email: "lydia.s@focusacademy.edu.et",
    phone: "+251 922-44-5566",
    role: "Student",
    status: "Active",
    joinedDate: "2024-09-01",
    rollNo: "R-055",
    grade: "Grade 2",
    section: "A",
    attendanceRatio: 0.97,
    conductRating: "Excellent",
    schoolReportComments: "Lydia is polite, reads wonderfully in both languages, and is very diligent.",
    photoUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=256&h=256&q=80"
  }
];

export const initialFeeStructures: FeeStructure[] = [
  { id: "fee-1", gradeRange: "Primary", type: "Registration Fee", amount: 2500, frequency: "One-Time" },
  { id: "fee-2", gradeRange: "Primary", type: "Tuition Fee", amount: 4500, frequency: "Monthly" },
  { id: "fee-3", gradeRange: "Primary", type: "Sports & Lab Fee", amount: 1500, frequency: "Term" },
  { id: "fee-4", gradeRange: "Secondary", type: "Registration Fee", amount: 3500, frequency: "One-Time" },
  { id: "fee-5", gradeRange: "Secondary", type: "Tuition Fee", amount: 6500, frequency: "Monthly" },
  { id: "fee-6", gradeRange: "Secondary", type: "Sports & Lab Fee", amount: 2500, frequency: "Term" }
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    studentId: "std-1",
    studentName: "Yonas Bekele",
    grade: "Grade 8",
    section: "A",
    feeType: "Tuition Fee",
    amount: 4500,
    dateIssued: "2026-06-01",
    dueDate: "2026-06-15",
    paidAmount: 4500,
    balance: 0,
    status: "Paid",
    paymentHistory: [
      {
        receiptId: "REC-2026-9041",
        date: "2026-06-02",
        amountPaid: 4500,
        paymentMethod: "Telebirr",
        referenceNo: "TX-TELE-8841A8"
      }
    ]
  },
  {
    id: "INV-2026-002",
    studentId: "std-2",
    studentName: "Seble Hailu",
    grade: "Grade 8",
    section: "A",
    feeType: "Tuition Fee",
    amount: 4500,
    dateIssued: "2026-06-01",
    dueDate: "2026-06-15",
    paidAmount: 2000,
    balance: 2500,
    status: "Partially Paid",
    paymentHistory: [
      {
        receiptId: "REC-2026-9042",
        date: "2026-06-03",
        amountPaid: 2000,
        paymentMethod: "CBE Birr",
        referenceNo: "CB-B-99124A"
      }
    ]
  },
  {
    id: "INV-2026-003",
    studentId: "std-3",
    studentName: "Elias Birhanu",
    grade: "Grade 11",
    section: "B",
    feeType: "Tuition Fee",
    amount: 6500,
    dateIssued: "2026-06-01",
    dueDate: "2026-06-15",
    paidAmount: 6500,
    balance: 0,
    status: "Paid",
    paymentHistory: [
      {
        receiptId: "REC-2026-9043",
        date: "2026-06-02",
        amountPaid: 6500,
        paymentMethod: "Awash Bank Transfer",
        referenceNo: "AW-TR-55412"
      }
    ]
  },
  {
    id: "INV-2026-004",
    studentId: "std-4",
    studentName: "Tsion Samuel",
    grade: "Grade 11",
    section: "B",
    feeType: "Tuition Fee",
    amount: 6500,
    dateIssued: "2026-06-01",
    dueDate: "2026-06-15",
    paidAmount: 0,
    balance: 6500,
    status: "Unpaid",
    paymentHistory: []
  },
  {
    id: "INV-2026-005",
    studentId: "std-5",
    studentName: "Abebe Kassa",
    grade: "Grade 8",
    section: "B",
    feeType: "Tuition Fee",
    amount: 4500,
    dateIssued: "2026-06-01",
    dueDate: "2026-06-15",
    paidAmount: 4500,
    balance: 0,
    status: "Paid",
    paymentHistory: [
      {
        receiptId: "REC-2026-9045",
        date: "2026-06-01",
        amountPaid: 4500,
        paymentMethod: "Commercial Bank of Ethiopia (CBE)",
        referenceNo: "FT-CBE-1152"
      }
    ]
  }
];

export const initialScoreRecords: ScoreRecord[] = [
  // Student 1 (Yonas Bekele - Grade 8A)
  {
    id: "scr-1-mat",
    studentId: "std-1",
    studentName: "Yonas Bekele",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-mat",
    subjectName: "Mathematics",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 14,
    assignments: 14,
    participation: 9,
    continuousAssessmentTotal: 37,
    midtermScore: 19,
    finalScore: 38,
    grandTotal: 94,
    letterGrade: "A+"
  },
  {
    id: "scr-1-eng",
    studentId: "std-1",
    studentName: "Yonas Bekele",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-eng",
    subjectName: "English",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 13,
    assignments: 13,
    participation: 10,
    continuousAssessmentTotal: 36,
    midtermScore: 18,
    finalScore: 37,
    grandTotal: 91,
    letterGrade: "A+"
  },
  {
    id: "scr-1-amh",
    studentId: "std-1",
    studentName: "Yonas Bekele",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-amh",
    subjectName: "Amharic",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 12,
    assignments: 11,
    participation: 9,
    continuousAssessmentTotal: 32,
    midtermScore: 17,
    finalScore: 36,
    grandTotal: 85,
    letterGrade: "A"
  },
  {
    id: "scr-1-gsc",
    studentId: "std-1",
    studentName: "Yonas Bekele",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-gsc",
    subjectName: "General Science",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 13,
    assignments: 14,
    participation: 8,
    continuousAssessmentTotal: 35,
    midtermScore: 18,
    finalScore: 36,
    grandTotal: 89,
    letterGrade: "A"
  },

  // Student 2 (Seble Hailu - Grade 8A)
  {
    id: "scr-2-mat",
    studentId: "std-2",
    studentName: "Seble Hailu",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-mat",
    subjectName: "Mathematics",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 11,
    assignments: 10,
    participation: 8,
    continuousAssessmentTotal: 29,
    midtermScore: 14,
    finalScore: 30,
    grandTotal: 73,
    letterGrade: "B+"
  },
  {
    id: "scr-2-eng",
    studentId: "std-2",
    studentName: "Seble Hailu",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-eng",
    subjectName: "English",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 14,
    assignments: 14,
    participation: 10,
    continuousAssessmentTotal: 38,
    midtermScore: 18,
    finalScore: 38,
    grandTotal: 94,
    letterGrade: "A+"
  },
  {
    id: "scr-2-amh",
    studentId: "std-2",
    studentName: "Seble Hailu",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-amh",
    subjectName: "Amharic",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 13,
    assignments: 13,
    participation: 9,
    continuousAssessmentTotal: 35,
    midtermScore: 17,
    finalScore: 35,
    grandTotal: 87,
    letterGrade: "A"
  },
  {
    id: "scr-2-gsc",
    studentId: "std-2",
    studentName: "Seble Hailu",
    grade: "Grade 8",
    section: "A",
    subjectId: "sub-gsc",
    subjectName: "General Science",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 10,
    assignments: 12,
    participation: 8,
    continuousAssessmentTotal: 30,
    midtermScore: 15,
    finalScore: 31,
    grandTotal: 76,
    letterGrade: "A-"
  },

  // Student 5 (Abebe Kassa - Grade 8B)
  {
    id: "scr-5-mat",
    studentId: "std-5",
    studentName: "Abebe Kassa",
    grade: "Grade 8",
    section: "B",
    subjectId: "sub-mat",
    subjectName: "Mathematics",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 8,
    assignments: 9,
    participation: 7,
    continuousAssessmentTotal: 24,
    midtermScore: 12,
    finalScore: 23,
    grandTotal: 59,
    letterGrade: "B-"
  },
  {
    id: "scr-5-eng",
    studentId: "std-5",
    studentName: "Abebe Kassa",
    grade: "Grade 8",
    section: "B",
    subjectId: "sub-eng",
    subjectName: "English",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 11,
    assignments: 10,
    participation: 8,
    continuousAssessmentTotal: 29,
    midtermScore: 13,
    finalScore: 26,
    grandTotal: 68,
    letterGrade: "B+"
  },

  // Student 3 (Elias Birhanu - Grade 11B)
  {
    id: "scr-3-mat",
    studentId: "std-3",
    studentName: "Elias Birhanu",
    grade: "Grade 11",
    section: "B",
    subjectId: "sub-mat",
    subjectName: "Mathematics",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 15,
    assignments: 14,
    participation: 10,
    continuousAssessmentTotal: 39,
    midtermScore: 20,
    finalScore: 40,
    grandTotal: 99,
    letterGrade: "A+"
  },
  {
    id: "scr-3-phy",
    studentId: "std-3",
    studentName: "Elias Birhanu",
    grade: "Grade 11",
    section: "B",
    subjectId: "sub-phy",
    subjectName: "Physics",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 14,
    assignments: 15,
    participation: 10,
    continuousAssessmentTotal: 39,
    midtermScore: 19,
    finalScore: 39,
    grandTotal: 97,
    letterGrade: "A+"
  },
  {
    id: "scr-3-che",
    studentId: "std-3",
    studentName: "Elias Birhanu",
    grade: "Grade 11",
    section: "B",
    subjectId: "sub-che",
    subjectName: "Chemistry",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 13,
    assignments: 14,
    participation: 9,
    continuousAssessmentTotal: 36,
    midtermScore: 18,
    finalScore: 36,
    grandTotal: 90,
    letterGrade: "A+"
  },

  // Student 4 (Tsion Samuel - Grade 11B)
  {
    id: "scr-4-mat",
    studentId: "std-4",
    studentName: "Tsion Samuel",
    grade: "Grade 11",
    section: "B",
    subjectId: "sub-mat",
    subjectName: "Mathematics",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 8,
    assignments: 9,
    participation: 6,
    continuousAssessmentTotal: 23,
    midtermScore: 10,
    finalScore: 15,
    grandTotal: 48,
    letterGrade: "C+"
  },
  {
    id: "scr-4-phy",
    studentId: "std-4",
    studentName: "Tsion Samuel",
    grade: "Grade 11",
    section: "B",
    subjectId: "sub-phy",
    subjectName: "Physics",
    semester: "Semester 1",
    academicYear: "2026-2027",
    quizzes: 4,
    assignments: 6,
    participation: 5,
    continuousAssessmentTotal: 15,
    midtermScore: 7,
    finalScore: 11,
    grandTotal: 33,
    letterGrade: "F"
  }
];

export const initialTimetable: TimetableEntry[] = [
  { id: "tt-1", grade: "Grade 8", section: "A", day: "Monday", period: 1, subjectId: "sub-mat", subjectName: "Mathematics", teacherId: "tch-1", teacherName: "Alemayehu Tadesse", timeSlot: "8:30 AM - 9:15 AM" },
  { id: "tt-2", grade: "Grade 8", section: "A", day: "Monday", period: 2, subjectId: "sub-gsc", subjectName: "General Science", teacherId: "tch-2", teacherName: "Tigist Gidey", timeSlot: "9:15 AM - 10:00 AM" },
  { id: "tt-3", grade: "Grade 8", section: "A", day: "Monday", period: 3, subjectId: "sub-amh", subjectName: "Amharic", teacherId: "tch-3", teacherName: "Mulugeta Kebede", timeSlot: "10:15 AM - 11:00 AM" },
  { id: "tt-4", grade: "Grade 8", section: "A", day: "Monday", period: 4, subjectId: "sub-eng", subjectName: "English", teacherId: "tch-3", teacherName: "Mulugeta Kebede", timeSlot: "11:00 AM - 11:45 AM" }
];

export const initialAttendance: AttendanceRecord[] = [
  {
    date: "2026-06-08",
    grade: "Grade 8",
    section: "A",
    records: [
      { studentId: "std-1", studentName: "Yonas Bekele", isPresent: true },
      { studentId: "std-2", studentName: "Seble Hailu", isPresent: true },
      { studentId: "std-5", studentName: "Abebe Kassa", isPresent: false, remarks: "Sick leave" }
    ]
  }
];

// Grade classification standard for Ethiopian Ministry of Education
export function getEthiopianLetterGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 83) return "A";
  if (score >= 75) return "A-";
  if (score >= 68) return "B+";
  if (score >= 60) return "B";
  if (score >= 52) return "B-";
  if (score >= 45) return "C+";
  if (score >= 40) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function isSubjectForGrade(subject: Subject, grade: string): boolean {
  return subject.gradeLevels.includes(grade);
}
