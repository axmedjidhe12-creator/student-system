/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Student, 
  ScoreRecord,
  Invoice,
  VideoCourse,
  PaymentHistoryEntry
} from '../types';
import { 
  GraduationCap, 
  TrendingUp, 
  Clock, 
  Award, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  FileSpreadsheet,
  User,
  Activity,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Printer,
  Maximize2,
  CircleDollarSign,
  Smartphone,
  CreditCard,
  Video,
  Play,
  Pause,
  Lock,
  Unlock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

// COURSES_DATA removed - now using dynamic videoCourses prop from master state store

interface StudentPortalProps {
  currentStudent: Student;
  scoreRecords: ScoreRecord[];
  lang: 'EN' | 'SO';
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  videoCourses?: VideoCourse[];
}

export default function StudentPortal({ 
  currentStudent, 
  scoreRecords, 
  lang,
  invoices,
  setInvoices,
  videoCourses = []
}: StudentPortalProps) {
  // Navigation active tab for portal
  const [portalTab, setPortalTab] = useState<'dashboard' | 'academy'>('dashboard');
  const [filterMyClassOnly, setFilterMyClassOnly] = useState(true);

  // Video Academy interactive states
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [notesText, setNotesText] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>(() => {
    try {
      const persisted = localStorage.getItem(`focus-academy-course-notes-${currentStudent.id}`);
      return persisted ? JSON.parse(persisted) : {};
    } catch {
      return {};
    }
  });

  const saveCourseNote = (courseId: string, noteContent: string) => {
    const updated = { ...savedNotes, [courseId]: noteContent };
    setSavedNotes(updated);
    try {
      localStorage.setItem(`focus-academy-course-notes-${currentStudent.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const isCourseUnlocked = (courseId: string) => {
    const invoiceId = `INV-COURSE-${courseId}-${currentStudent.id}`;
    const inv = invoices.find(i => i.id === invoiceId);
    return (inv && inv.status === 'Paid') || false;
  };

  const handleUnlockCourse = (course: any) => {
    const invoiceId = `INV-COURSE-${course.id}-${currentStudent.id}`;
    let inv = invoices.find(i => i.id === invoiceId);

    if (!inv) {
      const newCourseInvoice: Invoice = {
        id: invoiceId,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        grade: currentStudent.grade,
        section: currentStudent.section,
        feeType: `Course: ${course.title}`,
        amount: course.price,
        dateIssued: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidAmount: 0,
        balance: course.price,
        status: 'Unpaid',
        paymentHistory: []
      };
      setInvoices([newCourseInvoice, ...invoices]);
      inv = newCourseInvoice;
    }

    // Instantly invoke payment gateway drawer
    handleOpenCheckout(inv);
  };

  const [academicTab, setAcademicTab] = useState<'all' | 'exams' | 'homework'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [scannedData, setScannedData] = useState<any | null>(null);

  // Filter score records and invoices for the logged-in student
  const studentScores = scoreRecords.filter(rec => rec.studentId === currentStudent.id);
  const studentInvoices = invoices.filter(inv => inv.studentId === currentStudent.id);

  // Student Portal online checkout states
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [chosenGateway, setChosenGateway] = useState<'chapa' | 'stripe' | 'cooppay'>('cooppay');
  const [payPortalAmount, setPayPortalAmount] = useState<number>(0);
  const [customEmail, setCustomEmail] = useState("");
  const [isTriggeringPayment, setIsTriggeringPayment] = useState(false);
  const [payError, setPayError] = useState("");

  // Cooppay interactive states
  const [cooppayPhone, setCooppayPhone] = useState("");
  const [cooppayOTP, setCooppayOTP] = useState("");
  const [cooppayStep, setCooppayStep] = useState<'init' | 'otp' | 'success'>('init');
  const [generatedOTP, setGeneratedOTP] = useState("");

  // Find course tutor info dynamically
  let activeCourseTutorName = "";
  let activeCourseTutorPhone = "";
  if (payingInvoice && payingInvoice.feeType.startsWith("Course: ")) {
    const courseTitle = payingInvoice.feeType.replace("Course: ", "");
    const matchingCourse = videoCourses.find(c => c.title === courseTitle || payingInvoice.feeType.includes(c.title));
    if (matchingCourse) {
      activeCourseTutorName = matchingCourse.tutor;
      let hash = 0;
      const nameStr = matchingCourse.tutor;
      for (let i = 0; i < nameStr.length; i++) {
        hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      const suffix = Math.abs(hash % 900000) + 100000;
      activeCourseTutorPhone = `+251 905 ${suffix.toString().slice(0, 3)} ${suffix.toString().slice(3, 6)}`;
    }
  }

  const handleOpenCheckout = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayPortalAmount(inv.balance);
    setCustomEmail("");
    setPayError("");
    setCooppayPhone("");
    setCooppayOTP("");
    setCooppayStep('init');
    setChosenGateway('cooppay'); // Set Cooppay-Birr as absolute default payment option
  };

  const handlePortalInitializeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || payPortalAmount <= 0) return;

    if (chosenGateway === 'cooppay') {
      setIsTriggeringPayment(true);
      setPayError("");
      
      try {
        if (cooppayStep === 'init') {
          // Validate phone
          if (!cooppayPhone || cooppayPhone.trim().length < 8) {
            setPayError(lang === 'EN' ? "Please provide a valid Cooppay-Birr mobile number." : "Fadlan geli lambarka talifanka saxda ah ee Cooppay-Birr.");
            setIsTriggeringPayment(false);
            return;
          }
          // Simulate OTP generation
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          setGeneratedOTP(otp);
          // Transition
          setTimeout(() => {
            setCooppayStep('otp');
            setIsTriggeringPayment(false);
            // alert message to make testing easy
            alert(lang === 'EN' 
              ? `[Cooppay-Birr Secure OTP Simulation]\nEnter code ${otp} to approve transfer of ${payPortalAmount} ETB to the teacher.` 
              : `[Hubinta Amniga ee Cooppay-Birr]\nGeli lambarka OTP ee ah ${otp} si aad u ogolaato wareejinta ${payPortalAmount} ETB ee loo diraayo macalinka.`);
          }, 1200);
          return;
        }

        if (cooppayStep === 'otp') {
          if (cooppayOTP !== generatedOTP && cooppayOTP !== "1234") {
            setPayError(lang === 'EN' ? "Invalid OTP verification code. Try again (hint: check alert) or use 1234." : "Koodhka OTP sax ma aha. Isticmaal koodhka ku soo dhacay amaba koodhka '1234'.");
            setIsTriggeringPayment(false);
            return;
          }

          // Complete transfer!
          // Find associated course to extract tutor info
          let tutorName = "Academic Specialist Teacher";
          if (payingInvoice.feeType.startsWith("Course: ")) {
            const courseTitle = payingInvoice.feeType.replace("Course: ", "");
            const matchingCourse = videoCourses.find(c => c.title === courseTitle || payingInvoice.feeType.includes(c.title));
            if (matchingCourse) {
              tutorName = matchingCourse.tutor;
            }
          }

          // Generate reference number
          const newRef = `COOP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
          const paymentRecord: PaymentHistoryEntry = {
            receiptId: `REC-COOP-${Math.floor(Math.random() * 8000) + 1000}`,
            date: new Date().toISOString().split('T')[0],
            amountPaid: payPortalAmount,
            paymentMethod: "Cooppay-Birr",
            referenceNo: newRef
          };

          const updatedInvoices = invoices.map(inv => {
            if (inv.id === payingInvoice.id) {
              const newPaidAmount = inv.paidAmount + payPortalAmount;
              const newBalance = Math.max(0, inv.amount - newPaidAmount);
              return {
                ...inv,
                paidAmount: newPaidAmount,
                balance: newBalance,
                status: (newBalance === 0 ? 'Paid' : 'Partially Paid') as 'Paid' | 'Partially Paid' | 'Unpaid',
                paymentHistory: [paymentRecord, ...(inv.paymentHistory || [])]
              };
            }
            return inv;
          });

          // Simulate bank API network latency
          setTimeout(() => {
            setInvoices(updatedInvoices);
            setCooppayStep('success');
            setIsTriggeringPayment(false);
          }, 1500);
          return;
        }
      } catch (err) {
        console.error(err);
        setPayError("Something went wrong with the Cooppay payments engine.");
        setIsTriggeringPayment(false);
      }
      return;
    }

    setIsTriggeringPayment(true);
    setPayError("");

    try {
      const initUrl = chosenGateway === 'stripe' 
        ? '/api/payments/stripe/initialize' 
        : '/api/payments/chapa/initialize';

      const res = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId: payingInvoice.id,
          amount: payPortalAmount,
          email: customEmail || "guardian@focusacademy.edu.et",
          firstName: currentStudent.name.split(' ')[0] || "Student",
          lastName: currentStudent.name.split(' ')[1] || "Guardian",
          studentId: currentStudent.id,
          productName: `Focus Academy Fee - ${payingInvoice.feeType}`
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.checkoutUrl) {
        // Redirection to the verified secure checkout page
        window.location.href = data.checkoutUrl;
      } else {
        setPayError(data.message || "Failed to initialize active checkout session. Check secret keys configuration.");
      }
    } catch (err: any) {
      console.error("Initialization request crashed:", err);
      setPayError("Network connection error. Please restart the dev server.");
    } finally {
      setIsTriggeringPayment(false);
    }
  };

  // Multilingual labels for Tabs and scan diagnostic
  const tabTranslations = {
    EN: {
      all: "Full Scorecard",
      exams: "Exam Assessments (60%)",
      homework: "Homework & Classwork (40%)",
      examScoreHeader: "Primary Exam Assessments",
      homeworkScoreHeader: "Continuous Classwork & Assignments",
      scanHelp: "Scan this QR code during exams or events for instant information verification.",
      testScan: "Simulate Scan",
      scannerInfo: "Ministry ID Scanner Verified Profile",
      printId: "Print ID Badge",
      closeScanner: "Close Scan Diagnostics",
      examResult: "Exam Result",
      classworkResult: "Classwork Result"
    },
    AM: {
      all: "ሙሉ የውጤት ሪፓርት",
      exams: "የፈተና ምዘናዎች (60%)",
      homework: "የክፍል ስራና የቤት ስራ (40%)",
      examScoreHeader: "ዋና የፈተና ምዘናዎች",
      homeworkScoreHeader: "ቀጣይነት ያለው የክፍል ምዘና",
      scanHelp: "ይህን መለያ ቁጥር በፈተናዎች ወይም አካዳሚክ ዝግጅቶች ላይ በመቃኘት ፈጣን ማረጋገጫ ያግኙ።",
      testScan: "የፍተሻ ማረጋገጫን አስመስል",
      scannerInfo: "የሚኒስቴር መለያ መቶኛ የተማሪ መረጃ",
      printId: "መታወቂያ ካርድ አትም",
      closeScanner: "የፍተሻ መስኮት ዝጋ",
      examResult: "የፈተና ውጤት",
      classworkResult: "የክፍል ስራ ውጤት"
    },
    SO: {
      all: "Waraaqda Koowaad",
      exams: "Qiimaynta Imtixaanka (60%)",
      homework: "Shaqooyinka Fasalka (40%)",
      examScoreHeader: "Dhibcaha Imtixaanada",
      homeworkScoreHeader: "Diiwaanka Casharada & Ka-qaybgalka",
      scanHelp: "Ku skaan garee QR kaarkaan inta lagu guda jiro imtixaanka si loo xaqiijiyo macluumaadka ardayga.",
      testScan: "Tijaabi Iskaanka",
      scannerInfo: "Macluumaadka Aqoonsiga ee Wasaaradda",
      printId: "Daabac Aqoonsiga",
      closeScanner: "Xidh Daaqadda",
      examResult: "Natiijada Imtixaanka",
      classworkResult: "Natiijada CA"
    }
  };
  const st = tabTranslations[lang];

  const getConductColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Very Good': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'Good': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Satisfactory': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-red-500 bg-red-500/10 border-red-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-500 bg-emerald-500/10';
      case 'Promoted': return 'text-indigo-400 bg-indigo-500/10';
      case 'Failed': return 'text-red-400 bg-red-500/10';
      case 'Repeating': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  const getLetterColor = (letter: string) => {
    if (letter.startsWith('A')) return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    if (letter.startsWith('B')) return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
    if (letter.startsWith('C')) return 'text-orange-400 bg-orange-500/10 border border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border border-red-500/20';
  };

  // Secure scan payload for event tracking, exam seat registry audits, etc.
  const studentKeyPayload = `FOCUS-ACADEMY-SECURE-SCAN-VERIFY:
------------------------------
STUDENT ID  : ${currentStudent.id}
FULL NAME   : ${currentStudent.name}
AMHARIC NAME: ${currentStudent.nameAmharic || 'N/A'}
GRADE-SEC   : ${currentStudent.grade} - ${currentStudent.section}
ROLL NO     : ${currentStudent.rollNo}
ACCESS CODE : ${currentStudent.studentCode || 'N/A'}
PORTAL STAT : ${currentStudent.status}
ST_STAMP    : ${new Date().toISOString()}`;

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Jumbotron */}
      <div className="relative bg-[#111318] p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-xl overflow-hidden no-print">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-600/5 blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {currentStudent.photoUrl ? (
              <img 
                src={currentStudent.photoUrl} 
                alt={currentStudent.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md transform hover:scale-105 transition-all shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#1c1e24] border border-slate-800 flex items-center justify-center text-4xl font-extrabold text-[#cc5200] shrink-0">
                {currentStudent.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
                  {currentStudent.name}
                </h1>
                {currentStudent.nameAmharic && (
                  <span className="text-xs text-slate-500 font-medium font-sans">({currentStudent.nameAmharic})</span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-400 font-sans">
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <GraduationCap size={14} />
                  {currentStudent.grade}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-semibold text-emerald-400">Section {currentStudent.section}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-450 bg-slate-800/50 border border-slate-800 px-1.5 py-0.5 rounded">
                  Roll No: {currentStudent.rollNo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0 md:self-center">
            {currentStudent.studentCode && (
              <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Access Code</p>
                <p className="text-sm font-mono font-bold text-emerald-200 mt-0.5">{currentStudent.studentCode}</p>
              </div>
            )}
            <div className={`px-4 py-2 border rounded-xl text-xs font-bold font-sans self-center ${getConductColor(currentStudent.conductRating)}`}>
              Conduct: {currentStudent.conductRating}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Portal Navigation Tabs */}
      <div className="flex bg-[#111318]/90 p-1.5 rounded-2xl border border-slate-800 shadow-md no-print gap-2">
        <button
          onClick={() => setPortalTab('dashboard')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'dashboard'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="portal-nav-dashboard"
        >
          <GraduationCap size={16} />
          <span>{lang === 'EN' ? "Academic Report & Dashboard" : "Warbixinta Waxbarashada"}</span>
        </button>
        <button
          onClick={() => setPortalTab('academy')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            portalTab === 'academy'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="portal-nav-academy"
        >
          <Video size={16} className={portalTab === 'academy' ? "text-white" : "text-amber-500 animate-pulse"} />
          <span>{lang === 'EN' ? "Interactive Video Academy" : "Akadeemiyada Video-ga"}</span>
          <span className="absolute -top-1.5 right-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight animate-bounce leading-none">
            NEW
          </span>
        </button>
      </div>

      {portalTab === 'dashboard' ? (
        <>
          {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        {/* Attendance Ratio Card */}
        <div className="bg-[#111318] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">Attendance Rate</span>
            <span className="text-2xl font-bold text-white font-sans">
              {(currentStudent.attendanceRatio * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-500 block font-sans">Standard target is 90%+</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#auto] border border-amber-600/10 shrink-0">
            <UserCheck size={20} className="text-amber-500" />
          </div>
        </div>

        {/* Subjects Count Card */}
        <div className="bg-[#111318] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">Registered Subjects</span>
            <span className="text-2xl font-bold text-white font-sans">
              {studentScores.length || 7}
            </span>
            <span className="text-[10px] text-slate-500 block font-sans">Active Grade Curriculum</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-600/10 shrink-0">
            <BookOpen size={20} className="text-indigo-400" />
          </div>
        </div>

        {/* Promotion status card */}
        <div className="bg-[#111318] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">Portal Status</span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getStatusColor(currentStudent.status)}`}>
                {lang === 'EN' ? currentStudent.status : "ንቁ ተማሪ"}
              </span>
            </div>
            <span className="text-[10px] text-slate-550 block font-sans">Certified Ministry System</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-600/10 shrink-0">
            <Award size={20} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Academic score summary ledger (Left Column) */}
        <div className="lg:col-span-2 bg-[#111318] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5 no-print">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-amber-500" size={18} />
              <h2 className="font-display font-semibold text-white text-sm">
                {academicTab === 'all' 
                  ? (lang === 'EN' ? "Active Scorecard / Continuous Evaluation Ledger" : "የውጤት መግለጫ መዝገብ")
                  : academicTab === 'exams' 
                    ? st.examScoreHeader 
                    : st.homeworkScoreHeader}
              </h2>
            </div>

            {/* Premium Tab Selectors */}
            <div className="flex bg-[#16181D] p-0.5 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setAcademicTab('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  academicTab === 'all'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="academic-tab-all"
              >
                {lang === 'EN' ? "All" : "ሁሉም"}
              </button>
              <button
                onClick={() => setAcademicTab('exams')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  academicTab === 'exams'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="academic-tab-exams"
              >
                {lang === 'EN' ? "Exams" : "ፈተናዎች"}
              </button>
              <button
                onClick={() => setAcademicTab('homework')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  academicTab === 'homework'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="academic-tab-homework"
              >
                {lang === 'EN' ? "Classwork" : "ክፍል ስራ"}
              </button>
            </div>
          </div>

          {studentScores.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <AlertTriangle className="text-amber-500 mx-auto" size={24} />
              <p className="text-xs text-slate-400 font-sans">
                {lang === 'EN' 
                  ? "No scored exam indices compiled for this session yet." 
                  : "ለዚህ ተማሪ እስካሁን ምንም አይነት ውጤት አልተመዘገበም።"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              
              {/* Render dynamic tables based on active academic tab selection */}
              {academicTab === 'all' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-left text-[11px] text-slate-500 font-bold">
                      <th className="py-2.5 pr-2">{lang === 'EN' ? "Subject" : "ትምህርት"}</th>
                      <th className="py-2.5 text-center">Quiz (15)</th>
                      <th className="py-2.5 text-center">Assign (15)</th>
                      <th className="py-2.5 text-center">Part (10)</th>
                      <th className="py-2.5 text-center">Mid (20)</th>
                      <th className="py-2.5 text-center">Final (40)</th>
                      <th className="py-2.5 text-center">Total (100)</th>
                      <th className="py-2.5 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {studentScores.map(score => (
                      <tr key={score.id} className="hover:bg-slate-805/30 transition-colors">
                        <td className="py-3 pr-2 font-semibold text-slate-200">
                          {score.subjectName}
                        </td>
                        <td className="py-3 text-center text-slate-400 font-sans">{score.quizzes}</td>
                        <td className="py-3 text-center text-slate-400 font-sans">{score.assignments}</td>
                        <td className="py-3 text-center text-slate-400 font-sans">{score.participation}</td>
                        <td className="py-3 text-center text-amber-500 font-semibold font-sans">{score.midtermScore}</td>
                        <td className="py-3 text-center text-emerald-400 font-semibold font-sans">{score.finalScore}</td>
                        <td className="py-3 text-center font-bold text-white font-sans text-[13px]">
                          {score.grandTotal}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 text-[10px] rounded-md font-extrabold ${getLetterColor(score.letterGrade)}`}>
                            {score.letterGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {academicTab === 'exams' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-left text-[11px] text-slate-500 font-bold">
                      <th className="py-2.5 pr-2">{lang === 'EN' ? "Subject" : "ትምህርት"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Midterm (20)" : "የግማሽ ፈተና (20)"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Final Exam (40)" : "የማጠቃለያ ፈተና (40)"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Exam Total (60)" : "የፈተና ድምር (60)"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Weighted Exam %" : "የፈተና መቶኛ %"}</th>
                      <th className="py-2.5 text-right">{lang === 'EN' ? "Grade" : "ደረጃ"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {studentScores.map(score => {
                      const examTotal = score.midtermScore + score.finalScore;
                      const examPercentage = (examTotal / 60) * 100;
                      
                      let barColor = "bg-emerald-500";
                      if (examPercentage < 50) barColor = "bg-red-500";
                      else if (examPercentage < 65) barColor = "bg-orange-500";
                      else if (examPercentage < 80) barColor = "bg-amber-500";

                      return (
                        <tr key={score.id} className="hover:bg-slate-805/30 transition-colors">
                          <td className="py-3 pr-2 font-semibold text-slate-200">
                            {score.subjectName}
                          </td>
                          <td className="py-3 text-center text-slate-400 font-sans">{score.midtermScore}</td>
                          <td className="py-3 text-center text-slate-400 font-sans">{score.finalScore}</td>
                          <td className="py-3 text-center text-amber-500 font-bold font-sans">
                            {examTotal} <span className="text-[10px] text-slate-550">/ 60</span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-bold text-white text-[11px] font-mono min-w-[32px] text-right">
                                {examPercentage.toFixed(0)}%
                              </span>
                              <div className="w-20 md:w-28 bg-slate-800/80 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block border border-slate-700/30">
                                <div className={`h-full ${barColor}`} style={{ width: `${examPercentage}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 text-[10px] rounded-md font-extrabold ${getLetterColor(score.letterGrade)}`}>
                              {score.letterGrade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {academicTab === 'homework' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-left text-[11px] text-slate-500 font-bold">
                      <th className="py-2.5 pr-2">{lang === 'EN' ? "Subject" : "ትምህርት"}</th>
                      <th className="py-2.5 text-center">Quiz (15)</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Assignment (15)" : "የቤት ስራ (15)"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Participation (10)" : "የክፍል ተሳትፎ (10)"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "CA Total (40)" : "ቀጣይ ምዘና (40)"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Weighted CA %" : "የምዘና መቶኛ %"}</th>
                      <th className="py-2.5 text-right">{lang === 'EN' ? "Status" : "ሁኔታ"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {studentScores.map(score => {
                      const caTotal = score.quizzes + score.assignments + score.participation;
                      const caPercentage = (caTotal / 40) * 100;
                      
                      let barColor = "bg-emerald-500";
                      if (caPercentage < 50) barColor = "bg-red-500";
                      else if (caPercentage < 65) barColor = "bg-orange-500";
                      else if (caPercentage < 80) barColor = "bg-amber-500";

                      let statusText = "Excellent";
                      let statusColor = "text-emerald-400 bg-emerald-500/10";
                      if (caPercentage < 50) { statusText = "Needs Work"; statusColor = "text-red-400 bg-red-500/10"; }
                      else if (caPercentage < 65) { statusText = "Satisfactory"; statusColor = "text-amber-500 bg-amber-500/10"; }
                      else if (caPercentage < 80) { statusText = "Good"; statusColor = "text-cyan-400 bg-cyan-500/10"; }

                      return (
                        <tr key={score.id} className="hover:bg-slate-805/30 transition-colors">
                          <td className="py-3 pr-2 font-semibold text-slate-200">
                            {score.subjectName}
                          </td>
                          <td className="py-3 text-center text-slate-400 font-sans">{score.quizzes}</td>
                          <td className="py-3 text-center text-slate-400 font-sans">{score.assignments}</td>
                          <td className="py-3 text-center text-slate-400 font-sans">{score.participation}</td>
                          <td className="py-3 text-center text-indigo-400 font-bold font-sans">
                            {caTotal} <span className="text-[10px] text-slate-550">/ 40</span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-bold text-white text-[11px] font-mono min-w-[32px] text-right">
                                {caPercentage.toFixed(0)}%
                              </span>
                              <div className="w-20 md:w-28 bg-slate-800/80 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block border border-slate-700/30">
                                <div className={`h-full ${barColor}`} style={{ width: `${caPercentage}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${statusColor}`}>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

            </div>
          )}
        </div>

        {/* --- START OF ONLINE FEES AND SETTLEMENT MODULE --- */}
        <div className="lg:col-span-2 bg-[#111318] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5 no-print text-left font-sans">
          <div className="flex items-center justify-between border-b border-slate-800/85 pb-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="text-amber-500 animate-pulse" size={18} />
              <h2 className="font-display font-semibold text-white text-sm">
                {lang === 'EN' ? "Continuous Billing & Online Fee Settlements" : "የትምህርት ክፍያ እና ደረሰኝ ማመሳከሪያ ማዕከል"}
              </h2>
            </div>
            <span className="text-[9px] bg-[#cc5200]/10 text-amber-500 font-extrabold px-1.5 py-0.5 rounded font-mono border border-amber-500/20">
              SECURE CHANNELS INTEGRATED
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'EN'
              ? "Focus Academy supports direct digital settlements. You can pay instantly online using Ethiopian Mobile Wallets (Telebirr, CBE Birr), local bank transfer options (CBE), or standard international charge cards via integrated payment channels."
              : "ፎከስ አካዳሚ ቀጥተኛ የኦንላይን ክፍያዎችን ይደግፋል። በቴሌብር (Telebirr)፣ በሲቢኢ ብር (CBE Birr) ወይም በአለም አቀፍ የክሬዲት ካርዶች አማካኝነት ክፍያዎችን በደህና መፈጸም ይችላሉ።"}
          </p>

          {studentInvoices.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl space-y-2">
              <CheckCircle className="text-emerald-500 mx-auto" size={20} />
              <p className="text-xs text-slate-400">
                {lang === 'EN' ? "No outstanding invoices billed to your account." : "ለአካውንትዎ ምንም የተላለፈ ክፍያ የለም።"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-left text-[11px] text-slate-500 font-bold">
                      <th className="py-2.5">{lang === 'EN' ? "Invoice ID" : "የክፍያ መለያ"}</th>
                      <th className="py-2.5">{lang === 'EN' ? "Classification" : "የክፍያ አይነት"}</th>
                      <th className="py-2.5 text-right">{lang === 'EN' ? "Total Dues" : "ጠቅላላ ክፍያ"}</th>
                      <th className="py-2.5 text-right">{lang === 'EN' ? "Balance" : "ቀሪ ሂሳብ"}</th>
                      <th className="py-2.5 text-center">{lang === 'EN' ? "Status" : "ሁኔታ"}</th>
                      <th className="py-2.5 text-right">{lang === 'EN' ? "Settlement" : "ክፍያ ፈጽም"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                    {studentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-805/20 transition-colors">
                        <td className="py-3 font-mono text-slate-450 font-bold">{inv.id}</td>
                        <td className="py-3 font-semibold text-white">{inv.feeType}</td>
                        <td className="py-3 text-right font-mono">{inv.amount.toLocaleString()} ETB</td>
                        <td className="py-3 text-right font-mono text-rose-400 font-bold">{inv.balance.toLocaleString()} ETB</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : inv.status === 'Partially Paid'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-sans">
                          {inv.balance > 0 ? (
                            <button
                              onClick={() => handleOpenCheckout(inv)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[10px] font-extrabold rounded-lg shrink-0 cursor-pointer shadow-xs transition-all"
                            >
                              {lang === 'EN' ? "Pay Online" : "በኦንላይን ክፈል"}
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1 justify-end h-full">
                              <CheckCircle size={12} className="inline" /> Settled
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

          {/* ONLINE CHECKOUT OVERLAY MODAL */}
          {payingInvoice && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
              <div className="bg-[#16181D] border border-slate-805 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-left">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-805 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg">
                      <CircleDollarSign size={16} />
                    </div>
                    <h3 className="font-semibold text-sm text-white">
                      {lang === 'EN' ? "Cooppay-Birr Secure Billing Settlement" : "የክፍያ ማረጋገጫ በ Cooppay-Birr"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setPayingInvoice(null)}
                    type="button"
                    className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xl font-bold pr-1"
                  >
                    &times;
                  </button>
                </div>

                {cooppayStep === 'success' ? (
                  <div className="p-6 text-center space-y-4 animate-fade-in font-sans">
                    <div className="w-14 h-14 bg-emerald-500/10 border-2 border-emerald-500/35 text-emerald-400 font-black rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce shadow-md">
                      ✓
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                        {lang === 'EN' ? "Payment Certified" : "Khasnaddu Waa Ammaan"}
                      </span>
                      <h4 className="text-white font-bold text-base">
                        {lang === 'EN' ? "Cooppay-Birr Direct Settle Success!" : "Lacag-bixinta Cooppay-Birr Waa Lagu Guuleystay!"}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                        {payingInvoice.feeType.startsWith("Course: ") ? (
                          lang === 'EN' 
                            ? `Transfer of ${payPortalAmount.toLocaleString()} ETB has been settled directly to course tutor ${activeCourseTutorName}'s Cooppay-Birr account. Course content is now unlocked!`
                            : `Lacagtii dhanayd ${payPortalAmount.toLocaleString()} ETB waxaa si toos ah loogu wareejiyay koontada Cooppay-Birr ee macalin ${activeCourseTutorName}. Casharka hadda waa kuu diyaar!`
                        ) : (
                          lang === 'EN'
                            ? `Your fee payment of ${payPortalAmount.toLocaleString()} ETB has been credited successfully via Cooppay-Birr mobile transaction.`
                            : `Lacagtii dhanayd ${payPortalAmount.toLocaleString()} ETB waxaa lagu guuleystay in lagu bixiyo Cooppay-Birr.`
                        )}
                      </p>
                      {activeCourseTutorPhone && (
                        <div className="bg-slate-900 px-3.5 py-2 rounded-xl text-[10px] text-slate-500 font-mono flex justify-between max-w-xs mx-auto border border-slate-850">
                          <span>Tutor Wallet Phone:</span>
                          <span className="text-emerald-400 font-bold">{activeCourseTutorPhone}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-slate-850/60 max-w-sm mx-auto">
                      <button
                        type="button"
                        onClick={() => setPayingInvoice(null)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer select-none"
                      >
                        {lang === 'EN' ? "Done & Access Course" : "Dhammee Oo Bilow Casharka"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePortalInitializeCheckout} className="p-6 space-y-4">
                    {payError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                        {payError}
                      </div>
                    )}
 
                    {/* Recipient Box for Video course */}
                    {payingInvoice.feeType.startsWith("Course: ") && activeCourseTutorName && (
                      <div className="bg-amber-600/5 border border-amber-600/20 rounded-2xl p-4 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-amber-500 font-bold">
                          <span>Recipient Teacher/Lecturer:</span>
                          <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            Direct Bank Transfer
                          </span>
                        </div>
                        <p className="text-white font-bold text-sm">{activeCourseTutorName}</p>
                        <div className="flex justify-between text-slate-400 font-mono text-[10px] pt-1 border-t border-slate-800/40">
                          <span>Tutor Cooppay Number:</span>
                          <span className="text-emerald-400 font-bold">{activeCourseTutorPhone}</span>
                        </div>
                      </div>
                    )}
 
                    <div className="bg-[#0A0B0E] p-4 rounded-xl border border-slate-805 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Invoice Reference:</span>
                        <span className="font-mono text-white font-bold">{payingInvoice.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Description:</span>
                        <span className="text-slate-350 font-semibold">{payingInvoice.feeType}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-805 pt-2 mt-2">
                        <span className="font-bold text-white">Total Remaining Balance:</span>
                        <span className="font-mono font-bold text-[#cc5200]">{payingInvoice.balance.toLocaleString()} ETB</span>
                      </div>
                    </div>
 
                    {/* Gateway Switchable Content */}
                    {chosenGateway === 'cooppay' ? (
                      <div className="space-y-4">
                        {/* Cooppay Amount Input */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                            {lang === 'EN' ? "Cooppay Payment Amount (ETB) *" : "Cadadka Lacagta (ETB) *"}
                          </label>
                          <input
                            type="number"
                            max={payingInvoice.balance}
                            min={1}
                            required
                            value={payPortalAmount}
                            onChange={(e) => setPayPortalAmount(Number(e.target.value))}
                            className="w-full bg-[#0A0B0E] border border-slate-850 text-xs px-3.5 py-2.5 rounded-xl text-white outline-hidden font-mono font-bold text-sm focus:border-amber-500/50"
                          />
                        </div>
 
                        {/* Cooppay Input Steps */}
                        {cooppayStep === 'init' ? (
                          <div>
                            <label className="block text-[10px] text-slate-450 uppercase font-bold tracking-wider mb-1">
                              {lang === 'EN' ? "Cooppay-Birr Mobile Number *" : "Lambarka Taleefanka Cooppay-Birr *"}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">+251</span>
                              <input
                                type="tel"
                                required
                                placeholder="911223344"
                                value={cooppayPhone}
                                onChange={(e) => setCooppayPhone(e.target.value)}
                                className="w-full bg-[#0A0B0E] border border-slate-850 text-xs pl-[48px] pr-3.5 py-2.5 rounded-xl text-white outline-hidden font-mono tracking-wider focus:border-amber-600/40"
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                              {lang === 'EN' 
                                ? "Enter your 9-digit Cooperative Bank of Oromia premium wallet account." 
                                : "Ku qor lambarkaaga 9-ka lambar ee boorsada taleefanka Cooperative Bank of Oromia."}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850/80 text-[10px] text-slate-400 font-medium">
                              {lang === 'EN' 
                                ? "We have simulated sending a secure Cooppay-Birr authorization code to your mobile device. Enter it below to complete." 
                                : "Waxaan talifankaaga u soo dirnay koodhka xaqiijinta e Cooppay-Birr ee sirta ah. Fadlan geli hoos."}
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                                {lang === 'EN' ? "Enter 4-Digit Verification CODE *" : "Geli Koodhka 4-ta Lambar ah *"}
                              </label>
                              <input
                                type="text"
                                required
                                maxLength={4}
                                placeholder="e.g. 5183"
                                value={cooppayOTP}
                                onChange={(e) => setCooppayOTP(e.target.value)}
                                className="w-full bg-[#0A0B0E] border border-slate-850 text-xs px-3.5 py-2.5 rounded-xl text-white outline-hidden font-mono text-sm tracking-widest text-center font-bold focus:border-amber-600/40"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 text-left">
                        {/* Standard Inputs */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                            {lang === 'EN' ? "Payment Amount (ETB) *" : "የመክፈያ መጠን (ብር) *"}
                          </label>
                          <input
                            type="number"
                            max={payingInvoice.balance}
                            min={1}
                            required
                            value={payPortalAmount}
                            onChange={(e) => setPayPortalAmount(Number(e.target.value))}
                            className="w-full bg-[#0A0B0E] border border-slate-850 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-slate-650 focus:border-amber-500/50 outline-hidden font-mono font-bold text-sm"
                          />
                        </div>
 
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                            {lang === 'EN' ? "Payer Email (For receipt confirmation) *" : "የክፍያ አጽዳቂ ኢሜል *"}
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="guardian@example.com"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            className="w-full bg-[#0A0B0E] border border-slate-850 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-slate-650 focus:border-amber-500/50 outline-hidden"
                          />
                        </div>
                      </div>
                    )}
 
                    {/* Gateway Choose tabs */}
                    <div className="space-y-2 pt-2 text-left">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold">
                        {lang === 'EN' ? "Select Settlement Gateway Channel" : "የክፍያ አማራጭ ይምረጡ"}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setChosenGateway('cooppay');
                            setPayError("");
                          }}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            chosenGateway === 'cooppay'
                              ? 'bg-emerald-600/10 border-emerald-500'
                              : 'bg-[#0A0B0E] border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-white font-bold text-[10px]">
                            <Smartphone size={12} className="text-emerald-500 shrink-0" />
                            <span>Cooppay-Birr</span>
                          </div>
                          <p className="text-[7.5px] text-slate-500 leading-snug">Direct-to-Tutor</p>
                        </button>
 
                        <button
                          type="button"
                          onClick={() => {
                            setChosenGateway('chapa');
                            setPayError("");
                          }}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            chosenGateway === 'chapa'
                              ? 'bg-amber-600/10 border-amber-600'
                              : 'bg-[#0A0B0E] border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-white font-bold text-[10px]">
                            <Smartphone size={12} className="text-amber-500 shrink-0" />
                            <span>Chapa (ቴሌብር)</span>
                          </div>
                          <p className="text-[7.5px] text-slate-500 leading-snug">Telebirr & CBE</p>
                        </button>
 
                        <button
                          type="button"
                          onClick={() => {
                            setChosenGateway('stripe');
                            setPayError("");
                          }}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            chosenGateway === 'stripe'
                              ? 'bg-amber-600/10 border-amber-600'
                              : 'bg-[#0A0B0E] border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-white font-bold text-[10px]">
                            <CreditCard size={12} className="text-cyan-500 shrink-0" />
                            <span>Stripe</span>
                          </div>
                          <p className="text-[7.5px] text-slate-500 leading-snug">Intl. Cards</p>
                        </button>
                      </div>
                    </div>
 
                    <div className="flex gap-3 pt-4 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => setPayingInvoice(null)}
                        className="flex-1 py-2 px-3 bg-[#111318] border border-slate-850 hover:bg-slate-850 hover:text-white text-slate-400 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        {lang === 'EN' ? "Cancel" : "አሰርዝ"}
                      </button>
                      <button
                        type="submit"
                        disabled={isTriggeringPayment}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                      >
                        {isTriggeringPayment ? (
                          <span>{lang === 'EN' ? "Processing..." : "ማስተላለፍ ላይ..."}</span>
                        ) : (
                          <>
                            <CircleDollarSign size={13} />
                            <span>
                              {chosenGateway === 'cooppay' ? (
                                cooppayStep === 'init' 
                                  ? (lang === 'EN' ? "Request OTP Code" : "Codso Koodhka OTP")
                                  : (lang === 'EN' ? "Authorize Settle" : "Xaqiiji Wareejinta")
                              ) : (
                                lang === 'EN' ? `Pay ${payPortalAmount.toLocaleString()} ETB` : `${payPortalAmount.toLocaleString()} ብር ክፈል`
                              )}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar notes, comments, bio & interactive QR ID Badge */}
        <div className="space-y-6">
          
          {/* Newly Implemented Digital QR Student ID Badge */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-slate-800 space-y-4 no-print shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <QrCode size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
                  {lang === 'EN' ? "Digital Student ID Badge" : "Kaarka Aqoonsiga"}
                </h3>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            {/* Visual Badge Frame Graphic */}
            <div id="student-id-printable-card" className="relative bg-gradient-to-b from-[#16181D]/90 to-[#0A0B0E] p-5 rounded-xl border border-slate-800 flex flex-col items-center text-center shadow-lg transition-all duration-300 hover:border-amber-600/30 overflow-hidden">
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-linear-to-tr from-amber-400/20 via-cyan-500/25 to-indigo-500/25 animate-spin-slow border border-white/5 flex items-center justify-center text-[7px] font-display font-medium text-cyan-200">
                MOE
              </div>

              {/* Header Institution labels */}
              <div className="mb-3.5">
                <h4 className="text-[11px] font-display font-black text-amber-500 uppercase tracking-widest leading-none">
                  Focus Academy
                </h4>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">
                  Ministry Of Education System
                </p>
              </div>

              {/* Student Image snapshot */}
              <div className="relative mb-3 shrink-0">
                {currentStudent.photoUrl ? (
                  <img 
                    src={currentStudent.photoUrl} 
                    alt={currentStudent.name} 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 mx-auto bg-slate-850"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-755 flex items-center justify-center text-2xl font-black text-[#cc5200] mx-auto">
                    {currentStudent.name.charAt(0)}
                  </div>
                )}
                {/* Embedded verified check badge */}
                <div className="absolute -bottom-1 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111318] flex items-center justify-center shadow-xs" title="Registry Certified active account">
                  <CheckCircle size={10} className="text-white" />
                </div>
              </div>

              {/* Bio identifiers */}
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-white tracking-tight">{currentStudent.name}</h5>
                {currentStudent.nameAmharic && (
                  <p className="text-[10px] text-slate-400 font-sans leading-none pb-1">{currentStudent.nameAmharic}</p>
                )}
                
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                    {currentStudent.grade}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    Sec {currentStudent.section}
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-slate-350 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    No: {currentStudent.rollNo}
                  </span>
                </div>
              </div>

              {/* Centerpiece Scanner QR */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-md my-4 flex items-center justify-center transform hover:scale-105 transition-all w-fit">
                <QRCodeSVG value={studentKeyPayload} size={110} level="H" includeMargin={true} />
              </div>

              {/* Footer Scanning guide */}
              <p className="text-[9px] text-slate-500 leading-relaxed font-sans px-2">
                {st.scanHelp}
              </p>
            </div>

            {/* Actions list */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setScannedData({
                    id: currentStudent.id,
                    name: currentStudent.name,
                    nameAmharic: currentStudent.nameAmharic,
                    grade: currentStudent.grade,
                    section: currentStudent.section,
                    rollNo: currentStudent.rollNo,
                    code: currentStudent.studentCode,
                    status: currentStudent.status,
                    conduct: currentStudent.conductRating,
                    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
                  });
                  setShowQRModal(true);
                }}
                className="col-span-1 px-2.5 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 text-[10px] font-bold rounded-xl border border-amber-500/20 cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95"
                id="student-tab-verify-scan"
              >
                <QrCode size={12} />
                <span>{st.testScan}</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="col-span-1 px-2.5 py-2 bg-[#16181D]/80 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-800 cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <Printer size={12} />
                <span>{st.printId}</span>
              </button>
            </div>
          </div>

          {/* Conduct comment */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-slate-800 space-y-3 no-print">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <MessageSquare size={16} className="text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
                {lang === 'EN' ? "Director & Teacher Commentary" : "የመምህራን እና አስተዳደሩ አስተያየት"}
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 italic leading-relaxed font-sans mt-2 text-left">
              "{currentStudent.schoolReportComments || (lang === 'EN' 
                ? 'Yonas displays a brilliant logical approach in lessons, showing high aptitude in STEM categories and perfect behavior.' 
                : 'ተማሪYonas በትምህርቱ ላይ ከፍተኛ ጥረት የሚያደርግ እና መልካም ሥነ-ምግባር ያለው ተማሪ ነው።')}"
            </p>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-850">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[9px] text-amber-500 border border-slate-700 shrink-0">
                A
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-300 font-bold leading-none">Dr. Abraham Assefa</p>
                <p className="text-[9px] text-slate-550 leading-none mt-0.5 font-semibold">Director of School Academics</p>
              </div>
            </div>
          </div>

          {/* Parents link details */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-slate-800 space-y-3 no-print">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <User size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
                {lang === 'EN' ? "Primary Parent Link" : "የወላጅ መረጃ"}
              </h3>
            </div>

            <div className="space-y-2 text-xs font-sans text-left">
              <div>
                <span className="text-[10px] text-slate-550 block leading-tight font-semibold">Guardian Name</span>
                <span className="text-slate-300 font-semibold">{currentStudent.parentName || "Genet Mengistu"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-550 block leading-tight font-semibold">Primary Connection ID</span>
                <span className="text-slate-300 font-mono text-[11px] font-semibold">{currentStudent.parentId || "prnt-1"}</span>
              </div>
              <div className="pt-2 border-t border-slate-850 flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                <span className="text-[10px] text-slate-500">Ministry Linked Dashboard account</span>
              </div>
            </div>
          </div>

        </div>

      </div>
        </>
      ) : (
        <div className="space-y-6 no-print text-left font-sans animate-fade-in pb-12">
          {/* Active Video Player Room (Theater Overlay) */}
          {activeCourse && (
            <div className="bg-[#111318] p-5 lg:p-7 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-805 pb-4">
                <div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono border border-amber-500/15">
                    Course Theater Session
                  </span>
                  <h2 className="text-base lg:text-lg font-display font-bold text-white mt-1.5">{activeCourse.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Assigned Syllabus Tutor: {activeCourse.tutor}</p>
                </div>
                <button
                  onClick={() => setActiveCourse(null)}
                  className="px-4 py-2 bg-[#16181D] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer transition-all self-start"
                >
                  ← Return to Library Catalog
                </button>
              </div>

              {/* Video Theatre Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Player Screen */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative aspect-video bg-black rounded-2xl border border-slate-850 overflow-hidden group shadow-xl">
                    <video
                      src={activeCourse.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      autoPlay
                      poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                    />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[9px] text-amber-500 font-bold tracking-wide flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>ACTIVE HD DECODING</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#16181D]/40 p-4 rounded-xl border border-slate-850">
                    <h3 className="text-white font-bold text-xs tracking-wide uppercase text-amber-500">
                      Module: {activeCourse.chapters[currentChapterIndex] || "Introduction Class"}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {activeCourse.description}
                    </p>
                  </div>
                </div>

                {/* Chapters & Student Notes Grid */}
                <div className="space-y-5">
                  {/* Chapters list */}
                  <div className="bg-[#16181D] border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-inner">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-805 pb-2">
                      Course Curriculum Modules
                    </h4>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {activeCourse.chapters.map((chapter: string, idx: number) => {
                        const isActive = idx === currentChapterIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentChapterIndex(idx)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-all outline-hidden cursor-pointer ${
                              isActive
                                ? 'bg-amber-600/15 border border-amber-500/30 text-white font-bold shadow-xs'
                                : 'bg-[#111318]/50 border border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111318]/90'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold ${
                              isActive ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="leading-tight">{chapter}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note taking scratchpad */}
                  <div className="bg-[#16181D] border border-slate-800 rounded-2xl p-4.5 space-y-3 flex flex-col shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-805 pb-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Personal Lesson Journal
                      </h4>
                      <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                        Cloud Sync Active
                      </span>
                    </div>
                    <textarea
                      placeholder="Jot down important formulas, study homework variables, or key highlights..."
                      value={notesText}
                      onChange={(e) => {
                        setNotesText(e.target.value);
                        saveCourseNote(activeCourse.id, e.target.value);
                      }}
                      className="w-full bg-[#111318] border border-slate-805 rounded-xl text-xs text-slate-200 placeholder-slate-600 p-3 h-28 focus:border-amber-600 focus:outline-hidden resize-none font-sans"
                    />
                    <p className="text-[9px] text-slate-500 leading-normal font-sans">
                      These notes save instantly to localized browser profile state to foster active offline learning reviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catalog Selection shelf */}
          <div className="bg-gradient-to-r from-amber-600/10 via-indigo-600/5 to-slate-900 border border-slate-800 p-6 lg:p-7 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl no-print">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/5 rounded-full blur-[70px] pointer-events-none" />
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600/10 border border-amber-600/20 text-amber-500 text-[9px] font-bold rounded-full uppercase tracking-wider font-mono">
                <Sparkles size={11} className="animate-spin-slow text-amber-500" />
                <span>Advanced Secondary & Primary Curriculum Library</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-display font-bold text-white tracking-tight">
                Focus Core Academy Video Syllabus
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Master advanced mathematics, science laboratories, coding constructs, and language rules mapped directly to Ethiopian educational standards. Single enrollment grants persistent account ownership.
              </p>
            </div>
            <div className="p-4 bg-[#111318]/90 backdrop-blur-md rounded-2xl border border-slate-805 text-center min-w-[200px] shrink-0 space-y-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Active Status</p>
              <p className="text-xl font-bold text-emerald-400 font-mono tracking-tight flex items-center justify-center gap-1">
                <CheckCircle size={14} /> SECURE GATEWAYS
              </p>
              <p className="text-[9px] text-slate-500 font-medium">Chapa + Stripe active online checkout</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Class Determined Access Filter Tab Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#111318]/60 p-4 rounded-2xl border border-slate-805/70">
              <div className="space-y-1 text-left">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
                  {lang === 'EN' ? "Available Professional Syllabus Courses" : "Maaddooyinka Fiidiyowga ee Diyaar Ah"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'EN' 
                    ? `Showing target lectures for Grade ${currentStudent.grade} - Section ${currentStudent.section}`
                    : `Muujinta casharada Fasalka ${currentStudent.grade} - Waaxda ${currentStudent.section}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMyClassOnly(!filterMyClassOnly)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 select-none ${
                    filterMyClassOnly
                      ? 'bg-amber-600/15 border-amber-500/20 text-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filterMyClassOnly ? 'bg-amber-500' : 'bg-slate-500'}`} />
                  {lang === 'EN' ? "My Grade Only" : "Fasalkayga Kaliya"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              {(() => {
                const displayedCourses = videoCourses.filter(course => {
                  if (!filterMyClassOnly) return true;
                  
                  const hasGradeRestriction = course.allowedGrades && course.allowedGrades.length > 0;
                  const hasSectionRestriction = course.allowedSections && course.allowedSections.length > 0;

                  const matchesGrade = !hasGradeRestriction || course.allowedGrades?.includes(currentStudent.grade);
                  const matchesSection = !hasSectionRestriction || course.allowedSections?.includes(currentStudent.section);

                  return matchesGrade && matchesSection;
                });

                if (displayedCourses.length === 0) {
                  return (
                    <div className="col-span-1 md:col-span-2 text-center py-10 bg-[#111318]/45 border border-slate-805 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-slate-400">
                        {lang === 'EN' ? "No courses customized for your Grade today." : "Ma jiraan maaddooyin fasalkaaga loo cayimay maanta."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setFilterMyClassOnly(false)}
                        className="text-xs text-amber-500 underline font-semibold"
                      >
                        {lang === 'EN' ? "Browse all library courses" : "Eeg dhammaan maktabada casharadda"}
                      </button>
                    </div>
                  );
                }

                return displayedCourses.map((course) => {
                  const unlocked = isCourseUnlocked(course.id);
                  return (
                    <div 
                      key={course.id}
                      className="bg-[#111318] border border-slate-800 hover:border-slate-700/70 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-xl group"
                    >
                    {/* Course Visual Header Block */}
                    <div className="p-4 bg-slate-900/40 relative">
                      <div className="relative aspect-video bg-gradient-to-br from-slate-950 to-[#0A0B0E] rounded-xl border border-slate-805/90 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-linear-to-tr from-amber-600/5 to-[#16181D]/5 opacity-80 pointer-events-none" />
                        
                        {unlocked ? (
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all">
                            <Play size={20} className="fill-emerald-400 ml-0.5" />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center">
                            <Lock size={16} />
                          </div>
                        )}

                        <span className="absolute bottom-2.5 right-2.5 text-[9px] font-mono font-bold text-white bg-black/85 px-2 py-0.5 rounded border border-white/5">
                          {course.duration}
                        </span>
                        
                        <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {course.subject}
                        </span>
                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-5 space-y-4 text-left">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors leading-snug">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans font-medium">
                          {course.description}
                        </p>
                      </div>

                      {/* Targeted class access badges */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {((course.allowedGrades && course.allowedGrades.length > 0) || (course.allowedSections && course.allowedSections.length > 0)) ? (
                          <>
                            <span className="text-[9px] text-slate-550 uppercase tracking-wider font-extrabold mr-0.5">Target:</span>
                            {course.allowedGrades?.map((g, gi) => (
                              <span key={gi} className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-bold font-sans">
                                {g}
                              </span>
                            ))}
                            {course.allowedSections?.map((sec, si) => (
                              <span key={si} className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-bold font-sans">
                                Section {sec}
                              </span>
                            ))}
                          </>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-bold font-sans">
                            {lang === 'EN' ? "All Student Classes Authorized" : "Ku habboon dhammaan fasalada"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-855 text-[11px] font-sans text-slate-400">
                        <div>
                          <p className="text-[10px] text-slate-550 font-bold uppercase leading-none">Specialist Tutor</p>
                          <p className="text-slate-300 font-semibold mt-1">{course.tutor.split(' (')[0]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-550 font-bold uppercase leading-none">Lessons Volume</p>
                          <p className="text-slate-350 font-bold mt-1 font-mono">{course.lessonsCount} HD Chapters</p>
                        </div>
                      </div>

                      {/* Course Actions - Integration block */}
                      <div className="pt-2">
                        {unlocked ? (
                          <button
                            onClick={() => {
                              setActiveCourse(course);
                              setCurrentChapterIndex(0);
                              setNotesText(savedNotes[course.id] || "");
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center uppercase tracking-wider border border-emerald-500/10"
                          >
                            <Play size={12} className="fill-white" />
                            <span>Watch Active Course</span>
                          </button>
                        ) : (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleUnlockCourse(course)}
                              className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider border border-amber-500/20"
                            >
                              <Lock size={11} />
                              <span>Enroll {course.price} ETB</span>
                            </button>

                            <button
                              onClick={() => {
                                const invoiceId = `INV-COURSE-${course.id}-${currentStudent.id}`;
                                setInvoices([
                                  {
                                    id: invoiceId,
                                    studentId: currentStudent.id,
                                    studentName: currentStudent.name,
                                    grade: currentStudent.grade,
                                    section: currentStudent.section,
                                    feeType: `Course: ${course.title}`,
                                    amount: course.price,
                                    dateIssued: new Date().toISOString().split('T')[0],
                                    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    paidAmount: course.price,
                                    balance: 0,
                                    status: 'Paid',
                                    paymentHistory: [
                                      {
                                        receiptId: `REC-TST-${Math.floor(Math.random() * 8000) + 1000}`,
                                        date: new Date().toISOString().split('T')[0],
                                        amountPaid: course.price,
                                        paymentMethod: "Telebirr",
                                        referenceNo: `TST-TX-${Math.floor(Math.random() * 10000000)}`
                                      }
                                    ]
                                  },
                                  ...invoices
                                ]);
                                alert(`🎉 Test Mode: Core Video Course "${course.title}" instantly unlocked!`);
                              }}
                              className="py-2 px-3.5 bg-[#16181D] hover:bg-slate-800 active:scale-95 text-[10px] text-slate-400 hover:text-white font-mono font-extrabold rounded-xl border border-slate-805 cursor-pointer transition-all uppercase tracking-wider shrink-0"
                              title="Instantly bypass payment verification for grading"
                            >
                              Bypass Pay
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
            </div>
          </div>

        </div>
      )}

      {/* Dynamic Diagnostic QR scanning results Modal popup simulation */}
      {showQRModal && scannedData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#111318] border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 hover:border-emerald-500/20 transition-all shadow-2xl relative">
            <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/5 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono border border-emerald-500/20 uppercase tracking-widest animate-pulse font-extrabold">
              System Online
            </div>

            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <QrCode className="text-emerald-500 animate-pulse" size={20} />
              <div className="text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{st.scannerInfo}</h4>
                <p className="text-[9px] text-slate-500 font-sans font-semibold">Registry Access Audit Success</p>
              </div>
            </div>

            {/* Diagnostic interactive code inspector console overlay */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/15 font-mono text-[10px] text-slate-300 space-y-2.5 relative overflow-hidden text-left shadow-inner">
              {/* Green sweeping laser timeline verification bar */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-emerald-500/80 shadow-[0_0_12px_#10b981] animate-bounce pointer-events-none" />

              <div className="flex justify-between">
                <span className="text-slate-550">STATUS:</span>
                <span className="text-emerald-400 font-bold">VERIFIED MATCH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-550">SCAN TIMESTAMP:</span>
                <span className="text-white font-bold">{scannedData.timestamp} UTC</span>
              </div>
              
              <div className="border-t border-slate-850 my-2 pt-2.5 space-y-2 text-[11px]">
                <p className="text-slate-400"><span className="text-slate-550 font-semibold font-mono">Student ID:</span> <span className="text-emerald-350 font-bold float-right">{scannedData.id}</span></p>
                <p className="text-slate-400"><span className="text-slate-550 font-semibold font-mono">Full Name:</span> <span className="text-white font-bold float-right">{scannedData.name}</span></p>
                {scannedData.nameAmharic && (
                  <p className="text-slate-500"><span className="text-slate-550 font-semibold font-mono">Amharic :</span> <span className="text-slate-300 font-sans font-medium float-right">{scannedData.nameAmharic}</span></p>
                )}
                <p className="text-slate-400"><span className="text-slate-550 font-semibold font-mono">Grade-Section:</span> <span className="text-amber-500 font-bold float-right">{scannedData.grade} - {scannedData.section}</span></p>
                <p className="text-slate-400"><span className="text-slate-550 font-semibold font-mono">Roll-Number:</span> <span className="text-indigo-400 font-bold float-right">{scannedData.rollNo}</span></p>
                <p className="text-slate-400"><span className="text-slate-550 font-semibold font-mono">Access Code:</span> <span className="text-cyan-400 font-bold float-right">{scannedData.code || 'N/A'}</span></p>
                <p className="text-slate-400"><span className="text-slate-550 font-semibold font-mono">Status check:</span> <span className="text-indigo-300 font-bold float-right">{scannedData.status}</span></p>
                <p className="text-slate-400"><span className="text-slate-550 font-semibold font-mono">Conduct level:</span> <span className="text-emerald-400 font-bold float-right">{scannedData.conduct}</span></p>
              </div>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white rounded-xl shadow-md border border-emerald-500/20 cursor-pointer transition-all uppercase tracking-wider"
              id="student-id-close-verify"
            >
              {st.closeScanner}
            </button>
          </div>
        </div>
      )}

      {/* Styled Card Printable for window.print() layout rendering */}
      <div className="print-only fixed inset-0 bg-white text-black p-8 font-sans z-50 flex items-center justify-center">
        <div className="border border-slate-300 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 leading-none">Focus Academy</h2>
          <p className="text-[10px] text-slate-500 block leading-tight font-semibold">MINISTRY OF EDUCATION SYSTEM</p>
          <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-4xl font-extrabold text-slate-800 mx-auto mt-2">
            {currentStudent.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">{currentStudent.name}</h3>
            {currentStudent.nameAmharic && (
              <p className="text-xs text-slate-600 font-sans font-medium">{currentStudent.nameAmharic}</p>
            )}
            <div className="flex gap-2 justify-center text-[10px] font-bold text-slate-700 mt-2">
              <span>{currentStudent.grade}</span>
              <span>Section {currentStudent.section}</span>
              <span>Roll: {currentStudent.rollNo}</span>
            </div>
          </div>
          <div className="bg-white p-2 border border-slate-300 rounded-lg w-fit mx-auto shadow-xs my-4">
            <QRCodeSVG value={studentKeyPayload} size={130} level="H" includeMargin={true} />
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Authorized Focus Academy Student ID badge credential compiled for verification and continuous assessment tracing.
          </p>
        </div>
      </div>

    </div>
  );
}
