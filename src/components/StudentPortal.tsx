/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Student, 
  ScoreRecord 
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
  Maximize2
} from 'lucide-react';

interface StudentPortalProps {
  currentStudent: Student;
  scoreRecords: ScoreRecord[];
  lang: 'EN' | 'AM' | 'SO';
}

export default function StudentPortal({ currentStudent, scoreRecords, lang }: StudentPortalProps) {
  const [academicTab, setAcademicTab] = useState<'all' | 'exams' | 'homework'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [scannedData, setScannedData] = useState<any | null>(null);

  // Filter score records for the logged-in student
  const studentScores = scoreRecords.filter(rec => rec.studentId === currentStudent.id);

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

        {/* Sidebar notes, comments, bio & interactive QR ID Badge */}
        <div className="space-y-6">
          
          {/* Newly Implemented Digital QR Student ID Badge */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-slate-800 space-y-4 no-print shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <QrCode size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
                  {lang === 'EN' ? "Digital Student ID Badge" : lang === 'AM' ? "የተማሪ ዲጂታል መታወቂያ" : "Kaarka Aqoonsiga"}
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
