/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, ScoreRecord, Invoice, AttendanceRecord } from '../types';
import { AppTranslations } from '../translations';
import { standardSubjects } from '../data';
import { 
  FileText, 
  Contact, 
  Award, 
  ArrowLeftRight, 
  UserCheck, 
  Printer, 
  Download, 
  Sparkles, 
  Heart,
  BadgeCheck,
  Building2
} from 'lucide-react';

interface ReportsCenterProps {
  students: Student[];
  scoreRecords: ScoreRecord[];
  invoices: Invoice[];
  t: AppTranslations;
  lang: 'EN' | 'SO';
}

export default function ReportsCenter({
  students,
  scoreRecords,
  invoices,
  t,
  lang
}: ReportsCenterProps) {
  const [selectedDocType, setSelectedDocType] = useState<'ID' | 'ReportCard' | 'Certificate' | 'Transfer' | 'Attendance'>('ReportCard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Get selected student object
  const currentStudent = students.find(s => s.id === selectedStudentId);

  const triggerExportToast = (format: 'PDF' | 'Excel') => {
    setExportToast(lang === 'EN' 
      ? `Processing high-resolution ${format} and downloading Focus Document Asset...`
      : `ክቡር ተጠቃሚ ፤ ሰነዱን ወደ ${format} ለመቀየር በመስራት ላይ ነን...`);
    setTimeout(() => setExportToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Simulation */}
      {exportToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-slate-750 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Sparkles size={16} className="text-indigo-400 shrink-0" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Selector layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 no-print">
        
        {/* Navigation Sidebar of Document Types */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-sm">{lang === 'EN' ? "School Documents Engine" : "የትምህርት ሰነዶች ማውጫ ዘይቤ"}</h3>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-0.5">Focus Academy Registrar</span>
          </div>

          <div className="space-y-1">
            {([
              { id: 'ReportCard', label: t.reportCard, icon: <FileText size={16} /> },
              { id: 'ID', label: t.studentIdCard, icon: <Contact size={16} /> },
              { id: 'Certificate', label: t.studentCertificate, icon: <Award size={16} /> },
              { id: 'Transfer', label: t.transferCertificate, icon: <ArrowLeftRight size={16} /> },
              { id: 'Attendance', label: lang === 'EN' ? "Attendance Register" : "አጠቃላይ የአቅርቦት ሪፖርት", icon: <UserCheck size={16} /> }
            ] as { id: 'ID' | 'ReportCard' | 'Certificate' | 'Transfer' | 'Attendance'; label: string; icon: any }[]).map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocType(doc.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                  selectedDocType === doc.id
                    ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {doc.icon}
                <span>{doc.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3 font-sans text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">{lang === 'EN' ? "Filter Active Student" : "ተማሪ ይምረጡ"}</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-55 border border-slate-200 px-3 py-1.8 text-xs rounded-xl text-slate-700"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => triggerExportToast('PDF')}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download size={11} />
                PDF
              </button>
              <button 
                onClick={() => triggerExportToast('Excel')}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download size={11} />
                Excel
              </button>
              <button 
                onClick={() => window.print()}
                className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer size={11} />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Document Stage */}
        <div id="school-document-viewer" className="lg:col-span-3">
          
          {/* Outer Card framing the printable workspace */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 shadow-inner min-h-[500px] flex items-center justify-center">
            
            {currentStudent ? (
              
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full overflow-hidden print-card">
                
                {/* -------------------------------------------------------------
                    DOCUMENT RENDERING: REPORT CARD
                    ------------------------------------------------------------- */}
                {selectedDocType === 'ReportCard' && (
                  <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t.ethiopiaGov}</span>
                      <h2 className="font-display font-extrabold text-slate-850 text-lg uppercase tracking-wider">Focus Academy Private School</h2>
                      <span className="text-slate-500 text-xs italic block">Addis Ababa Education Bureau • Grade Record Center</span>
                      <div className="h-0.5 bg-indigo-700 w-32 mx-auto my-3" />
                      <h3 className="font-display font-bold text-slate-700 text-[13px] tracking-widest uppercase">{t.reportCard} / የክፍል ውጤት መግለጫ</h3>
                    </div>

                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] font-bold block">Student Full Name</span>
                        <span className="font-bold text-slate-800">{currentStudent.name}</span>
                        {currentStudent.nameAmharic && (<span className="text-[10px] text-slate-500 block">{currentStudent.nameAmharic}</span>)}
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] font-bold block">Grade / Section</span>
                        <span className="font-bold text-slate-800">{currentStudent.grade} - Section {currentStudent.section}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] font-bold block">Roll Rank Number</span>
                        <span className="font-semibold text-slate-705 font-mono">{currentStudent.rollNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] font-bold block">Academic Year</span>
                        <span className="font-bold text-slate-800">2026/2027 (2019 E.C.)</span>
                      </div>
                    </div>

                    {/* Logged Subjects Results */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Subject-Wise Performance Metrics</h4>
                      
                      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <div className="grid grid-cols-6 bg-slate-50 p-2.5 font-bold border-b border-indigo-700/10 text-slate-600">
                          <span className="col-span-2">Subject Name</span>
                          <span className="text-center">CA Marks (40)</span>
                          <span className="text-center">Final Exam (60)</span>
                          <span className="text-center">Total Score (100)</span>
                          <span className="text-right">Letter Grade</span>
                        </div>

                        {scoreRecords.filter(scr => scr.studentId === currentStudent.id).map((scr, idx) => (
                          <div key={scr.id} className="grid grid-cols-6 p-2.5 border-b border-slate-100 last:border-0 font-sans text-slate-600">
                            <span className="col-span-2 font-semibold text-slate-700">{scr.subjectName}</span>
                            <span className="text-center font-mono text-slate-400">{scr.continuousAssessmentTotal}</span>
                            <span className="text-center font-mono text-slate-405">{scr.midtermScore + scr.finalScore}</span>
                            <span className="text-center font-mono font-bold text-indigo-600">{scr.grandTotal}</span>
                            <span className="text-right uppercase font-mono font-bold text-slate-700">{scr.letterGrade}</span>
                          </div>
                        ))}

                        {scoreRecords.filter(scr => scr.studentId === currentStudent.id).length === 0 && (
                          <div className="p-4 text-center text-slate-400 bg-slate-50/50">
                            No subject score records locked for this child yet. Use Academic tab to log exam records.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conduct Ratings, Attendance & Comments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                        <span className="font-semibold text-indigo-900 block font-display">Conduct / General Ratios</span>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t.conductRating}:</span>
                          <span className="font-bold text-slate-700 font-mono text-emerald-600 uppercase italic bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                            {currentStudent.conductRating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Class Attendance Ratio:</span>
                          <span className="font-bold text-slate-700 font-mono">{(currentStudent.attendanceRatio * 100).toFixed(1)}% Present</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="font-semibold text-indigo-900 block font-display">Advisor / Principal Comments</span>
                        <p className="text-slate-500 text-xs italic leading-relaxed">
                          {currentStudent.schoolReportComments || "Solid performance. Student has potential to excel with focused revisions."}
                        </p>
                      </div>
                    </div>

                    {/* Stamp and signature space */}
                    <div className="border-t border-dashed border-slate-200 pt-8 mt-4 flex justify-between items-center text-xs">
                      <div className="text-slate-400 space-y-0.5 font-sans">
                        <span>Office Registrat Verification</span>
                        <span className="block text-[9px] font-mono">REF/SD-2026-F89A</span>
                      </div>
                      <div className="text-center text-slate-500 space-y-0.5">
                        <div className="w-36 border-b border-slate-400 text-slate-400 italic text-[10px]" style={{ height: '30px' }}>
                          Dr. Abraham Assefa
                        </div>
                        <span>{t.principalSignature}</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* -------------------------------------------------------------
                    DOCUMENT RENDERING: ID CARD
                    ------------------------------------------------------------- */}
                {selectedDocType === 'ID' && (
                  <div className="p-8 flex justify-center py-16">
                    {/* Compact ID Card Container */}
                    <div className="w-80 border-2 border-indigo-900 rounded-2xl overflow-hidden shadow-lg relative bg-slate-50 print-card font-sans">
                      {/* Flag header line */}
                      <div className="h-1.5 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" />
                      
                      {/* School Heading */}
                      <div className="bg-indigo-950 p-4 text-center space-y-0.5 text-white">
                        <h4 className="font-display font-extrabold text-xs tracking-wider uppercase">Focus Academy Private School</h4>
                        <span className="text-[8px] tracking-widest text-indigo-200 block uppercase">Addis Ababa, Ethiopia</span>
                      </div>

                      {/* Photo + Info */}
                      <div className="p-5 flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-white shadow-md flex items-center justify-center font-display font-bold text-2xl text-indigo-700 ring-2 ring-indigo-900/10">
                          {currentStudent.name.split(' ').map(n => n[0]).join('')}
                        </div>

                        <div className="text-center space-y-1 select-none">
                          <h3 className="font-display font-bold text-slate-800 text-sm tracking-wide">{currentStudent.name}</h3>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 font-sans tracking-wide uppercase">
                            STUDENT / ተማሪ
                          </span>
                        </div>

                        {/* ID Data block */}
                        <div className="w-full space-y-1.5 pt-2 text-xs text-slate-500 border-t border-slate-200/50">
                          <div className="flex justify-between">
                            <span>ID Roll Number / መለያ:</span>
                            <span className="font-bold text-slate-800 font-mono">{currentStudent.rollNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Grade Track / ክፍል:</span>
                            <span className="font-semibold text-indigo-700">{currentStudent.grade}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Section Group:</span>
                            <span className="font-bold text-slate-700">Section {currentStudent.section}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-slate-200 text-center py-2 text-[8px] text-slate-500 border-t border-slate-300">
                        <span>Holder must carry ID on school grounds. Exp: Aug 2027</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    DOCUMENT RENDERING: CERTIFICATE OF APPRECIATION
                    ------------------------------------------------------------- */}
                {selectedDocType === 'Certificate' && (
                  <div className="p-12 relative overflow-hidden text-center space-y-8 min-h-[500px] bg-amber-50/20 border-8 border-amber-600/10 m-3 rounded-xl print-card">
                    {/* Visual floral border corners simulation */}
                    <div className="absolute top-2 left-2 text-amber-500 opacity-20"><Building2 size={48} /></div>
                    <div className="absolute top-2 right-2 text-amber-500 opacity-20"><Building2 size={48} /></div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold tracking-widest text-amber-700 uppercase block">Focus Academy Academic Honors</span>
                      <h2 className="font-display font-extrabold text-2xl tracking-widest text-amber-900 uppercase">Certificate of Appreciation</h2>
                      <span className="text-[10px] text-slate-400 italic font-medium block">Awarded for Outstanding Academic Performance</span>
                    </div>

                    <div className="space-y-3 font-sans max-w-lg mx-auto py-4">
                      <p className="text-xs text-slate-500 font-sans italic">This prestigious certificate of merit is proudly presented to</p>
                      <h3 className="text-xl font-display font-black text-slate-800 border-b-2 border-amber-400/50 pb-2 w-72 mx-auto">{currentStudent.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                        In recognition of outstanding diligence, exceptional academic behavior, and exemplary scores earned during the first half of the active 2026/2027 Academic Year. Classified under standard Ministry ratings.
                      </p>
                    </div>

                    <div className="pt-8 grid grid-cols-2 items-end max-w-md mx-auto text-xs font-sans text-slate-500">
                      <div>
                        <span className="block font-bold">June 08, 2026</span>
                        <span className="block border-t border-slate-200 max-w-[120px] mx-auto pt-1 mt-1 text-[10px]">Date of Certification</span>
                      </div>
                      <div>
                        <span className="block font-bold">Dr. Abraham Assefa</span>
                        <span className="block border-t border-slate-200 max-w-[140px] mx-auto pt-1 mt-1 text-[10px]">{t.principalSignature}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    DOCUMENT RENDERING: TRANSFER LEAVING CERTIFICATE
                    ------------------------------------------------------------- */}
                {selectedDocType === 'Transfer' && (
                  <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{t.ethiopiaGov}</span>
                      <h2 className="font-display font-extrabold text-slate-800 text-lg uppercase tracking-wider">Focus Academy Private School</h2>
                      <span className="text-slate-500 text-xs block">Registrar of School Leaving Records • Addis Ababa Regional Bureau</span>
                      <div className="h-0.5 bg-indigo-700 w-32 mx-auto my-3" />
                      <h3 className="font-display font-bold text-slate-700 text-sm tracking-widest uppercase">{t.transferCertificate} / የመልቀቂያ ሰርተፍኬት</h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-xl mx-auto text-center border-b border-slate-100 pb-4 mb-4">
                      This formal leaving validation transfer sheet certifies that the student detailed below has officially completed their tenure or transferred from Focus Academy records.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-600 max-w-xl mx-auto">
                      <div className="border border-slate-150 p-3.5 rounded-xl space-y-2">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400">Student Name:</span>
                          <span className="font-bold text-slate-800">{currentStudent.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400">Section Grade:</span>
                          <span className="font-semibold text-slate-700">{currentStudent.grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Roll Rank ID:</span>
                          <span className="font-mono">{currentStudent.rollNo}</span>
                        </div>
                      </div>

                      <div className="border border-slate-150 p-3.5 rounded-xl space-y-2">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400">Conduct Rating:</span>
                          <span className="font-bold text-emerald-600 uppercase">{currentStudent.conductRating}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400">Status Clearance:</span>
                          <span className="font-bold text-indigo-700 uppercase bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">Cleared</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date Logged:</span>
                          <span>June 08, 2026</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 max-w-md mx-auto pt-6 leading-relaxed">
                      Parents holding this receipt may present it to any official Ethiopian primary or secondary public board to validate student admissions registries.
                    </div>

                    {/* Authorized Seal */}
                    <div className="border-t border-dashed border-slate-200 pt-8 mt-4 flex justify-between items-center text-xs">
                      <div className="text-slate-400 font-sans">
                        <span>Office Registrar Seal</span>
                      </div>
                      <div className="text-center text-slate-500 space-y-0.5">
                        <div className="w-36 border-b border-slate-405 text-slate-400 italic" style={{ height: '30px' }} />
                        <span>Director Signature & Stamp</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* -------------------------------------------------------------
                    DOCUMENT RENDERING: ATTENDANCE & ROSTER REPORT
                    ------------------------------------------------------------- */}
                {selectedDocType === 'Attendance' && (
                  <div className="p-8 space-y-6">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t.ethiopiaGov}</span>
                      <h2 className="font-display font-extrabold text-slate-800 text-lg uppercase tracking-wider">Focus Academy</h2>
                      <span className="text-slate-500 text-xs block">Registrar Attendance ledger for {currentStudent.grade}</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-4 bg-slate-50 p-2.5 font-bold border-b border-indigo-700/10 text-slate-600">
                        <span>Rank No</span>
                        <span>Student Name</span>
                        <span className="text-center">Attendance %</span>
                        <span className="text-right">Approval</span>
                      </div>

                      {students.filter(s => s.grade === currentStudent.grade).map((s, idx) => (
                        <div key={s.id} className="grid grid-cols-4 p-2.5 border-b border-slate-100 last:border-0 font-sans text-slate-600">
                          <span className="font-mono">#{idx + 1}</span>
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-center font-mono font-bold">{(s.attendanceRatio * 100).toFixed(1)}%</span>
                          <span className="text-right">
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1 rounded uppercase">Standard Pass</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              
            ) : (
              <div className="text-center text-slate-400 font-sans">
                {lang === 'EN' ? "Please select a student on the left controller to generate Documents." : "ሰነዶችን ለማመንጨት እባክዎን በግራ በኩል አንድ ተማሪ ይምረጡ።"}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
