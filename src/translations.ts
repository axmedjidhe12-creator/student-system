/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppTranslations {
  // Navigation
  dashboard: string;
  schoolManagement: string;
  userManagement: string;
  academicManagement: string;
  financialManagement: string;
  reportsCenter: string;
  adminCenter: string;
  schoolProfile: string;
  academicYear: string;
  semester: string;
  promotionSystem: string;

  // General labels
  allRightsReserved: string;
  addisAbaba: string;
  add: string;
  edit: string;
  delete: string;
  cancel: string;
  save: string;
  actions: string;
  status: string;
  active: string;
  inactive: string;
  search: string;
  grade: string;
  section: string;
  subject: string;
  teacher: string;
  student: string;
  parent: string;
  role: string;
  name: string;
  phone: string;
  email: string;
  address: string;

  // Dashboards stats
  totalStudents: string;
  totalTeachers: string;
  totalParents: string;
  totalClasses: string;
  totalFeesCollected: string;
  attendancePercentage: string;
  schoolPerformanceAnalytics: string;
  examinationStatistics: string;

  // Academics
  midtermExam: string;
  finalExam: string;
  continuousAssessment: string;
  totalMarks: string;
  average: string;
  letterGrade: string;
  rank: string;
  promoted: string;
  failed: string;
  repeating: string;
  promotedStatus: string;
  promotionRules: string;

  // Finance
  feeStructure: string;
  paymentTracking: string;
  receiptGeneration: string;
  invoiceId: string;
  amount: string;
  paidAmount: string;
  balance: string;
  issuedDate: string;
  dueDate: string;
  makePayment: string;
  paymentMethod: string;
  referenceNo: string;

  // Report cards & Documents
  studentIdCard: string;
  reportCard: string;
  feeReceipt: string;
  studentCertificate: string;
  transferCertificate: string;
  conductRating: string;
  principalSignature: string;
  ethiopiaGov: string;
}

