/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Student, 
  Subject, 
  ScoreRecord, 
  TimetableEntry, 
  AttendanceRecord,
  Teacher,
  Parent
} from '../types';
import { AppTranslations } from '../translations';
import { 
  BookOpen, 
  FileSpreadsheet, 
  UserPlus, 
  CalendarDays, 
  Sparkles, 
  CircleAlert, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  UserX,
  Plus,
  Trash2,
  Bell,
  Smartphone
} from 'lucide-react';

interface AcademicManagementProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  teachers: Teacher[];
  scoreRecords: ScoreRecord[];
  setScoreRecords: (scores: ScoreRecord[]) => void;
  timetable: TimetableEntry[];
  setTimetable: (t: TimetableEntry[]) => void;
  attendance: AttendanceRecord[];
  setAttendance: (a: AttendanceRecord[]) => void;
  t: AppTranslations;
  lang: 'EN' | 'AM' | 'SO';
  currentUser: any;
  subjects: Subject[];
  setSubjects: (subjs: Subject[]) => void;
  grades: string[];
  setGrades: (grads: string[]) => void;
  parents: Parent[];
}

export default function AcademicManagement({
  students,
  setStudents,
  teachers,
  scoreRecords,
  setScoreRecords,
  timetable,
  setTimetable,
  attendance,
  setAttendance,
  t,
  lang,
  currentUser,
  subjects,
  setSubjects,
  grades,
  setGrades,
  parents
}: AcademicManagementProps) {
  
  const [activeAcademicSubTab, setActiveAcademicSubTab] = useState<'Grades' | 'Exams' | 'Promotions' | 'Timetable' | 'HomeworkAlerts'>('Exams');

  // New Subject & Grade adding variables
  const [newSubName, setNewSubName] = useState("");
  const [newSubAmharic, setNewSubAmharic] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubIsNational, setNewSubIsNational] = useState(false);
  const [newGradeName, setNewGradeName] = useState("");

  // Homework Violation Reporting states
  const [hwStudentId, setHwStudentId] = useState("");
  const [hwSubjectId, setHwSubjectId] = useState("");
  const [hwReason, setHwReason] = useState("Incomplete Homework Assignment");
  const [hwDetails, setHwDetails] = useState("");
  const [hwSentAlerts, setHwSentAlerts] = useState<any[]>([
    {
      id: "alert-1",
      studentName: "Yonas Bekele",
      grade: "Grade 8",
      section: "A",
      subjectName: "Mathematics",
      reason: "Missed Homework #4 on fractions",
      date: "2026-06-08",
      parentName: "Genet Mengistu",
      parentPhone: "+251 911-00-5566",
      status: "Delivered VIA SMS"
    },
    {
      id: "alert-2",
      studentName: "Seble Hailu",
      grade: "Grade 8",
      section: "A",
      subjectName: "General Science",
      reason: "Incomplete lab report submission",
      date: "2026-06-07",
      parentName: "Hailu Abraham",
      parentPhone: "+251 944-12-8990",
      status: "Delivered VIA SMS"
    }
  ]);
  const [activeHomeworkAlert, setActiveHomeworkAlert] = useState<string | null>(null);

  // Exam Score creation state
  const [showAddScore, setShowAddScore] = useState(false);
  const [scStdId, setScStdId] = useState("");
  const [scSubId, setScSubId] = useState("");
  const [scQuizzes, setScQuizzes] = useState(12); // out of 15
  const [scAssigns, setScAssigns] = useState(13); // out of 15
  const [scPart, setScPart] = useState(8); // out of 10
  const [scMid, setScMid] = useState(16); // out of 20
  const [scFinal, setScFinal] = useState(32); // out of 40

  // Promotions Configuration States
  const [promotionPassMark, setPromotionPassMark] = useState(50);
  const [promotionMaxFails, setPromotionMaxFails] = useState(2);
  const [promotionFilter, setPromotionFilter] = useState<'All' | 'Promote' | 'Fail' | 'Not Enough Data'>('All');
  const [manualOverrides, setManualOverrides] = useState<Record<string, 'Promote' | 'Fail'>>({});
  const [promotionRunResult, setPromotionRunResult] = useState<{
    promotedCount: number;
    failedCount: number;
    insufficientCount: number;
    timestamp: string;
  } | null>(null);

  // -------------------------------------------------------------
  // DYNAMIC RANKING & GRADING CALCULATIONS
  // -------------------------------------------------------------
  const calculateLetterGrade = (total: number): string => {
    if (total >= 90) return "A+";
    if (total >= 83) return "A";
    if (total >= 75) return "A-";
    if (total >= 68) return "B+";
    if (total >= 60) return "B";
    if (total >= 52) return "B-";
    if (total >= 45) return "C+";
    if (total >= 40) return "C";
    if (total >= 35) return "D";
    return "F";
  };

  const getFilteredSubjects = () => {
    let filtered = subjects;
    if (currentUser?.role === 'Teacher') {
      const teacherObj = teachers.find(t => t.id === currentUser.id || t.email === currentUser.email) || currentUser.teacherObj;
      const spec = (teacherObj?.specialization || '').toLowerCase();
      
      filtered = subjects.filter(sub => {
        const subName = sub.name.toLowerCase();
        const subCode = sub.code.toLowerCase();
        
        if (spec.includes('math') && subCode === 'mat') return true;
        if (spec.includes('physic') && subCode === 'phy') return true;
        if (spec.includes('chemi') && subCode === 'che') return true;
        if (spec.includes('biolo') && subCode === 'bio') return true;
        if (spec.includes('science') && (subCode === 'gsc' || subCode === 'env')) return true;
        if (spec.includes('amhar') && subCode === 'amh') return true;
        if (spec.includes('englis') && subCode === 'eng') return true;
        if (spec.includes('social') && subCode === 'sst') return true;
        if (spec.includes('geogr') && subCode === 'geo') return true;
        if (spec.includes('histor') && subCode === 'his') return true;
        if (spec.includes('civic') && subCode === 'civ') return true;
        if (spec.includes('it') || spec.includes('techno') || spec.includes('comput')) {
          if (subCode === 'ict') return true;
        }
        
        return spec.includes(subName) || subName.includes(spec);
      });
      
      if (filtered.length === 0) {
        filtered = subjects;
      }
    }
    return filtered;
  };

  const handleAddScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scStdId || !scSubId) return;

    const selectedStd = students.find(s => s.id === scStdId);
    const selectedSub = subjects.find(s => s.id === scSubId);
    if (!selectedStd || !selectedSub) return;

    const catot = Number(scQuizzes) + Number(scAssigns) + Number(scPart);
    const grtot = catot + Number(scMid) + Number(scFinal);

    const newScore: ScoreRecord = {
      id: `scr-${Date.now()}`,
      studentId: scStdId,
      studentName: selectedStd.name,
      grade: selectedStd.grade,
      section: selectedStd.section,
      subjectId: scSubId,
      subjectName: selectedSub.name,
      semester: 'Semester 1',
      academicYear: '2026-2027',
      quizzes: Number(scQuizzes),
      assignments: Number(scAssigns),
      participation: Number(scPart),
      continuousAssessmentTotal: catot,
      midtermScore: Number(scMid),
      finalScore: Number(scFinal),
      grandTotal: grtot,
      letterGrade: calculateLetterGrade(grtot)
    };

    setScoreRecords([...scoreRecords, newScore]);
    setShowAddScore(false);
  };

  // Helper: calculate dynamically class aggregates and relative standing ranks
  const getEnrichedScores = () => {
    let filteredRecords = scoreRecords;
    if (currentUser?.role === 'Teacher') {
      const allowedSubjectIds = getFilteredSubjects().map(s => s.id);
      filteredRecords = scoreRecords.filter(rec => allowedSubjectIds.includes(rec.subjectId));
    }

    // Group records by class (grade + section + subject) to assign correct class sectional ranks
    const groups: { [key: string]: ScoreRecord[] } = {};
    filteredRecords.forEach(rec => {
      const key = `${rec.grade}-${rec.section}-${rec.subjectId}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });

    // Sort descending of grandTotals inside each subset group & append ranks
    const results: ScoreRecord[] = [];
    Object.keys(groups).forEach(key => {
      const sorted = [...groups[key]].sort((a, b) => b.grandTotal - a.grandTotal);
      sorted.forEach((item, index) => {
        results.push({
          ...item,
          rank: index + 1
        });
      });
    });

    return results;
  };

  const enrichedScores = getEnrichedScores();

  // -------------------------------------------------------------
  // AUTOMATED PROMOTION ENGINE
  // -------------------------------------------------------------
  // Calculations of cumulative averages per student to run promotions
  const getStudentPromotionsReport = () => {
    return students.map(student => {
      const studentScores = scoreRecords.filter(scr => scr.studentId === student.id);
      const scoresSum = studentScores.reduce((sum, scr) => sum + scr.grandTotal, 0);
      const avg = studentScores.length > 0 ? scoresSum / studentScores.length : 0;
      
      const failedSubjects = studentScores.filter(scr => scr.grandTotal < promotionPassMark);
      const failedSubjectNames = failedSubjects.map(scr => scr.subjectName);

      let standardDecision: 'Promote' | 'Fail' | 'Not Enough Data' = 'Not Enough Data';
      let reason = '';
      
      if (studentScores.length > 0) {
        if (avg < promotionPassMark) {
          standardDecision = 'Fail';
          reason = lang === 'EN' 
            ? `Average score matches ${avg.toFixed(1)}%, which is below the minimum passing threshold of ${promotionPassMark}%.`
            : `አማካይ ውጤት ${avg.toFixed(1)}% የዝቅተኛ ማለፊያ ገደብ ${promotionPassMark}% በታች በመሆኑ ድጋሚ መማር አለበት።`;
        } else if (failedSubjects.length > promotionMaxFails) {
          standardDecision = 'Fail';
          reason = lang === 'EN'
            ? `Average ${avg.toFixed(1)}% is passing, but failed ${failedSubjects.length} subjects (${failedSubjectNames.join(', ')}), exceeding the maximum allowed limit of ${promotionMaxFails}.`
            : `አማካይ ውጤት ${avg.toFixed(1)}% ቢያልፍም፣ ${failedSubjects.length} ትምህርቶች ወድቋል (${failedSubjectNames.join(', ')} ይህም ከተፈቀደው ${promotionMaxFails} በላይ ነው።`;
        } else {
          standardDecision = 'Promote';
          reason = lang === 'EN'
            ? `Passed all criteria with average ${avg.toFixed(1)}% and ${failedSubjects.length} subject failures.`
            : `ሁሉንም መመዘኛዎች አሟልቷል፣ አማካይ ውጤት ${avg.toFixed(1)}% እና የወደቀባቸው ትምህርቶች: ${failedSubjects.length}።`;
        }
      } else {
        reason = lang === 'EN'
          ? "No academic results logged for this student."
          : "ምንም የፈተና ውጤት አልተመዘገበም።";
      }

      // Apply overrides if any
      const override = manualOverrides[student.id];
      const finalDecision = override || standardDecision;

      let nextGrade = student.grade;
      if (finalDecision === 'Promote') {
        const num = parseInt(student.grade.replace('Grade ', ''));
        if (num < 12) {
          nextGrade = `Grade ${num + 1}`;
        } else {
          nextGrade = `Graduate / Alumnus`;
        }
      }

      return {
        student,
        avg: Math.round(avg * 10) / 10,
        standardDecision,
        decision: finalDecision,
        reason,
        failedSubjectsCount: failedSubjects.length,
        failedSubjectNames,
        nextGrade,
        subjectsLogged: studentScores.length
      };
    });
  };

  const promotionsGrid = getStudentPromotionsReport();

  const runAutomaticPromotion = () => {
    // Auto promote students in main state
    const updatedStudents = students.map(student => {
      const report = promotionsGrid.find(p => p.student.id === student.id);
      if (report && report.decision === 'Promote') {
        const num = parseInt(student.grade.replace('Grade ', ''));
        if (num < 12) {
          return {
            ...student,
            grade: `Grade ${num + 1}`,
            status: 'Promoted' as const,
            promotedToGrade: `Grade ${num + 1}`
          };
        } else {
          return {
            ...student,
            status: 'Promoted' as const,
            promotedToGrade: 'Graduated'
          };
        }
      } else if (report && report.decision === 'Fail') {
        return {
          ...student,
          status: 'Repeating' as const
        };
      }
      return student;
    });

    setStudents(updatedStudents);

    // Save summary stats for entry animated feedback cards
    const promoted = promotionsGrid.filter(p => p.decision === 'Promote').length;
    const failed = promotionsGrid.filter(p => p.decision === 'Fail').length;
    const insufficient = promotionsGrid.filter(p => p.decision === 'Not Enough Data').length;

    setPromotionRunResult({
      promotedCount: promoted,
      failedCount: failed,
      insufficientCount: insufficient,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Tabs Selector */}
      <div className="flex bg-[#111318] p-1 rounded-xl gap-1 self-start max-w-2xl border border-slate-800 overflow-x-auto">
        {[
          { id: 'Exams', label: t.examinationStatistics, icon: <FileSpreadsheet size={15} /> },
          { id: 'Promotions', label: t.promotionSystem, icon: <UserPlus size={15} /> },
          { id: 'Grades', label: lang === 'EN' ? "Grades & Subjects" : "ክፍሎች እና ሳብጀክቶች", icon: <BookOpen size={15} /> },
          { id: 'Timetable', label: lang === 'EN' ? "Attendance Register" : "አቅርቦትና ሰሌዳ", icon: <CalendarDays size={15} /> },
          { id: 'HomeworkAlerts', label: lang === 'EN' ? "Homework Alerts" : "የቤት ስራ ሪፖርቶች", icon: <Bell size={15} /> }
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => setActiveAcademicSubTab(subTab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeAcademicSubTab === subTab.id 
                ? 'bg-amber-600 text-white shadow-sm font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {subTab.icon}
            {subTab.label}
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------
          SUB-TAB: EXAMS & RESULTS LOGGING
          ------------------------------------------------------------- */}
      {activeAcademicSubTab === 'Exams' && (
        <div className="space-y-6">
          <div className="bg-[#16181D] p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="font-display font-medium text-white text-lg">{lang === 'EN' ? "Examination Scores Register" : "የተማሪዎች ውጤት ምዝገባ ማዕከል"}</h2>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {lang === 'EN' 
                    ? "Log continuous assessment components and final exam results according to Ministry guidelines." 
                    : "ከትምህርት ሚኒስቴር መርሆዎች ጋር የሚስማማ የክፍል ምዘናዎች እና የፈተና ውጤት መመዝገቢያ።"}
                </span>
              </div>
              
              <button
                onClick={() => setShowAddScore(!showAddScore)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-[#D97706]/15"
              >
                <Plus size={14} />
                {lang === 'EN' ? "Record Subject Score" : "አዲስ ውጤት መዝግብ"}
              </button>
            </div>

            {/* Form for recording score */}
            {showAddScore && (
              <form onSubmit={handleAddScoreSubmit} className="mb-6 p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 max-w-2xl animate-fade-in">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">{lang === 'EN' ? "Log New Academic Performance Mark" : "የተማሪ አዲስ ውጤት ማስገቢያ ቅፅ"}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t.student} *</label>
                    <select 
                      value={scStdId} 
                      required 
                      onChange={(e) => setScStdId(e.target.value)}
                      className="w-full bg-[#16181D] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 appearance-none focus:outline-hidden focus:border-amber-600"
                    >
                      <option value="" className="bg-[#16181D] text-slate-200">-- Select student --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#16181D] text-slate-200">{s.name} ({s.grade} - Section {s.section})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t.subject} *</label>
                    <select 
                      value={scSubId} 
                      required 
                      onChange={(e) => setScSubId(e.target.value)}
                      className="w-full bg-[#16181D] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 appearance-none focus:outline-hidden focus:border-amber-600"
                    >
                      <option value="" className="bg-[#16181D] text-slate-200">-- Select subject --</option>
                      {getFilteredSubjects().map(sub => (
                        <option key={sub.id} value={sub.id} className="bg-[#16181D] text-slate-200">{sub.name} ({sub.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-slate-800 pt-4">
                  <div>
                    <label className="block text-[10px] text-slate-405 font-bold mb-1">Quizzes (Max 15%)</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={15} 
                      value={scQuizzes} 
                      onChange={(e) => setScQuizzes(Number(e.target.value))}
                      className="w-full bg-[#16181D] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-405 font-bold mb-1">Assign. (Max 15%)</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={15} 
                      value={scAssigns} 
                      onChange={(e) => setScAssigns(Number(e.target.value))}
                      className="w-full bg-[#16181D] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-405 font-bold mb-1">Partic. (Max 10%)</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={10} 
                      value={scPart} 
                      onChange={(e) => setScPart(Number(e.target.value))}
                      className="w-full bg-[#16181D] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-405 font-bold mb-1">Midterm (Max 20%)</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={20} 
                      value={scMid} 
                      onChange={(e) => setScMid(Number(e.target.value))}
                      className="w-full bg-[#16181D] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-405 font-bold mb-1">Final Exam (Max 40%)</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={40} 
                      value={scFinal} 
                      onChange={(e) => setScFinal(Number(e.target.value))}
                      className="w-full bg-[#16181D] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-800 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddScore(false)}
                    className="px-3 py-1.5 border border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-805"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-lg cursor-pointer"
                  >
                    {lang === 'EN' ? "Save Score Link" : "እሺ ውጤት አስገባ"}
                  </button>
                </div>
              </form>
            )}

            {/* Scores Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-805 text-left text-[11px] text-slate-500 font-semibold bg-slate-950/20">
                    <th className="p-3">{t.student}</th>
                    <th className="p-3">{lang === 'EN' ? "Class / Group" : "ክፍል / ሴክሽን"}</th>
                    <th className="p-3">{t.subject}</th>
                    <th className="p-3 text-center">{lang === 'EN' ? "CA (40%)" : "ምዘና (40%)"}</th>
                    <th className="p-3 text-center">{lang === 'EN' ? "Mid (20%)" : "ግማሽ (20%)"}</th>
                    <th className="p-3 text-center">{lang === 'EN' ? "Final (40%)" : "መጨረሻ (40%)"}</th>
                    <th className="p-3 text-center font-bold text-slate-400">{t.totalMarks} (100)</th>
                    <th className="p-3 text-center">{t.letterGrade}</th>
                    <th className="p-3 text-center">{t.rank}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs text-slate-350 font-sans">
                  {enrichedScores.map((score) => (
                    <tr key={score.id} className="hover:bg-slate-800/15 transition-colors">
                      <td className="p-3 font-semibold text-slate-250">{score.studentName}</td>
                      <td className="p-3 font-semibold text-amber-500">{score.grade} - Section {score.section}</td>
                      <td className="p-3 text-slate-400">{score.subjectName}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{score.continuousAssessmentTotal}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{score.midtermScore}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{score.finalScore}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-500">{score.grandTotal}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          score.letterGrade === 'A+' || score.letterGrade === 'A' || score.letterGrade === 'A-'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : score.letterGrade === 'B+' || score.letterGrade === 'B' || score.letterGrade === 'B-'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : score.letterGrade === 'F'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-extrabold'
                                : 'bg-amber-600/15 text-amber-500 border-amber-600/20'
                        }`}>
                          {score.letterGrade}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded text-[10px] border border-slate-705/30">
                          #{score.rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB: STUDENT PROMOTION SYSTEM
          ------------------------------------------------------------- */}
      {activeAcademicSubTab === 'Promotions' && (() => {
        // Filter promotionsGrid records
        const filteredGrid = promotionsGrid.filter(row => {
          if (promotionFilter === 'All') return true;
          if (promotionFilter === 'Promote') return row.decision === 'Promote';
          if (promotionFilter === 'Fail') return row.decision === 'Fail';
          if (promotionFilter === 'Not Enough Data') return row.decision === 'Not Enough Data';
          return true;
        });

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Promotion Control Center Dashboard */}
            <div className="bg-[#16181D] p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-850 pb-5">
                <div>
                  <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
                    <UserPlus size={20} className="text-amber-500 animate-pulse" />
                    {t.promotionSystem}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'EN' 
                      ? "Establish passing benchmarks and execute high-fidelity student promotions based on standard Ministry of Education ratios." 
                      : "የትምህርት ሚኒስቴርን መስፈርት መሰረት በማድረግ የተማሪዎች ክፍል እድገት ደንቦችን ይወስኑና በጅምላ ይተግብሩ።"}
                  </p>
                </div>

                <button
                  onClick={runAutomaticPromotion}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 shadow-sm self-start md:self-auto cursor-pointer border border-amber-700/15 active:scale-95 transition-all"
                >
                  <Sparkles size={14} />
                  {lang === 'EN' ? "Commit & Run Promotions" : "ውሳኔዎችን መዝግብና ክፍል አሳድግ"}
                </button>
              </div>

              {/* Promotion feedback summary system */}
              <AnimatePresence>
                {promotionRunResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 p-4 rounded-xl bg-[#1c1f26]/60 border border-slate-800/80 mb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={14} className="animate-spin text-amber-500" />
                          {lang === 'EN' ? `Promotion Cycle Executed Successfully (at ${promotionRunResult.timestamp})` : `የክፍል እድገት ውሳኔዎች በተሳካ ሁኔታ ተመዝግበዋል (በ ${promotionRunResult.timestamp})`}
                        </h3>
                        <button
                          onClick={() => setPromotionRunResult(null)}
                          className="text-slate-400 hover:text-slate-200 text-[10px] font-bold bg-slate-900 hover:bg-slate-950 border border-slate-800 px-2 py-1 rounded-md cursor-pointer transition-all active:scale-95"
                        >
                          {lang === 'EN' ? "Dismiss" : "አጥፋ"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Success Card */}
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.05, duration: 0.25 }}
                          className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3"
                        >
                          <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-emerald-400">
                              {lang === 'EN' ? "Promotion Success" : "ክፍል የማሳደግ ስኬት"}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {lang === 'EN' 
                                ? `Focus Academy academic engine completed successful grades elevation for ${promotionRunResult.promotedCount} passing students. Standard benchmarks met perfectly.`
                                : `የፊልክስ አካዳሚ የክፍል እድገት መስፈርትን ያሟሉ ${promotionRunResult.promotedCount} ተማሪዎች በተሳካ ሁኔታ ወደ ቀጣዩ የክፍል ደረጃ እንዲያልፉ ተደርገዋል።`}
                            </p>
                          </div>
                        </motion.div>

                        {/* Failure Warning Card */}
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.25 }}
                          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3"
                        >
                          <UserX size={24} className="text-rose-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-rose-450 font-sans">
                              {lang === 'EN' ? "Retention & Warning Flag" : "ደረጃ መድገም እና ማስጠንቀቂያ"}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {lang === 'EN'
                                ? `Flagged ${promotionRunResult.failedCount} repeating student(s) who scored lower than ${promotionPassMark}% average or exceeded maximum of ${promotionMaxFails} failed subjects.`
                                : `አማካይ ውጤታቸው ከ ${promotionPassMark}% በታች የሆኑ ወይም ከ ${promotionMaxFails} በላይ ትምህርት የወደቁ ${promotionRunResult.failedCount} ተማሪዎች ክፍል እንዲደግሙ ተደርገዋል።`}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Rules Configuration Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/40 border border-slate-855">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{lang === 'EN' ? "Promotion Benchmarks" : "ክፍል ማደጊያ መስፈርቶች"}</h3>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">{lang === 'EN' ? "Passing Mark Average Threshold" : "ማለፊያ አማካይ ውጤት (MoE Standard)"}</span>
                      <span className="font-mono font-bold text-amber-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{promotionPassMark}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="75" 
                      step="5"
                      value={promotionPassMark} 
                      onChange={(e) => setPromotionPassMark(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>40%</span>
                      <span>50% (Standard)</span>
                      <span>60%</span>
                      <span>75%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'EN' ? "Maximum Subject Failures Allowed" : "ቢበዛ ሊፈቀድ የሚችል የወደቁ ሳብጀክቶች"}</label>
                    <select
                      value={promotionMaxFails}
                      onChange={(e) => setPromotionMaxFails(Number(e.target.value))}
                      className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3.5 py-2.5 rounded-xl text-white outline-hidden focus:border-amber-600/50 cursor-pointer"
                    >
                      <option value="0">{lang === 'EN' ? "0 - Must Pass All Registered Subjects" : "0 - ሁሉንም ትምህርት ማለፍ አለበት"}</option>
                      <option value="1">{lang === 'EN' ? "1 - Maximum of 1 failed subject allowed" : "1 - ቢበዛ 1 ትምህርት መውደቅ ይችላል"}</option>
                      <option value="2">{lang === 'EN' ? "2 - Maximum of 2 failed subjects allowed" : "2 - ቢበዛ 2 ትምህርቶች መውደቅ ይችላል"}</option>
                      <option value="3">{lang === 'EN' ? "3 - Maximum of 3 failed subjects allowed" : "3 - ቢበዛ 3 ትምህርቶች መውደቅ ይችላል"}</option>
                      <option value="4">{lang === 'EN' ? "4 - Maximum of 4 failed subjects allowed" : "4 - ቢበዛ 4 ትምህርቶች መውደቅ ይችላል"}</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-505 leading-relaxed italic">
                    {lang === 'EN'
                      ? "*Note: Students exceeding either benchmark are flagged as Repeating. You can manually overwrite decisions below."
                      : "*ማስታወሻ፡ ከላይ ከተጠቀሱት መስፈርቶች በታች የሆኑ ተማሪዎች ክፍል እንዲደግሙ ይደረጋል። የፈለጉትን ተማሪ ከታች ማስተካከል ይችላሉ።"}
                  </p>
                </div>
              </div>

              {/* Quick stats of promotions grid outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 hover:bg-emerald-500/15 transition-colors"
                >
                  <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-550 font-bold uppercase block">{lang === 'EN' ? "Passing Promoted" : "ክፍል የሚያልፉ"}</span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {promotionsGrid.filter(p => p.decision === 'Promote').length} students
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 hover:bg-rose-500/15 transition-colors"
                >
                  <UserX size={24} className="text-rose-550 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-550 font-bold uppercase block">{lang === 'EN' ? "Repeating / Fails" : "የሚደግሙ የተማሪዎች ብዛት"}</span>
                    <span className="text-lg font-extrabold text-rose-400">
                      {promotionsGrid.filter(p => p.decision === 'Fail').length} students
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
                  className="p-4 bg-amber-600/10 border border-amber-600/20 rounded-xl flex items-center gap-3 hover:bg-amber-600/15 transition-colors"
                >
                  <CircleAlert size={24} className="text-amber-555 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-550 font-bold uppercase block">{lang === 'EN' ? "Insufficient Exam Data" : "ዳታ የሌላቸው"}</span>
                    <span className="text-lg font-extrabold text-amber-500">
                      {promotionsGrid.filter(p => p.decision === 'Not Enough Data').length} students
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Ledger filters & Roster List */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-850 pb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'EN' ? "Student Promotion Evaluation Ledger" : "ተማሪዎች ክፍል ማደግ ውሳኔ መዝገብ"}</h3>
                  
                  {/* Ledger filter tabs */}
                  <div className="flex gap-1.5 p-0.5 bg-slate-950 border border-slate-850 rounded-lg overflow-x-auto self-start">
                    {[
                      { id: 'All', label: lang === 'EN' ? 'All Rows' : 'ሁሉንም ያሳይ', count: promotionsGrid.length },
                      { id: 'Promote', label: lang === 'EN' ? 'Promote' : 'ማለፊያ', count: promotionsGrid.filter(p => p.decision === 'Promote').length },
                      { id: 'Fail', label: lang === 'EN' ? 'Repeating' : 'የሚደግሙ', count: promotionsGrid.filter(p => p.decision === 'Fail').length },
                      { id: 'Not Enough Data', label: lang === 'EN' ? 'No Exams' : 'ውጤት የሌላቸው', count: promotionsGrid.filter(p => p.decision === 'Not Enough Data').length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setPromotionFilter(tab.id as any)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                          promotionFilter === tab.id
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table details representation */}
                <div className="overflow-x-auto rounded-xl border border-slate-850">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-855 text-[11px] text-slate-500 font-semibold bg-slate-950/40">
                        <th className="p-3">{t.student}</th>
                        <th className="p-3">{lang === 'EN' ? "Current Grade" : "የአሁኑ ክፍል"}</th>
                        <th className="p-3 text-center">{lang === 'EN' ? "Logged Subjects" : "የተፈተኑት ትምህርቶች"}</th>
                        <th className="p-3 text-center">{t.average}</th>
                        <th className="p-3 text-center">{lang === 'EN' ? "Fails" : "የወደቀባቸው"}</th>
                        <th className="p-3">{lang === 'EN' ? "Decision & Reasons" : "የውሳኔ ምክንያት"}</th>
                        <th className="p-3 text-center">{t.promotedStatus}</th>
                        <th className="p-3">{lang === 'EN' ? "Next Grade Level" : "የሚቀጥለው ክፍል ደረጃ"}</th>
                        <th className="p-3 text-right">{lang === 'EN' ? "Override Decisions" : "የበላይ ውሳኔ"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-xs text-slate-350 font-sans">
                      {filteredGrid.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-550 italic">
                            {lang === 'EN' ? "No students matching this search filter criteria." : "በዚህ መስፈርት የተገኘ ተማሪ የለም።"}
                          </td>
                        </tr>
                      ) : (
                        filteredGrid.map((row) => {
                          const isOverridden = !!manualOverrides[row.student.id];

                          return (
                            <tr key={row.student.id} className="hover:bg-slate-800/10 transition-colors">
                              <td className="p-3">
                                <div>
                                  <span className="font-semibold text-slate-200 block">{row.student.name}</span>
                                  <span className="text-[10px] text-slate-550 block font-sans">{row.student.nameAmharic}</span>
                                </div>
                              </td>
                              <td className="p-3 font-semibold text-amber-500">{row.student.grade} - {row.student.section}</td>
                              <td className="p-3 text-center font-mono text-slate-500">{row.subjectsLogged}</td>
                              <td className="p-3 text-center font-mono font-bold text-slate-300">
                                {row.subjectsLogged > 0 ? `${row.avg}%` : "---"}
                              </td>
                              <td className="p-3 text-center">
                                {row.subjectsLogged > 0 ? (
                                  <span className={`font-mono font-bold text-[11px] ${row.failedSubjectsCount > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-500'}`}>
                                    {row.failedSubjectsCount}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="p-3 max-w-[220px]">
                                <div className="space-y-0.5">
                                  <span className="text-[11px] text-slate-400 leading-relaxed block">{row.reason}</span>
                                  {row.failedSubjectsCount > 0 && (
                                    <span className="text-[9px] text-rose-550 font-semibold block font-sans bg-rose-950/20 rounded px-1.5 py-0.5 max-w-max border border-rose-955/10">
                                      Fails: {row.failedSubjectNames.join(', ')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="space-y-1 inline-flex flex-col items-center">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                                    row.decision === 'Promote'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : row.decision === 'Fail'
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        : 'bg-slate-800 text-slate-500 border-slate-805'
                                  }`}>
                                    {row.decision === 'Promote' ? t.promoted : row.decision === 'Fail' ? t.failed : "No Records"}
                                  </span>
                                  {isOverridden && (
                                    <span className="text-[8px] bg-amber-600/15 border border-amber-600/35 text-amber-500 px-1 py-0.5 rounded uppercase font-bold tracking-tight">
                                      Overridden
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-slate-350">
                                {row.decision === 'Promote' ? (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">➡️ {row.nextGrade}</span>
                                ) : row.decision === 'Fail' ? (
                                  <span className="text-rose-400 font-semibold italic">Repeating {row.student.grade}</span>
                                ) : (
                                  <span className="text-slate-550 italic">Missing Marks</span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {row.decision !== 'Promote' && (
                                    <button
                                      title={lang === 'EN' ? "Manually Pass" : "በላይ ሀይል ማለፍ"}
                                      onClick={() => setManualOverrides({ ...manualOverrides, [row.student.id]: 'Promote' })}
                                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                                    >
                                      Pass
                                    </button>
                                  )}
                                  {row.decision !== 'Fail' && row.subjectsLogged > 0 && (
                                    <button
                                      title={lang === 'EN' ? "Manually Fail" : "በላይ ሀይል መጣል"}
                                      onClick={() => setManualOverrides({ ...manualOverrides, [row.student.id]: 'Fail' })}
                                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded text-[10px] font-bold border border-rose-500/20 active:scale-95 transition-all cursor-pointer"
                                    >
                                      Repeat
                                    </button>
                                  )}
                                  {isOverridden && (
                                    <button
                                      title={lang === 'EN' ? "Reset Override" : "ዳግም አስጀምር"}
                                      onClick={() => {
                                        const updated = { ...manualOverrides };
                                        delete updated[row.student.id];
                                        setManualOverrides(updated);
                                      }}
                                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold border border-slate-700 active:scale-95 transition-all cursor-pointer"
                                    >
                                      Reset
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* -------------------------------------------------------------
          SUB-TAB: GRADES & SUBJECTS LISTS (DYNAMIC CRUD)
          ------------------------------------------------------------- */}
      {activeAcademicSubTab === 'Grades' && (() => {
        const handleCreateSubject = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newSubName || !newSubCode) {
            alert(lang === 'EN' ? "Please provide Subject Name and Code" : "እባክዎ የትምህርት ኮድና ስም ያስገቡ");
            return;
          }
          const isDup = subjects.some(s => s.code.toLowerCase() === newSubCode.toLowerCase());
          if (isDup) {
            alert(lang === 'EN' ? "Subject code already exists!" : "የትምህርት ኮድ ቀድሞውኑ ተመዝግቧል!");
            return;
          }
          const newSubject: Subject = {
            id: `sub-${newSubCode.toLowerCase()}-${Date.now()}`,
            name: newSubName,
            nameAmharic: newSubAmharic || newSubName,
            code: newSubCode.toUpperCase(),
            gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
            isNationalExamSubject: newSubIsNational
          };
          setSubjects([...subjects, newSubject]);
          setNewSubName("");
          setNewSubAmharic("");
          setNewSubCode("");
          setNewSubIsNational(false);
        };

        const handleDeleteGrade = (gradeToDelete: string) => {
          if (window.confirm(lang === 'EN' 
            ? `Are you absolutely certain you want to delete ${gradeToDelete}? Warning: This class level will be removed.` 
            : `${gradeToDelete} ክፍልን በቋሚነት ለመሰረዝ እርግጠኛ ነዎት?`)) {
            setGrades(grades.filter(g => g !== gradeToDelete));
          }
        };

        const handleCreateGrade = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newGradeName) return;
          const normalized = newGradeName.trim();
          if (grades.includes(normalized)) {
            alert(lang === 'EN' ? "Grade division level already exists!" : "የክፍል ደረጃው ቀድሞውኑ አለ!");
            return;
          }
          setGrades([...grades, normalized]);
          setNewGradeName("");
        };

        const handleDeleteSubject = (subjId: string) => {
          const sName = subjects.find(s => s.id === subjId)?.name;
          if (window.confirm(lang === 'EN' 
            ? `Are you sure you want to delete the subject: ${sName}?` 
            : `ትምህርት ${sName} መሰረዝ ይፈልጋሉ?`)) {
            setSubjects(subjects.filter(s => s.id !== subjId));
          }
        };

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* LEFT COLUMN: CLASSES / GRADES */}
            <div className="bg-[#16181D] p-6 rounded-2xl border border-slate-800 space-y-5">
              <div>
                <h2 className="font-display font-medium text-white text-base mb-1">{lang === 'EN' ? "School Grade Divisions & Classrooms" : "የአንደኛ እና ሁለተኛ ደረጃ የክፍል መዋቅር"}</h2>
                <p className="text-xs text-slate-500">
                  {lang === 'EN' ? "Add or delete active scholastic tracks and grade brackets managed by the school." : "ትምህርት ቤቱ የሚያስተዳድራቸውን የክፍል መደቦች ይጨምሩ ወይም ይሰርዙ።"}
                </p>
              </div>

              {/* Dynamic grade render */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/60 border border-slate-805 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-slate-350 tracking-wider uppercase">{lang === 'EN' ? "Active Classroom Levels" : "ንቁ የክፍል ደረጃዎች"}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {grades.map(g => (
                      <div key={g} className="flex items-center justify-between px-2.5 py-1.5 bg-[#0A0B0E] border border-slate-800 hover:border-slate-700 rounded-lg transition-all group">
                        <span className="text-[11px] font-mono font-bold text-amber-500">{g}</span>
                        <button 
                          onClick={() => handleDeleteGrade(g)}
                          title={lang === 'EN' ? `Delete ${g}` : "ሰርዝ"}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 rounded-md transition-all active:scale-90"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Grade input form */}
                <form onSubmit={handleCreateGrade} className="p-3.5 bg-slate-900/30 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-slate-300">{lang === 'EN' ? "Register New Grade Level" : "አዲስ የክፍል ደረጃ ጨምር"}</h4>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g., Grade 13 or KG 1"
                      value={newGradeName}
                      onChange={(e) => setNewGradeName(e.target.value)}
                      className="bg-[#0A0B0E] border border-slate-800 text-xs px-3 py-2 rounded-lg text-white font-mono flex-1 focus:border-amber-500/50 outline-hidden"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      {lang === 'EN' ? "Create" : "አክል"}
                    </button>
                  </div>
                </form>

                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-2 text-[11px] text-emerald-400">
                  <Clock size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-450">
                    <strong className="text-slate-200">System note:</strong> Removing a grade level directly updates active timetables and promotions matrices instantly.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SUBJECTS LIST & REGISTER NEW */}
            <div className="bg-[#16181D] p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h2 className="font-display font-medium text-white text-base mb-1">{lang === 'EN' ? "Subjects & National Standard Register" : "የሳብጀክቶች እና የትምህርት ኮዶች ዝርዝር መግለጫ"}</h2>
                <p className="text-xs text-slate-500">
                  {lang === 'EN' ? "Map educational fields and configure standard Ministry leave indicators." : "የትምህርት ክፍሎችን ይዘርዝሩ እንዲሁም የፈተና መለኪያዎችን ያስገቡ።"}
                </p>
              </div>

              {/* Subject Register Addition Form */}
              <form onSubmit={handleCreateSubject} className="p-4 bg-slate-900 border border-slate-805 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-200 tracking-wide">{lang === 'EN' ? "Add Custom Syllabus Subject" : "አዲስ የትምህርት አይነት መመዝገቢያ"}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">{lang === 'EN' ? "Subject Title (EN)" : "የትምህርት ስም (እንግሊዝኛ)"}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Science"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3 py-2 rounded-lg text-white placeholder-slate-600 focus:border-amber-600/40 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">{lang === 'EN' ? "Subject Title (AM)" : "የትምህርቱ ስም (አማርኛ)"}</label>
                    <input 
                      type="text" 
                      placeholder="ምሳሌ: ሳይንስ"
                      value={newSubAmharic}
                      onChange={(e) => setNewSubAmharic(e.target.value)}
                      className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3 py-2 rounded-lg text-white placeholder-slate-600 focus:border-amber-600/40 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">{lang === 'EN' ? "Standard Code" : "የትምህርት ኮድ"}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SCI"
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-white placeholder-slate-600 font-mono focus:border-amber-600/40 outline-hidden"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={newSubIsNational}
                        onChange={(e) => setNewSubIsNational(e.target.checked)}
                        className="rounded border-slate-800 bg-[#0A0B0E] text-amber-500 h-4 w-4"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">{lang === 'EN' ? "Ministry Exam Subject" : "አገር አቀፍ ተፈታኝ"}</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  {lang === 'EN' ? "Register New Subject" : "አዲስ ትምህርት መዝግብ"}
                </button>
              </form>

              {/* Subject list representation */}
              <div className="overflow-y-auto max-h-64 divide-y divide-slate-850">
                {subjects.map((subject) => (
                  <div key={subject.id} className="py-2.5 flex items-center justify-between group">
                    <div>
                      <span className="font-semibold text-xs text-slate-200">{subject.name}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">&#183; {subject.nameAmharic}</span>
                      <div className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                        {lang === 'EN' ? "Applies to: All Classroom Grades" : "ለሁሉም ክፍሎች የሚሆን"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="font-mono font-bold text-[10px] bg-[#0A0B0E] text-slate-300 px-1.5 py-0.5 rounded uppercase border border-slate-800">
                          {subject.code}
                        </span>
                        {subject.isNationalExamSubject && (
                          <span className="block text-[8px] text-amber-550 font-bold tracking-tight uppercase mt-0.5">National Board</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteSubject(subject.id)}
                        title={lang === 'EN' ? `Delete ${subject.name}` : "ሰርዝ"}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-650 hover:text-red-500 bg-slate-900 border border-slate-805 rounded-md transition-all hover:scale-105 active:scale-90"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* -------------------------------------------------------------
          SUB-TAB: TIMETABLES & ATTENDANCE RECORD
          ------------------------------------------------------------- */}
      {activeAcademicSubTab === 'Timetable' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#16181D] p-6 rounded-2xl border border-slate-800">
            <h2 className="font-display font-medium text-white text-base mb-1">{lang === 'EN' ? "Active Period Timetable Schedule" : "የእለታዊ ክፍለ ጊዜዎች ስርጭት ሰሌዳ"}</h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'EN' 
                ? "Standardized 45 minute periods with teacher allocations." 
                : "እያንዳንዱ ክፍለ-ጊዜ 45 ደቂቃ የሚቆይበት የቀን የሰሌዳ ስርጭት ዝርዝር መግለጫ።"}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-805 text-left text-[11px] text-slate-500 bg-slate-950/20">
                    <th className="p-3">Period & Time</th>
                    <th className="p-3">Day</th>
                    <th className="p-3">Grade Class</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Teacher assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs font-sans text-slate-350">
                  {timetable.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-800/15 transition-colors">
                      <td className="p-3 font-semibold text-slate-205">
                        {entry.period} ({entry.timeSlot})
                      </td>
                      <td className="p-3 font-semibold text-amber-500">{entry.day}</td>
                      <td className="p-3 text-slate-400">{entry.grade} - {entry.section}</td>
                      <td className="p-3 font-bold text-slate-200">{entry.subjectName}</td>
                      <td className="p-3 text-slate-500">{entry.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#16181D] p-6 rounded-2xl border border-slate-800">
            <h2 className="font-display font-medium text-white text-base mb-1">{lang === 'EN' ? "Daily Attendance Track Summary" : "የተማሪዎች እለታዊ አቅርቦት ሁኔታ መዝገብ"}</h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'EN' ? "Recent registration entries logged in databases." : "በቀጥታ አስተዳደር የተመዘገቡ የተማሪዎች የገፅታ መግለጫ።"}
            </p>

            <div className="space-y-4">
              {attendance.map((rec, i) => (
                <div key={i} className="p-3.5 bg-slate-900 border border-slate-805 rounded-xl">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-semibold text-xs text-slate-200">{rec.grade} - Section {rec.section}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{rec.date}</span>
                  </div>
                  
                  <div className="space-y-1.5 font-sans">
                    {rec.records.map((r, ri) => (
                      <div key={ri} className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{r.studentName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          r.isPresent ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                        }`}>
                          {r.isPresent ? "Present" : "Absent"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB: HOMEWORK & ASSIGNMENT VIOLATION ALERTS
          ------------------------------------------------------------- */}
      {activeAcademicSubTab === 'HomeworkAlerts' && (() => {
        // Find the active student to look up their parent contacts
        const selectedStudent = students.find(s => s.id === hwStudentId);
        const linkedParent = selectedStudent 
          ? parents.find(p => p.id === selectedStudent.parentId || p.childId === selectedStudent.id)
          : null;
        const targetParentName = selectedStudent?.parentName || linkedParent?.name || (lang === 'EN' ? "Zenebech Tolossa" : "ዘነበች ቶሎሳ");
        const targetParentPhone = linkedParent?.phone || selectedStudent?.phone || "+251 911-55-9088";

        const handleSendHomeworkAlert = (e: React.FormEvent) => {
          e.preventDefault();
          if (!hwStudentId || !hwSubjectId) {
            alert(lang === 'EN' ? "Please select student and subject" : "እባክዎ ተማሪ እና ትምህርት ይምረጡ");
            return;
          }

          const std = students.find(s => s.id === hwStudentId);
          const subj = subjects.find(s => s.id === hwSubjectId);
          if (!std || !subj) return;

          const newAlert = {
            id: `alert-${Date.now()}`,
            studentName: std.name,
            grade: std.grade,
            section: std.section,
            subjectName: subj.name,
            reason: hwReason + (hwDetails ? `: ${hwDetails}` : ""),
            date: new Date().toISOString().split('T')[0],
            parentName: targetParentName,
            parentPhone: targetParentPhone,
            status: "Delivered VIA SMS"
          };

          setHwSentAlerts([newAlert, ...hwSentAlerts]);
          setActiveHomeworkAlert(lang === 'EN' 
            ? `SMS Sent successfully to ${targetParentName} (${targetParentPhone}): "${std.name} did not submit their ${subj.name} assignment."` 
            : `ለወላጅ ${targetParentName} (${targetParentPhone}) መቅረት ኤስ ኤም ኤስ ተልኳል: "ተማሪ ${std.name} የ${subj.name} የቤት ስራ አላስረከቡም።"`);
          
          // Clear inputs
          setHwStudentId("");
          setHwDetails("");
        };

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* ALERT COMPLIANCE REPORT FORM */}
            <div className="bg-[#16181D] p-6 rounded-2xl border border-slate-805 space-y-4">
              <div>
                <span className="text-[10px] bg-amber-600/10 text-amber-500 font-extrabold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-600/20 font-mono inline-block mb-1.5 font-semibold">
                  {lang === 'EN' ? "Teacher reporting engine" : "የመምህራን ሪፖርት ማቅረቢያ"}
                </span>
                <h2 className="font-display font-medium text-white text-base mb-1">{lang === 'EN' ? "Homework Infraction Registry" : "ያልተሰሩ የቤት ስራዎች ሪፖርት ማቅረቢያ"}</h2>
                <p className="text-xs text-slate-500">
                  {lang === 'EN' ? "Log a student who missed homework or classroom assignments. The parent receives an instantaneous SMS." : "የቤት ስራ ወይም ፈተና ያላስረከበ ተማሪ ለመመዝገቢያ። ወዲያውኑ ለወላጅ ስልክ መልእክት ይላካል።"}
                </p>
              </div>

              {activeHomeworkAlert && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-start gap-2 animate-pulse mt-2">
                  <Smartphone className="shrink-0 text-emerald-500 mt-0.5" size={14} />
                  <div className="flex-1">
                    <span className="font-semibold block uppercase tracking-wider text-[9px] text-emerald-500">{lang === 'EN' ? "SMS GATEWAY BROADCAST" : "የቴሌኮም ኤስ ኤም ኤስ ማዕከል"}</span>
                    <span>{activeHomeworkAlert}</span>
                  </div>
                  <button onClick={() => setActiveHomeworkAlert(null)} className="font-bold text-emerald-400 hover:text-white shrink-0 ml-1">×</button>
                </div>
              )}

              <form onSubmit={handleSendHomeworkAlert} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">{lang === 'EN' ? "1. Select Student Name" : "1. ተማሪ ይምረጡ"}</label>
                  <select
                    value={hwStudentId}
                    onChange={(e) => setHwStudentId(e.target.value)}
                    className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3.5 py-2 rounded-xl text-white outline-hidden focus:border-amber-600/50"
                  >
                    <option value="">{lang === 'EN' ? "-- Choose Student --" : "-- ተማሪ ይምረጡ --"}</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade} - Section {s.section})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">{lang === 'EN' ? "2. Target Subject Matter" : "2. የትምህርት አይነት"}</label>
                  <select
                    value={hwSubjectId}
                    onChange={(e) => hwSubjectId === "" ? setHwSubjectId(e.target.value) : setHwSubjectId(e.target.value)}
                    className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3.5 py-2 rounded-xl text-white outline-hidden focus:border-amber-600/50"
                  >
                    <option value="">{lang === 'EN' ? "-- Choose Subject --" : "-- ትምህርት ይምረጡ --"}</option>
                    {getFilteredSubjects().map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">{lang === 'EN' ? "3. Infraction Category" : "3. የጥሰት አይነት"}</label>
                  <select
                    value={hwReason}
                    onChange={(e) => setHwReason(e.target.value)}
                    className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3.5 py-2 rounded-xl text-white outline-hidden focus:border-amber-600/50"
                  >
                    <option value="Incomplete Homework Assignment">{lang === 'EN' ? "Incomplete Homework" : "ያልተሟላ የቤት ስራ"}</option>
                    <option value="Missed Assignment Submission">{lang === 'EN' ? "Missed Assignment" : "ያልቀረበ አሳይመንት"}</option>
                    <option value="Incomplete Portfolio Project">{lang === 'EN' ? "Incomplete Class Project" : "ያልተጠናቀቀ ፕሮጀክት"}</option>
                    <option value="Did Not Present for Assessment">{lang === 'EN' ? "Incomplete Evaluation" : "ለምዘና ያልቀረበ"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">{lang === 'EN' ? "4. Brief Notes / Details" : "4. ተጨማሪ ማብራሪያ"}</label>
                  <textarea
                    placeholder={lang === 'EN' ? "Incomplete page 4 questions in math workbook..." : "በክፍል ውስጥ የተሰጠ የሂሳብ አሳይመንት አልሰራም..."}
                    value={hwDetails}
                    onChange={(e) => setHwDetails(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0A0B0E] border border-slate-800 text-xs px-3.5 py-2 rounded-xl text-white placeholder-slate-700 outline-hidden focus:border-amber-500/50 resize-none"
                  />
                </div>

                {selectedStudent && (
                  <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1 text-xs font-sans">
                    <span className="font-semibold uppercase text-slate-550 text-[9px] block tracking-wide">{lang === 'EN' ? "Target Parent Routing Contact" : "የተቆራኘ የወላጅ መረጃ"}</span>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{lang === 'EN' ? "Parent Name:" : "የወላጅ ስም:"}</span>
                      <span className="text-slate-200 font-bold">{targetParentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{lang === 'EN' ? "Phone for SMS Route:" : "የወላጅ ስልክ:"}</span>
                      <span className="text-amber-500 font-mono font-bold">{targetParentPhone}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Smartphone size={15} />
                  {lang === 'EN' ? "File Incident & Send Official SMS" : "ሪፖርቱን መዝግብ እና SMS ይላኩ"}
                </button>
              </form>
            </div>

            {/* SEND HISTORY LEDGER */}
            <div className="lg:col-span-2 bg-[#16181D] p-6 rounded-2xl border border-slate-805 space-y-4">
              <div>
                <h2 className="font-display font-medium text-white text-base mb-1">{lang === 'EN' ? "Sent Parent Alerts & SMS Dispatch Log" : "ለወላጆች የተላኩ የአስቸኳይ መልእክቶች መዝገብ"}</h2>
                <p className="text-xs text-slate-500">
                  {lang === 'EN' 
                    ? "Historic ledger of homework compliance warnings successfully generated and delivered to parents phone numbers." 
                    : "የተማሪዎችን የቤት ስራ አለመስራት ተከትሎ ለወላጅ የተላኩ መልዕክቶች አጠቃላይ መዝገብ።"}
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-850">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-805 text-[11px] text-slate-500">
                      <th className="p-3 font-semibold">{lang === 'EN' ? "Student & Class" : "ተማሪ እና ክፍል"}</th>
                      <th className="p-3 font-semibold">{lang === 'EN' ? "Subject matter" : "ትምህርት"}</th>
                      <th className="p-3 font-semibold">{lang === 'EN' ? "Reason Registered" : "ክስተቱ መግለጫ"}</th>
                      <th className="p-3 font-semibold">{lang === 'EN' ? "Parent Mobile Phone" : "ወላጅ ስልክ ቁጥር"}</th>
                      <th className="p-3 font-semibold text-right">{lang === 'EN' ? "Gateway Status" : "የመላክ ሁኔታ"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs font-sans text-slate-350">
                    {hwSentAlerts.map((alt) => (
                      <tr key={alt.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="p-3 font-semibold">
                          <div className="space-y-0.5">
                            <span className="text-white block">{alt.studentName}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{alt.grade} - {alt.section}</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{alt.subjectName}</td>
                        <td className="p-3 text-slate-400">
                          <div className="max-w-[180px] break-words">
                            <span className="text-[11px] block">{alt.reason}</span>
                            <span className="text-[9px] text-slate-550 block font-bold font-mono">{alt.date}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-300 block">{alt.parentName}</span>
                            <span className="text-[10px] text-amber-500 font-mono font-bold block">{alt.parentPhone}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider font-mono">
                            {alt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
