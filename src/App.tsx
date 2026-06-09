/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  CircleDollarSign, 
  FileSpreadsheet, 
  Award, 
  LayoutDashboard,
  LogOut,
  UserCheck,
  Globe2,
  Calendar,
  Layers,
  Sun,
  Moon,
  ShieldAlert,
  Camera
} from 'lucide-react';

import { 
  initialSchoolProfile, 
  initialAcademicYears, 
  initialTeachers, 
  initialStudents, 
  initialParents, 
  initialInvoices, 
  initialScoreRecords, 
  initialTimetable, 
  initialAttendance,
  standardSubjects
} from './data';

import { translations } from './translations';

// Component imports
import DashboardOverview from './components/DashboardOverview';
import SchoolManagement from './components/SchoolManagement';
import UserManagement from './components/UserManagement';
import AcademicManagement from './components/AcademicManagement';
import FinancialManagement from './components/FinancialManagement';
import ReportsCenter from './components/ReportsCenter';
import Login from './components/Login';
import StudentPortal from './components/StudentPortal';
import MasterAdminCenter from './components/MasterAdminCenter';

export default function App() {
  const [lang, setLang] = useState<'EN' | 'AM' | 'SO'>('EN');
  const t = translations[lang];

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Global Academic States loaded in local state memory for CRUD and full dynamic feedback
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'School' | 'Users' | 'Academics' | 'Finance' | 'Reports' | 'MyInfo' | 'AdminCenter'>('Dashboard');
  const [schoolProfile, setSchoolProfile] = useState(initialSchoolProfile);
  const [academicYears, setAcademicYears] = useState(initialAcademicYears);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [students, setStudents] = useState(initialStudents);
  const [parents, setParents] = useState(initialParents);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [scoreRecords, setScoreRecords] = useState(initialScoreRecords);
  const [timetable, setTimetable] = useState(initialTimetable);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [subjects, setSubjects] = useState<any[]>(standardSubjects);
  const [grades, setGrades] = useState<string[]>([
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ]);

  // Finance security codes & locks states
  const [bursarPasscode, setBursarPasscode] = useState("8844");
  const [bursarName, setBursarName] = useState("Aster Hailu (Senior Bursar)");
  const [isFinanceLocked, setIsFinanceLocked] = useState(false);
  const [authorizedFeesCodes, setAuthorizedFeesCodes] = useState([
    { id: "fc-1", code: "CBE-TX-8902", type: "Tuition Fee", valName: "Yonas Bekele", amount: 4500, state: "Active_Authorized", dateGen: "2026-06-08" },
    { id: "fc-2", code: "TLR-77-5110", type: "Sports & Lab Fee", valName: "Mahlet Tesfaye", amount: 1500, state: "Claimed_Used", dateGen: "2026-06-08" },
    { id: "fc-3", code: "CBE-TX-4231", type: "Registration Fee", valName: "Bruh Melese", amount: 2000, state: "Active_Authorized", dateGen: "2026-06-09" }
  ]);

  const [users, setUsers] = useState([
    {
      id: "usr-admin-1",
      name: "Super Administrator Team",
      nameAmharic: "ዋና ሥራ አስኪያጅ",
      email: "admin@focusacademy.edu.et",
      phone: "+251 911-00-1100",
      role: "Super_Admin",
      status: "Active",
      joinedDate: "2022-09-01"
    } as any,
    {
      id: "usr-pr-1",
      name: "Dr. Abraham Assefa",
      nameAmharic: "ዶ/ር አብርሃም አሰፋ",
      email: "abraham.a@focusacademy.edu.et",
      phone: "+251 944-12-8990",
      role: "Principal",
      status: "Active",
      joinedDate: "2023-09-01"
    } as any
  ]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (currentUser) {
          setCurrentUser((prev: any) => prev ? { ...prev, photoUrl: base64String } : null);
          
          if (currentUser.role === 'Teacher') {
            setTeachers((prev: any[]) => prev.map(t => t.id === currentUser.id ? { ...t, photoUrl: base64String } : t));
          } else if (currentUser.role === 'Student') {
            setStudents((prev: any[]) => prev.map(s => s.id === currentUser.id ? { ...s, photoUrl: base64String } : s));
          } else {
            setUsers((prev: any[]) => prev.map(u => u.id === currentUser.id ? { ...u, photoUrl: base64String } : u));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser) {
    return (
      <div className={theme === 'light' ? 'light' : ''}>
        <Login 
          onLogin={(user) => {
            setCurrentUser(user);
            setActiveTab(user.role === 'Student' ? 'MyInfo' : 'Dashboard');
          }} 
          lang={lang} 
          setLang={setLang} 
          teachers={teachers} 
          students={students}
          schoolProfile={schoolProfile}
        />
      </div>
    );
  }

  const activeYearObj = academicYears.find(y => y.status === 'Active') || academicYears[0];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light text-slate-800' : 'text-slate-200'} bg-[#0A0B0E] flex flex-col font-sans select-none antialiased transition-colors duration-200`}>
      
      {/* Dynamic Header Bar */}
      <header className="bg-[#0A0B0E]/50 backdrop-blur-sm border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-display text-white font-black text-lg shadow-sm border border-amber-700 overflow-hidden shrink-0">
            {schoolProfile.logoUrl ? (
              <img src={schoolProfile.logoUrl} alt="School logo" className="w-full h-full object-cover" />
            ) : (
              schoolProfile.logoText || "FA"
            )}
          </div>
          <div>
            <h1 className="font-display font-medium text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
              <span>{lang === 'EN' ? schoolProfile.name : (schoolProfile.nameSomali || schoolProfile.name)}</span>
            </h1>
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block mt-1">
              {t.ethiopiaGov}
            </span>
          </div>
        </div>

        {/* Global actions: Semester, Language Select */}
        <div className="flex items-center gap-3">
          {/* Active stats badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-600/10 text-amber-500 font-semibold text-xs rounded-full border border-amber-600/20 font-sans">
            <Layers size={13} className="text-amber-500" />
            <span>{activeYearObj?.label}</span>
          </div>

          {/* Quick Language Toggle */}
          <div className="bg-[#16181D] p-1 rounded-xl flex items-center border border-slate-800">
            <Globe2 size={13} className="text-slate-500 mx-2" />
            <button
              onClick={() => setLang('EN')}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                lang === 'EN' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => setLang('SO')}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                lang === 'SO' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SOMALI (AF-SOOMAALI)
            </button>
          </div>

          {/* White/Dark Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="bg-[#16181D] p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-250 cursor-pointer flex items-center justify-center transition-all active:scale-95 shrink-0"
            title={theme === 'light' ? 'Activate Dark Mode' : 'Activate Light Theme'}
          >
            {theme === 'light' ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-amber-500" />}
          </button>

          {/* User log display */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div 
              onClick={() => document.getElementById('header-avatar-upload')?.click()}
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-705 flex items-center justify-center overflow-hidden text-xs font-bold text-slate-300 shadow-inner shrink-0 cursor-pointer hover:border-amber-500 hover:scale-105 transition-all group relative"
              title={lang === 'EN' ? "Change profile picture" : "የግል መገለጫ ፎቶ ቀይር"}
            >
              {currentUser.photoUrl ? (
                <img 
                  src={currentUser.photoUrl} 
                  alt={currentUser.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              ) : (
                currentUser.name ? currentUser.name.charAt(0) : "U"
              )}
              {/* Overlapping hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={10} className="text-amber-400" />
              </div>
              <input 
                id="header-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
              />
            </div>
            <div className="hidden lg:block text-left text-xs font-sans">
              <span className="font-bold text-slate-350 block">
                {currentUser.role === 'Super_Admin' 
                  ? (lang === 'EN' ? 'Super Administrator' : 'ዋና ሥራ አስኪያጅ') 
                  : currentUser.role === 'Principal' 
                    ? (lang === 'EN' ? 'Principal / Director' : 'ዶ/ር አብርሃም አሰፋ') 
                    : currentUser.role === 'Teacher'
                      ? (lang === 'EN' ? 'Assigned Teacher' : 'የክፍል መምህር')
                      : (lang === 'EN' ? 'Student Portal' : 'የተማሪ ገጽ')}
              </span>
              <span className="text-[10px] text-slate-500 block">{currentUser.name}</span>
            </div>
            <button
              onClick={() => {
                setCurrentUser(null);
                setActiveTab('Dashboard');
              }}
              title={lang === 'EN' ? 'Sign Out Session' : 'ውጣ'}
              className="p-1.5 rounded-lg bg-red-950/20 hover:bg-amber-600/15 border border-red-900/30 text-red-400 hover:text-amber-500 cursor-pointer transition-all flex items-center justify-center active:scale-95"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main administrative body */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Sidebar navigation */}
        <aside className="w-full md:w-64 bg-[#111318] text-slate-400 px-4 py-6 flex flex-col justify-between border-r border-slate-800 no-print">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] text-amber-500 font-extrabold tracking-widest block uppercase px-3">
                {t.adminCenter}
              </span>
            </div>

            <nav className="space-y-1">
              {currentUser?.role === 'Student' ? (
                [
                  { id: 'MyInfo', label: lang === 'EN' ? 'My Information' : 'የኔ መረጃ', icon: <FileSpreadsheet size={18} /> }
                ].map((navItem) => (
                  <button
                    key={navItem.id}
                    onClick={() => setActiveTab(navItem.id as any)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold bg-amber-600/10 text-amber-500 font-bold border-l-4 border-amber-600 cursor-pointer"
                  >
                    {navItem.icon}
                    <span>{navItem.label}</span>
                  </button>
                ))
              ) : (
                [
                  { id: 'Dashboard', label: t.dashboard, icon: <LayoutDashboard size={18} /> },
                  ...(currentUser?.role === 'Super_Admin' || currentUser?.role === 'Principal' ? [
                    { id: 'AdminCenter', label: lang === 'EN' ? "Master Admin Center" : "ዋና አስተዳደር ማዕከል", icon: <ShieldAlert size={18} /> }
                  ] : []),
                  ...(currentUser?.role !== 'Teacher' ? [
                    { id: 'School', label: t.schoolManagement, icon: <Building2 size={18} /> },
                    { id: 'Users', label: t.userManagement, icon: <Users size={18} /> }
                  ] : []),
                  { id: 'Academics', label: t.academicManagement, icon: <FileSpreadsheet size={18} /> },
                  ...(currentUser?.role !== 'Teacher' ? [
                    { id: 'Finance', label: t.financialManagement, icon: <CircleDollarSign size={18} /> }
                  ] : []),
                  { id: 'Reports', label: t.reportsCenter, icon: <Award size={18} /> }
                ].map((navItem) => (
                  <button
                    key={navItem.id}
                    onClick={() => setActiveTab(navItem.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === navItem.id
                        ? 'bg-amber-600/10 text-amber-500 font-bold border-l-4 border-amber-600'
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`}
                  >
                    {navItem.icon}
                    <span>{navItem.label}</span>
                  </button>
                ))
              )}
            </nav>
          </div>

          {/* Quick Footer credentials block */}
          <div className="pt-6 border-t border-slate-800 px-3 space-y-2 text-[10px]">
            <span className="text-slate-500 font-sans block leading-relaxed">{t.allRightsReserved}</span>
            <span className="text-slate-600 block">{schoolProfile.city}, Ethiopia</span>
          </div>
        </aside>

        {/* Primary Page Canvas staging section */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* Conditional page render based on state value */}
          {activeTab === 'Dashboard' && (
            <DashboardOverview 
              students={students}
              teachers={teachers}
              parents={parents}
              invoices={invoices}
              scoreRecords={scoreRecords}
              t={t}
              lang={lang}
              currentUser={currentUser}
              attendance={attendance}
            />
          )}

          {activeTab === 'School' && (
            <SchoolManagement 
              schoolProfile={schoolProfile}
              setSchoolProfile={setSchoolProfile}
              academicYears={academicYears}
              setAcademicYears={setAcademicYears}
              t={t}
              lang={lang}
            />
          )}

          {activeTab === 'Users' && (
            <UserManagement 
              students={students}
              setStudents={setStudents}
              teachers={teachers}
              setTeachers={setTeachers}
              parents={parents}
              setParents={setParents}
              users={users}
              setUsers={setUsers}
              t={t}
              lang={lang}
            />
          )}

          {activeTab === 'Academics' && (
            <AcademicManagement 
              students={students}
              setStudents={setStudents}
              teachers={teachers}
              scoreRecords={scoreRecords}
              setScoreRecords={setScoreRecords}
              timetable={timetable}
              setTimetable={setTimetable}
              attendance={attendance}
              setAttendance={setAttendance}
              t={t}
              lang={lang}
              currentUser={currentUser}
              subjects={subjects}
              setSubjects={setSubjects}
              grades={grades}
              setGrades={setGrades}
              parents={parents}
            />
          )}

          {activeTab === 'Finance' && (
            <FinancialManagement 
              invoices={invoices}
              setInvoices={setInvoices}
              students={students}
              t={t}
              lang={lang}
              bursarPasscode={bursarPasscode}
              bursarName={bursarName}
              isFinanceLocked={isFinanceLocked}
            />
          )}

          {activeTab === 'Reports' && (
            <ReportsCenter 
              students={students}
              scoreRecords={scoreRecords}
              invoices={invoices}
              t={t}
              lang={lang}
            />
          )}

          {activeTab === 'AdminCenter' && (
            <MasterAdminCenter
              students={students}
              setStudents={setStudents}
              teachers={teachers}
              setTeachers={setTeachers}
              scoreRecords={scoreRecords}
              setScoreRecords={setScoreRecords}
              invoices={invoices}
              setInvoices={setInvoices}
              lang={lang}
              bursarPasscode={bursarPasscode}
              setBursarPasscode={setBursarPasscode}
              bursarName={bursarName}
              setBursarName={setBursarName}
              isFinanceLocked={isFinanceLocked}
              setIsFinanceLocked={setIsFinanceLocked}
              authorizedFeesCodes={authorizedFeesCodes}
              setAuthorizedFeesCodes={setAuthorizedFeesCodes}
            />
          )}

          {activeTab === 'MyInfo' && (
            <StudentPortal 
              currentStudent={currentUser.studentObj || students[0]}
              scoreRecords={scoreRecords}
              lang={lang}
            />
          )}

        </main>

      </div>
    </div>
  );
}