export const translations: Record<'EN' | 'SO', AppTranslations> = {
  EN: {
    dashboard: "Dashboard",
    schoolManagement: "School Management",
    userManagement: "User Management",
    academicManagement: "Academic Management",
    financialManagement: "Financial Management",
    reportsCenter: "Reports Center",
    adminCenter: "Admin Center",
    schoolProfile: "School Profile",
    academicYear: "Academic Year",
    semester: "Semester",
    promotionSystem: "Student Promotion System",

    allRightsReserved: "All rights reserved. Focus Academy Ethiopia.",
    addisAbaba: "Addis Ababa, Ethiopia",
    add: "Add New",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save Changes",
    actions: "Actions",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    search: "Search...",
    grade: "Grade",
    section: "Section",
    subject: "Subject",
    teacher: "Teacher",
    student: "Student",
    parent: "Parent",
    role: "Role",
    name: "Name",
    phone: "Phone Number",
    email: "Email Address",
    address: "Location Address",

    totalStudents: "Total Students",
    totalTeachers: "Total Teachers",
    totalParents: "Total Parents",
    totalClasses: "Total Classes",
    totalFeesCollected: "Total Fees Collected (ETB)",
    attendancePercentage: "Avg Attendance %",
    schoolPerformanceAnalytics: "School Performance Analytics",
    examinationStatistics: "Continuous & Annual Exam Performance",

    midtermExam: "Midterm Exam",
    finalExam: "Final Exam",
    continuousAssessment: "Continuous Assessment (CA)",
    totalMarks: "Total Marks",
    average: "Average Score",
    letterGrade: "Grade",
    rank: "Section Rank",
    promoted: "Promoted",
    failed: "Failed",
    repeating: "Repeating",
    promotedStatus: "Promotion Status",
    promotionRules: "Ministry of Education Standard Promotion Rules",

    feeStructure: "School Fee Structure",
    paymentTracking: "Payment Ledger",
    receiptGeneration: "Printable Receipt",
    invoiceId: "Invoice Code",
    amount: "Amount (ETB)",
    paidAmount: "Paid (ETB)",
    balance: "Balance Due",
    issuedDate: "Issued Date",
    dueDate: "Due Date",
    makePayment: "Record Payment Flow",
    paymentMethod: "Payment Channels",
    referenceNo: "Transfer Ref No",

    studentIdCard: "Student ID Card",
    reportCard: "Academic Report Card",
    feeReceipt: "Payment Receipt",
    studentCertificate: "Appreciation Certificate",
    transferCertificate: "School Leaving Transfer Certificate",
    conductRating: "Conduct Grade",
    principalSignature: "Seal and Signature",
    ethiopiaGov: "FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA - MINISTRY OF EDUCATION"
  },
  SO: {
    dashboard: "Xogta Guud",
    schoolManagement: "Maamulka Dugsiga",
    userManagement: "Maamulka Isticmaalayaasha",
    academicManagement: "Maamulka Waxbarashada",
    financialManagement: "Maamulka Maaliyadda",
    reportsCenter: "Xarunta Warbixinnada",
    adminCenter: "Xarunta Maamulka",
    schoolProfile: "Xogta Dugsiga",
    academicYear: "Sannad Waxbarashadeed",
    semester: "Semester",
    promotionSystem: "Nidaamka Gudbinta Ardayda",

    allRightsReserved: "Dhammaan xuquuqdu waa dhowran yihiin. Focus Academy Ethiopia.",
    addisAbaba: "Addis Ababa, Itoobiya",
    add: "Ku dar Cusub",
    edit: "Wax ka beddel",
    delete: "Tirtir",
    cancel: "Ka noqo",
    save: "Kaydi Isbeddellada",
    actions: "Abaabulada",
    status: "Xaaladda",
    active: "Firfircoon",
    inactive: "Aan firfirconayn",
    search: "Raadi...",
    grade: "Fasalka",
    section: "Qaybta",
    subject: "Maddada",
    teacher: "Macallinka",
    student: "Ardayga",
    parent: "Waalidka",
    role: "Doorka",
    name: "Magaca",
    phone: "Lambarka Taleefanka",
    email: "Cinwaanka Emailka",
    address: "Cinwaanka Goobta",

    totalStudents: "Wadar Ardayda",
    totalTeachers: "Wadar Macallimiinta",
    totalParents: "Wadar Waalidiinta",
    totalClasses: "Wadar Fasallada",
    totalFeesCollected: "Wadar Lacagaha la Ururiyay (ETB)",
    attendancePercentage: "Celceliska Joogitaanka %",
    schoolPerformanceAnalytics: "Falanqaynta Waxqabadka Dugsiga",
    examinationStatistics: "Waxqabadka Imtixaanka Joogtada ah & Sannadlaha ah",

    midtermExam: "Imtixaanka Dhexda",
    finalExam: "Imtixaanka Sannadka/U dambeeya",
    continuousAssessment: "Qiimaynta Joogtada ah (CA)",
    totalMarks: "Wadar Dhibcaha",
    average: "Celceliska Dhibcaha",
    letterGrade: "Heerka (Xaraf)",
    rank: "Darajada Qaybta",
    promoted: "Gudbay",
    failed: "Haray",
    repeating: "Ku celinaya",
    promotedStatus: "Xaaladda Gudbinta",
    promotionRules: "Xeerarka Gudbinta ee Wasaaradda Waxbarashada",

    feeStructure: "Qaab-dhismeedka Lacagaha Dugsiga",
    paymentTracking: "Diiwaanka Lacag-bixinta",
    receiptGeneration: "Rasiidh la Dhaabici karo",
    invoiceId: "Koodhka Biilka",
    amount: "Lacagta (ETB)",
    paidAmount: "La bixiyay (ETB)",
    balance: "Dhimman",
    issuedDate: "Taariikhda la bixiyay",
    dueDate: "Taariikhda ugu dambaysa",
    makePayment: "Diiwaangali Lacag-bixinta",
    paymentMethod: "Habka Lacag-bixinta",
    referenceNo: "Tixraaca Wareejinta",

    studentIdCard: "Kaarka Aqoonsiga Ardayga",
    reportCard: "Kaarka Warbixinta Waxbarashada",
    feeReceipt: "Rasiidhka Lacag-bixinta",
    studentCertificate: "Shahaadada Sharaf",
    transferCertificate: "Shahaadada Wareejinta ee Dugsiga ka bixidda",
    conductRating: "Darajada Dhaqanka",
    principalSignature: "Shaabadda & Saxeexa",
    ethiopiaGov: "FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA - MINISTRY OF EDUCATION"
  }
};
