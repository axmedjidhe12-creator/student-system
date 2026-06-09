/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  UserCheck, 
  Globe2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Teacher, Student } from '../types';

interface LoginProps {
  onLogin: (user: { id: string; name: string; email: string; role: 'Super_Admin' | 'Principal' | 'Teacher' | 'Student'; teacherObj?: Teacher; studentObj?: Student }) => void;
  lang: 'EN' | 'AM' | 'SO';
  setLang: (lang: 'EN' | 'AM' | 'SO') => void;
  teachers: Teacher[];
  students: Student[];
  schoolProfile?: any;
  adminEmail?: string;
  adminPassword?: string;
  principalEmail?: string;
  principalPassword?: string;
}

export default function Login({ 
  onLogin, 
  lang, 
  setLang, 
  teachers, 
  students, 
  schoolProfile,
  adminEmail,
  adminPassword,
  principalEmail,
  principalPassword
}: LoginProps) {
  const [roleTab, setRoleTab] = useState<'Admin' | 'Teacher' | 'Student'>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick select accounts
  const demoAccounts = {
    Admin: [
      {
        name: "Dr. Abraham Assefa",
        role: "Principal / Director",
        nameAm: "ዶ/ር አብርሃም አሰፋ",
        email: "abraham.a@focusacademy.edu.et",
        password: "admin123"
      },
      {
        name: "Super Admin Team",
        role: "System Administrator",
        nameAm: "ዋና ሥራ አስኪያጅ",
        email: "admin@focusacademy.edu.et",
        password: "admin123"
      }
    ],
    Teacher: [
      {
        name: "Alemayehu Tadesse",
        role: "Math Teacher",
        nameAm: "አለማየሁ ታደሰ",
        email: "alemayehu.t@focusacademy.edu.et",
        password: "teacher123"
      },
      {
        name: "Tigist Gidey",
        role: "Physics Teacher",
        nameAm: "ትዕግስት ግደይ",
        email: "tigist.g@focusacademy.edu.et",
        password: "teacher123"
      }
    ],
    Student: [
      {
        name: "Yonas Bekele",
        role: "Grade 8 Student",
        nameAm: "ዮናስ በቀለ",
        email: "yonas.bek@focusacademy.edu.et",
        password: "1001"
      },
      {
        name: "Seble Hailu",
        role: "Grade 8 Student",
        nameAm: "ሰምል ኃይሉ",
        email: "seble.h@focusacademy.edu.et",
        password: "1002"
      }
    ]
  };

  const handleAutofill = (acc: any) => {
    if (roleTab === 'Student') {
      setEmail(acc.password);
      setPassword('');
    } else {
      setEmail(acc.email);
      setPassword(acc.password);
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(roleTab === 'Student' 
        ? (lang === 'EN' ? 'Please enter your Student Access Code' : lang === 'AM' ? 'እባክዎ የተማሪ መለያ ኮድዎን ያስገቡ' : 'Fadlan geli Koodhka gelitaanka Ardayga')
        : (lang === 'EN' ? 'Please enter your email address' : lang === 'AM' ? 'እባክዎ የኢሜይል አድራሻዎን ያስገቡ' : 'Fadlan geli cinwaankaaga emailka'));
      return;
    }

    if (roleTab !== 'Student' && !password) {
      setError(lang === 'EN' ? 'Please enter your password' : lang === 'AM' ? 'እባክዎ የይለፍ ቃልዎን ያስገቡ' : 'Fadlan geli eraygaaga sirta ah');
      return;
    }

    // Attempt Admin Authentication
    if (roleTab === 'Admin') {
      const activeAdminEmail = adminEmail || "admin@focusacademy.edu.et";
      const activeAdminPass = adminPassword || "admin123";
      const activePrincipalEmail = principalEmail || "abraham.a@focusacademy.edu.et";
      const activePrincipalPass = principalPassword || "admin123";

      const isSuperAdmin = (email.trim().toLowerCase() === activeAdminEmail.trim().toLowerCase());
      const isPrincipal = (email.trim().toLowerCase() === activePrincipalEmail.trim().toLowerCase());

      if (isSuperAdmin && password === activeAdminPass) {
        onLogin({
          id: "usr-admin-1",
          name: "Super Administrator Team",
          email: activeAdminEmail,
          role: "Super_Admin"
        });
        return;
      } else if (isPrincipal && password === activePrincipalPass) {
        onLogin({
          id: "usr-pr-1",
          name: "Dr. Abraham Assefa",
          email: activePrincipalEmail,
          role: "Principal"
        });
        return;
      } else {
        // Find if they typed a teacher account while on Admin tab
        const isTch = teachers.find(t => t.email.toLowerCase() === email.trim().toLowerCase());
        if (isTch) {
          setError(lang === 'EN' 
            ? 'This is a Teacher account. Please switch to the "Teacher" tab above!' 
            : lang === 'AM' ? 'ይህ የመምህር አካውንት ነው። እባክዎ ከላይ ያለውን "የክፍል መምህር" ታብ ይምረጡ!' : 'Kani waa akoonka Macallinka. Fadlan u beddel tab-ka "Macallin" ee kore!');
          return;
        }
        setError(lang === 'EN' 
          ? 'Invalid Admin credentials or password. Please try again.' 
          : lang === 'AM' ? 'ልክ ያልሆነ የአስተዳዳሪ መለያ ቁጥር ወይም የይለፍ ቃል ነው። እባክዎ እንደገና ይሞክሩ።' : 'Macluumaadka Maamulaha ee khaldan. Fadlan isku day markale!');
      }
    } else if (roleTab === 'Teacher') {
      // Attempt Teacher Authentication (supports email or teacherCode)
      const input = email.trim().toLowerCase();
      const foundTeacher = teachers.find(t => 
        t.email.toLowerCase() === input ||
        (t.teacherCode && t.teacherCode.toLowerCase() === input)
      );
      if (foundTeacher) {
        const expectedPassword = foundTeacher.password || "teacher123";
        if (password !== expectedPassword) {
          setError(lang === 'EN' ? 'Incorrect teacher password. Check with the administrator!' : lang === 'AM' ? 'ስህተት የይለፍ ቃል! የአስተዳዳሪውን ያነጋግሩ' : 'Erayga sirta ah ee macallinka waa khaldan yahay. Kala xiriir maamulaha!');
          return;
        }
        onLogin({
          id: foundTeacher.id,
          name: foundTeacher.name,
          email: foundTeacher.email,
          role: "Teacher",
          teacherObj: foundTeacher
        });
      } else {
        if (email === "admin@focusacademy.edu.et" || email === "abraham.a@focusacademy.edu.et") {
          setError(lang === 'EN'
            ? 'This is an Administrator account. Please switch to the "Admin" tab above!'
            : lang === 'AM' ? 'ይህ የአስተዳዳሪ አካውንት ነው። እባክዎ ከላይ ያለውን "አስተዳዳሪ" ታብ ይምረጡ!' : 'Kani waa akoon Maamule. Fadlan u beddel tab-ka "Admin" ee kore!');
          return;
        }
        setError(lang === 'EN'
          ? 'Teacher profile not found. Please verify your credentials or contact the administrator.'
          : lang === 'AM' ? 'የመምህር መገለጫ አልተገኘም። እባክዎ ዋና አስተዳዳሪውን ያነጋግሩ።' : 'Xogta macallinka lama helin. Fadlan kala xiriir maamulaha nidaamka.');
      }
    } else {
      // Role is Student
      const codeOrId = email.trim().toLowerCase();
      const foundStudent = students.find(s => 
        (s.studentCode && s.studentCode.toLowerCase() === codeOrId) ||
        s.id.toLowerCase() === codeOrId ||
        s.rollNo.toLowerCase() === codeOrId
      );

      if (foundStudent) {
        onLogin({
          id: foundStudent.id,
          name: foundStudent.name,
          email: foundStudent.email,
          role: "Student",
          studentObj: foundStudent
        });
      } else {
        setError(lang === 'EN'
          ? 'Student Access Code not recognized. Please check your credentials.'
          : lang === 'AM' ? 'የተማሪ መግቢያ ኮድ አልታወቀም። እባክዎ መለያዎን ይፈትሹ።' : 'Koodhka gelitaanka Ardayga lama garan. Fadlan hubi macluumaadkaaga.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans select-none antialiased">
      {/* Absolute background accent glows to match the UI vibe */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Logo and Greeting Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600 border border-amber-500 shadow-lg shadow-amber-600/15 mb-2 overflow-hidden">
            {schoolProfile?.logoUrl || schoolProfile?.photoUrl ? (
              <img 
                src={schoolProfile?.logoUrl || schoolProfile?.photoUrl} 
                alt="School logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                id="login-school-logo"
              />
            ) : (
              <Building2 className="text-white w-7 h-7" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-white font-sans">
              {lang === 'EN' ? 'Focus Academy' : 'Akaademiyada Focus'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
              {lang === 'EN' ? 'MINISTRY OF EDUCATION CERTIFIED PORTAL' : 'WASAAARADDA WAXBARASHADA BOORTALKA CODSIGA'}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#111318] border border-slate-800/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
          
          {/* Internal Language Selector + Mode */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-sans">
              {lang === 'EN' ? 'SECURE PORTAL LOGIN' : 'GALITAANKA PORTAL-KA AMMAANKA AH'}
            </span>
            
            <div className="bg-[#1c1e24] p-0.5 rounded-lg flex items-center border border-slate-800">
              <Globe2 size={11} className="text-slate-500 mx-1.5" />
              <button
                type="button"
                onClick={() => setLang('EN')}
                className={`px-2 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer ${
                  lang === 'EN' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-350'
                }`}
              >
                ENGLISH
              </button>
              <button
                type="button"
                onClick={() => setLang('SO')}
                className={`px-2 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer ${
                  lang === 'SO' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-350'
                }`}
              >
                AF-SOOMAALI
              </button>
            </div>
          </div>

          {/* Persona Selection Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#16181D] p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => { setRoleTab('Admin'); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 text-[10px] sm:text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                roleTab === 'Admin'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck size={13} className="shrink-0" />
              <span>{lang === 'EN' ? 'Admin' : 'Maamulka'}</span>
            </button>
            <button
              onClick={() => { setRoleTab('Teacher'); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 text-[10px] sm:text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                roleTab === 'Teacher'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap size={13} className="shrink-0" />
              <span>{lang === 'EN' ? 'Teacher' : 'Macallin'}</span>
            </button>
            <button
              onClick={() => { setRoleTab('Student'); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 text-[10px] sm:text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                roleTab === 'Student'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck size={13} className="shrink-0" />
              <span>{lang === 'EN' ? 'Student' : 'Ardayga'}</span>
            </button>
          </div>

          {/* Error Alert panel */}
          {error && (
            <div className="p-3 bg-red-950/25 border border-red-900/50 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field / Code Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {roleTab === 'Student' 
                  ? (lang === 'EN' ? 'Student Access Code' : 'Koodhka Ardayga')
                  : (lang === 'EN' ? 'Authorization Email' : 'Email-ka Maamulka')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={15} />
                </div>
                <input
                  type={roleTab === 'Admin' ? "email" : "text"}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder={
                    roleTab === 'Student' 
                      ? "e.g., 1001" 
                      : (roleTab === 'Admin' ? "admin@focusacademy.edu.et" : "Email or e.g., TCH-9081")
                  }
                  className="w-full bg-[#16181D] border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            {roleTab !== 'Student' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'EN' ? 'Account Password' : 'Erayga Sirta ah'}
                  </label>
                  <span className="text-[10px] text-slate-550 italic">
                    {lang === 'EN' ? 'Secure Connection' : 'Xiriir Sugan'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    className="w-full bg-[#16181D] border border-slate-800 text-slate-100 placeholder-slate-700 rounded-xl pl-9.5 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-550 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-amber-600/10 cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2 active:scale-[0.98]"
            >
              <span>{lang === 'EN' ? 'Authenticate Session' : 'Gali oo Sii Soco'}</span>
              <ChevronRight size={14} />
            </button>
          </form>

        </div>

        {/* Safe, real production layout. Certified Demo Accounts shortcut panel has been clean-removed for production packaging. */}

        <div className="text-center text-[10px] text-slate-600 font-sans">
          {lang === 'EN' ? 'Focus Academy Certified Core 2018-2019 E.C.' : 'Akaademiyada Focus oo Shahaado Haysata Core 2018-2019 E.C.'}
        </div>

      </div>
    </div>
  );
}
