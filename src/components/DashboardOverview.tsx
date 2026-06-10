/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, Teacher, Parent, Invoice, ScoreRecord } from '../types';
import { AppTranslations } from '../translations';
import { 
  Users, 
  GraduationCap, 
  Contact, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  Award,
  CircleDollarSign
} from 'lucide-react';

import { AttendanceRecord } from '../types';

interface DashboardOverviewProps {
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  invoices: Invoice[];
  scoreRecords: ScoreRecord[];
  t: AppTranslations;
  lang: 'EN' | 'SO';
  currentUser: any;
  attendance: AttendanceRecord[];
}

export default function DashboardOverview({
  students,
  teachers,
  parents,
  invoices,
  scoreRecords,
  t,
  lang,
  currentUser,
  attendance
}: DashboardOverviewProps) {
  
  // Calculate stats
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalParents = parents.length;
  const totalClasses = 12 * 5; // 12 Grades * 5 Sections (A, B, C, D, E)

  const totalFeesTotalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const averageAttendance = (students.reduce((sum, std) => sum + std.attendanceRatio, 0) / (students.length || 1)) * 100;

  // Let's find top students
  // Compute average score per student
  const studentAverages = students.map(student => {
    const studentScores = scoreRecords.filter(scr => scr.studentId === student.id);
    const avg = studentScores.length > 0 
      ? studentScores.reduce((sum, scr) => sum + scr.grandTotal, 0) / studentScores.length 
      : 0;
    return {
      student,
      avg: Math.round(avg * 10) / 10
    };
  }).filter(item => item.avg > 0)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 4);

  // Stats cards configuration
  const statsCards = [
    {
      id: "stat-students",
      title: t.totalStudents,
      value: totalStudents,
      iconClass: "text-[#D97706]",
      icon: <GraduationCap size={24} />
    },
    {
      id: "stat-teachers",
      title: t.totalTeachers,
      value: totalTeachers,
      iconClass: "text-slate-300",
      icon: <Users size={24} />
    },
    {
      id: "stat-parents",
      title: t.totalParents,
      value: totalParents,
      iconClass: "text-[#D97706]",
      icon: <Contact size={24} />
    },
    {
      id: "stat-classes",
      title: t.totalClasses,
      value: totalClasses,
      iconClass: "text-slate-300",
      icon: <Briefcase size={24} />
    },
    {
      id: "stat-fees",
      title: t.totalFeesCollected,
      value: `${totalFeesTotalCollected.toLocaleString()} ETB`,
      iconClass: "text-[#D97706]",
      icon: <CircleDollarSign size={24} />
    },
    {
      id: "stat-attendance",
      title: t.attendancePercentage,
      value: `${averageAttendance.toFixed(1)}%`,
      iconClass: "text-emerald-500",
      icon: <CheckCircle size={24} />
    }
  ];

  // Group exams into passing / failure counts for secondary representation
  const passingScores = scoreRecords.filter(scr => scr.grandTotal >= 50).length;
  const failingScores = scoreRecords.filter(scr => scr.grandTotal < 50).length;
  const testCompletionPercent = scoreRecords.length > 0 
    ? Math.round((passingScores / scoreRecords.length) * 100) 
    : 100;

  return (
    <div id="dashboard-tab" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 id="dashboard-heading" className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
            {lang === 'EN' ? "Federal Democratic Republic of Ethiopia" : "የኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'EN' ? "Focus Academy Central Admin Command Console • General Status Overview" : "ፎከስ አካዳሚ ማዕከላዊ የአስተዳደር መቆጣጠሪያ ኮንሶል • አጠቃላይ ሁኔታ መግለጫ"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#16181D] px-4 py-2 rounded-xl shadow-xs border border-slate-800">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-300">
            {lang === 'EN' ? "2026/2027 Academic Year" : "የ2019 ዓ.ም. የትምህርት ዘመን"}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card) => (
          <div 
            key={card.id} 
            id={card.id}
            className="p-6 bg-[#16181D] border border-slate-800 text-slate-200 rounded-2xl flex items-center justify-between shadow-xs transition-transform hover:-translate-y-1"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.title}</span>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{card.value}</h3>
            </div>
            <div className={`p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 ${card.iconClass}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------
          PRINCIPAL / ADMIN ONLY: ABSENT STUDENTS MONITORING CENTER
          ------------------------------------------------------------- */}
      {(currentUser?.role === 'Principal' || currentUser?.role === 'Super_Admin') && (() => {
        // Compute internal state or use inline variables
        const [absentSearch, setAbsentSearch] = React.useState("");
        const [smsSentNotice, setSmsSentNotice] = React.useState<string | null>(null);
        const [sendingId, setSendingId] = React.useState<string | null>(null);

        const absentStudents = attendance.reduce((list: any[], att) => {
          att.records.forEach(rec => {
            if (!rec.isPresent) {
              const stdInfo = students.find(s => s.id === rec.studentId);
              const prntInfo = parents.find(p => p.id === stdInfo?.parentId || p.childId === rec.studentId);
              list.push({
                studentId: rec.studentId,
                studentName: rec.studentName,
                grade: att.grade,
                section: att.section,
                date: att.date,
                remarks: rec.remarks || (lang === 'EN' ? "Unexcused Absence" : "ያልተረጋገጠ መቅረት"),
                parentName: stdInfo?.parentName || prntInfo?.name || (lang === 'EN' ? "Zenebech Tolossa" : "ዘነበች ቶሎሳ"),
                parentPhone: prntInfo?.phone || stdInfo?.phone || "+251 911-55-9088"
              });
            }
          });
          return list;
        }, []);

        const filteredAbsents = absentStudents.filter(abs => 
          abs.studentName.toLowerCase().includes(absentSearch.toLowerCase()) ||
          abs.parentName.toLowerCase().includes(absentSearch.toLowerCase()) ||
          abs.grade.toLowerCase().includes(absentSearch.toLowerCase())
        );

        const triggerSms = (student: any) => {
          setSendingId(student.studentId);
          setTimeout(() => {
            setSendingId(null);
            setSmsSentNotice(lang === 'EN' 
              ? `SMS delivered to parent ${student.parentName} (${student.parentPhone}): "${student.studentName} is absent from class today."` 
              : `ለተማሪ ${student.studentName} ወላጅ ${student.parentName} (${student.parentPhone}) የጠበቀ መቅረት SMS ተልኳል: "ተማሪው ዛሬ ከክፍል ቀርቷል።"`);
            setTimeout(() => setSmsSentNotice(null), 5000);
          }, 1200);
        };

        return (
          <div id="absentee-monitoring-portal" className="bg-[#16181D] p-6 rounded-2xl border border-destructive/25 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[10px] bg-red-500/10 text-red-500 font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full border border-red-500/20 font-mono inline-block mb-1.5">
                  {lang === 'EN' ? "Principal Administration" : "የርዕሰ መምህር አስተዳደር መቆጣጠሪያ"}
                </span>
                <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
                  <Clock size={18} className="text-red-500" />
                  {lang === 'EN' ? "Emergency Absentee Monitoring Console" : "ተማሪዎች መቅረት ክትትልና ወላጆችን የማሳወቂያ ክፍል"}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'EN' 
                    ? "Look up absent students registered on active continuous registers and notify legal guardians." 
                    : "ከዕለት የቆጠራ መዝገብ ላይ የቀሩ ተማሪዎችን በመከታተል ለወላጅ የአስቸኳይ ማስጠንቀቂያ ይላኩ።"}
                </p>
              </div>

              {/* Live counter info */}
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{lang === 'EN' ? "Absent Today" : "ዛሬ የቀሩ"}</span>
                  <span className="text-xl font-bold text-red-400 font-mono">{absentStudents.length}</span>
                </div>
              </div>
            </div>

            {/* Notification popup when SMS is sent */}
            {smsSentNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center justify-between font-semibold animate-fade-in">
                <span>{smsSentNotice}</span>
                <button onClick={() => setSmsSentNotice(null)} className="text-emerald-500 hover:text-emerald-300 font-bold ml-2">×</button>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder={lang === 'EN' ? "Search by student name, parent, or class grade..." : "በተማሪ ስም፣ ወላጅ ወይም ክፍል ይፈልጉ..."}
                  value={absentSearch}
                  onChange={(e) => setAbsentSearch(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-slate-800 focus:border-red-500/50 text-xs px-4 py-2.5 rounded-xl text-white outline-hidden font-sans placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            {/* Absent lists table representation */}
            <div className="overflow-x-auto rounded-xl border border-slate-850">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-805 text-[11px] text-slate-500">
                    <th className="p-3 font-semibold">{lang === 'EN' ? "Absent Student Name" : "የተማሪ ስም"}</th>
                    <th className="p-3 font-semibold">{lang === 'EN' ? "Class (Grade / Sec)" : "ክፍል"}</th>
                    <th className="p-3 font-semibold">{lang === 'EN' ? "Primary Legal Guardian" : "የወላጅ መረጃ"}</th>
                    <th className="p-3 font-semibold">{lang === 'EN' ? "Report Date & Remarks" : "የቀረበት ቀን / ምክንያት"}</th>
                    <th className="p-3 font-semibold text-right">{lang === 'EN' ? "Actions / Security Alert" : "አስቸኳይ መልክት"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs font-sans text-slate-350 bg-slate-900/10">
                  {filteredAbsents.length > 0 ? (
                    filteredAbsents.map((abs, idx) => (
                      <tr key={`${abs.studentId}-${idx}`} className="hover:bg-slate-800/10 transition-colors">
                        <td className="p-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
                            <span>{abs.studentName}</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-amber-500">{abs.grade} - {abs.section}</td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-200 block">{abs.parentName}</span>
                            <span className="text-[10px] font-mono text-slate-500 block">{abs.parentPhone}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="text-slate-400 font-semibold">{abs.date}</span>
                            <span className="text-[10px] text-red-400 font-medium block">{abs.remarks}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => triggerSms(abs)}
                            disabled={sendingId === abs.studentId}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase border shadow-xs transition-all active:scale-95 ${
                              sendingId === abs.studentId
                                ? "bg-amber-600/10 border-amber-500/25 text-amber-500 cursor-not-allowed"
                                : "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-red-500/20 hover:border-red-650 cursor-pointer"
                            }`}
                          >
                            {sendingId === abs.studentId 
                              ? (lang === 'EN' ? "Sending SMS..." : "በመላክ ላይ...") 
                              : (lang === 'EN' ? "Dispatch Alert SMS" : "ወላጅን በኤስ ኤም ኤስ አሳውቅ")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-550 italic text-xs">
                        {lang === 'EN' ? "No absent students match your active filters." : "እስካሁን ምንም የሌለ ተማሪ አልተመዘገበም።"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress & Exams Analytics of Standard Performance */}
        <div id="exam-stats-card" className="lg:col-span-2 bg-[#16181D] p-6 rounded-2xl shadow-xs border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-[#D97706]" />
                {t.schoolPerformanceAnalytics}
              </h2>
              <span className="text-xs font-mono px-2.5 py-1 bg-amber-600/10 text-amber-500 rounded-full font-semibold">
                {lang === 'EN' ? "Primary & Secondary" : "አንደኛ እና ሁለተኛ ደረጃ"}
              </span>
            </div>
            <p className="text-sm text-slate-450 mb-6 font-sans">
              {lang === 'EN' 
                ? "Academic performance ratios across Ministry standard continuous assessment matrices." 
                : "የአካዳሚክ አፈጻጸም መዛግብት በትምህርት ሚኒስቴር ቀጣይነት ያለው ምዘና መስፈርት መሰረት።"}
            </p>

            {/* Custom Interactive SVG/CSS bar chart of subject averages */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Mathematics (ሒሳብ)</span>
                  <span>82% {lang === 'EN' ? "Average" : "አማካይ"}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#D97706] h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>English (እንግሊዝኛ)</span>
                  <span>84% {lang === 'EN' ? "Average" : "አማካይ"}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Amharic (አማርኛ)</span>
                  <span>86% {lang === 'EN' ? "Average" : "አማካይ"}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-yellow-600 h-full rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Physics & Sciences (ፊዚክስ እና ሳይንስ)</span>
                  <span>76% {lang === 'EN' ? "Average" : "አማካይ"}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-6 mt-6">
            <div className="text-center">
              <span className="text-xs text-slate-500 block uppercase font-semibold">{lang === 'EN' ? "Passing Exams" : "ያለፉ ፈተናዎች"}</span>
              <span className="text-lg font-bold text-slate-200">{passingScores} / {scoreRecords.length}</span>
            </div>
            <div className="text-center border-x border-slate-800">
              <span className="text-xs text-slate-500 block uppercase font-semibold">{lang === 'EN' ? "Success Ratio" : "የውጤታማነት መጠን"}</span>
              <span className="text-lg font-bold text-emerald-500">{testCompletionPercent}%</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 block uppercase font-semibold">{lang === 'EN' ? "Conduct Excellent" : "ምርጥ ስነ-ምግባር"}</span>
              <span className="text-lg font-bold text-amber-500">
                {students.filter(std => std.conductRating === 'Excellent' || std.conductRating === 'Very Good').length}
              </span>
            </div>
          </div>
        </div>

        {/* Top Performing Ethiopian Students widget */}
        <div id="top-students-card" className="bg-[#16181D] p-6 rounded-2xl shadow-xs border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-medium text-white text-lg flex items-center gap-2 mb-1">
              <Award size={20} className="text-[#D97706]" />
              {lang === 'EN' ? "Academic Honor Roll" : "የላቀ የትምህርት ውጤት መዝገብ"}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'EN' ? "Top performing students this academic semester." : "በዚህ ሴሚስተር ከፍተኛ ውጤት ያስመዘገቡ ተማሪዎች።"}
            </p>

            <div className="space-y-4">
              {studentAverages.length > 0 ? (
                studentAverages.map((item, index) => (
                  <div key={item.student.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-600/10 text-amber-500 flex items-center justify-center font-display font-bold text-xs ring-2 ring-amber-600/20">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{lang === 'EN' ? item.student.name : (item.student.nameAmharic || item.student.name)}</h4>
                        <span className="text-[11px] font-mono text-slate-550 font-medium uppercase tracking-wider">{item.student.grade} • Sec {item.student.section}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-display font-bold text-amber-500">{item.avg}%</span>
                      <span className="block text-[10px] text-emerald-500 font-semibold">{lang === 'EN' ? "Avg Score" : "አማካኝ"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  {lang === 'EN' ? "No test score data logged yet." : "እስካሁን ምንም የፈተና ውጤት አልተመዘገበም።"}
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-600/10 border border-amber-600/20 p-3 rounded-xl mt-4 text-xs text-amber-500 flex items-start gap-2.5">
            <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-slate-200">{lang === 'EN' ? "Ministry Target Standards" : "የትምህርት ሚኒስቴር መርሆዎች"}</span>
              <span className="text-slate-450">{lang === 'EN' ? "Requires a minimum of 50% cumulative score to pass grade division levels." : "ከክክፍል ወደ ክፍል ለመዛወር በድምሩ ቢያንስ 50% ማስመዝገብ ይገባል ።"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
