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

export const translations: Record<'EN' | 'AM' | 'SO', AppTranslations> = {
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
  AM: {
    dashboard: "ዳሽቦርድ",
    schoolManagement: "የትምህርት ቤት አስተዳደር",
    userManagement: "የተጠቃሚዎች አስተዳደር",
    academicManagement: "የአካዳሚክ አስተዳደር",
    financialManagement: "የፋይናንስ አስተዳደር",
    reportsCenter: "የሪፖርቶች ማዕከል",
    adminCenter: "ዋና አስተዳደር ማዕከል",
    schoolProfile: "የትምህርት ቤቱ መግለጫ",
    academicYear: "የጥናት ዘመን (ዓ.ም.)",
    semester: "ሴሚስተር",
    promotionSystem: "የተማሪዎች ክፍል ማደግ ስርዓት",

    allRightsReserved: "መብቱ በህግ የተጠበቀ ነው። ፎከስ አካዳሚ ኢትዮጵያ።",
    addisAbaba: "አዲስ አበባ ፣ ኢትዮጵያ",
    add: "አዲስ ጨምር",
    edit: "አስተካክል",
    delete: "ሰርዝ",
    cancel: "አቋርጥ",
    save: "ለውጦችን አስቀምጥ",
    actions: "ድርጊቶች",
    status: "ሁኔታ",
    active: "ገባሪ",
    inactive: "ያልነቃ",
    search: "ፈልግ...",
    grade: "ክፍል",
    section: "ግሩፕ (ሴክሽን)",
    subject: "ትምህርት (ሳብጀክት)",
    teacher: "መምህር",
    student: "ተማሪ",
    parent: "ወላጅ",
    role: "ኃላፊነት",
    name: "ሙሉ ስም",
    phone: "ስልክ ቁጥር",
    email: "ኢሜይል አድራሻ",
    address: "አድራሻ",

    totalStudents: "አጠቃላይ ተማሪዎች",
    totalTeachers: "አጠቃላይ መምህራን",
    totalParents: "አጠቃላይ ወላጆች",
    totalClasses: "ክፍሎች ብዛት",
    totalFeesCollected: "የተሰበሰበ ክፍያ (ብር)",
    attendancePercentage: "አማካኝ የአቅርቦት መጠን %",
    schoolPerformanceAnalytics: "የትምህርት ቤት አፈጻጸም ትንተና",
    examinationStatistics: "ቀጣይነት ያለው ምዘና እና ዓመታዊ ፈተናዎች ውጤት",

    midtermExam: "የግማሽ ሴሚስተር ፈተና (20%)",
    finalExam: "የሴሚስተር ማጠቃለያ ፈተና (40%)",
    continuousAssessment: "ቀጣይነት ያለው የክፍል ምዘና (40%)",
    totalMarks: "ጠቅላላ ውጤት (100%)",
    average: "አማካይ ውጤት",
    letterGrade: "ደረጃ (ፊደል)",
    rank: "ደረጃ",
    promoted: "ያለፈ",
    failed: "የወደቀ",
    repeating: "ደጋሚ",
    promotedStatus: "ቀጣይ ክፍል ሁኔታ",
    promotionRules: "ከትምህርት ሚኒስቴር የወጡ የክፍል ማደጊያ መስፈርቶች",

    feeStructure: "የትምህርት ቤት ክፍያዎች ተመን",
    paymentTracking: "የክፍያ መዝገብ",
    receiptGeneration: "ሊታተም የሚችል ደረሰኝ",
    invoiceId: "የደረሰኝ ኮድ",
    amount: "ዋጋ (ብር)",
    paidAmount: "የተከፈለ (ብር)",
    balance: "ቀሪ ዕዳ (ብር)",
    issuedDate: "የተሰጠበት ቀን",
    dueDate: "መክፈያ ቀን",
    makePayment: "ክፍያ መዝግብ",
    paymentMethod: "የክፍያ መንገዶች",
    referenceNo: "የባንክ ማስተላለፊያ ቁጥር",

    studentIdCard: "የተማሪ መታወቂያ ካርድ",
    reportCard: "የትምህርት ውጤት መግለጫ (ሪፖርት ካርድ)",
    feeReceipt: "የክፍያ ደረሰኝ",
    studentCertificate: "የምስጋና የምስክር ወረቀት",
    transferCertificate: "የትምህርት ቤት የመልቀቂያ ሰርተፍኬት",
    conductRating: "የባህሪ ደረጃ",
    principalSignature: "የትምህርት ቤቱ ማህተም እና ፊርማ",
    ethiopiaGov: "የኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ - የትምህርት ሚኒስቴር"
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
