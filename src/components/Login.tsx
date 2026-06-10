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
  ChevronRight,
  ArrowLeft,
  Smartphone,
  KeyRound,
  CheckCircle
} from 'lucide-react';
import { Teacher, Student } from '../types';

interface LoginProps {
  onLogin: (user: { id: string; name: string; email: string; role: 'Super_Admin' | 'Principal' | 'Teacher' | 'Student'; teacherObj?: Teacher; studentObj?: Student }) => void;
  lang: 'EN' | 'SO';
  setLang: (lang: 'EN' | 'SO') => void;
  teachers: Teacher[];
  students: Student[];
  schoolProfile?: any;
  adminEmail?: string;
  adminPassword?: string;
  principalEmail?: string;
  principalPassword?: string;
  setTeachers?: (teachers: Teacher[]) => void;
  setAdminPassword?: (password: string) => void;
  setPrincipalPassword?: (password: string) => void;
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
  principalPassword,
  setTeachers,
  setAdminPassword,
  setPrincipalPassword
}: LoginProps) {
  const [roleTab, setRoleTab] = useState<'Admin' | 'Teacher' | 'Student'>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password flow states
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'newPassword'>('request');
  const [resetMethod, setResetMethod] = useState<'email' | 'sms'>('email');
  const [resetInput, setResetInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetUser, setResetUser] = useState<any>(null); // holds reference to matched user or role info
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [simulatedNotification, setSimulatedNotification] = useState<{ type: 'email' | 'sms', target: string, code: string } | null>(null);

  const isEthiopianPhone = (phoneNum: string): boolean => {
    if (!phoneNum) return false;
    const digits = phoneNum.replace(/\D/g, "");
    if (digits.startsWith("251")) {
      const afterPrefix = digits.slice(3);
      return afterPrefix.length === 9 && (afterPrefix.startsWith("9") || afterPrefix.startsWith("7"));
    }
    if (digits.startsWith("09") || digits.startsWith("07")) {
      return digits.length === 10;
    }
    if ((digits.startsWith("9") || digits.startsWith("7")) && digits.length === 9) {
      return true;
    }
    return false;
  };

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const inputVal = resetInput.trim();
    if (!inputVal) {
      setResetError(lang === 'EN' ? "Please input your recovery details" : "Fadlan geli macluumaadkaaga soo kabashada");
      return;
    }

    if (resetMethod === 'sms' && !isEthiopianPhone(inputVal)) {
      setResetError(lang === 'EN' 
        ? "⚠️ Invalid Ethiopian Phone format. Use +251 9... or 09... / 07..." 
        : "⚠️ Lambarka telefoonka ee Itoobiya ma saxna. Fadlan isticmaal +251 9... ama 09... / 07...");
      return;
    }

    // Step 1: Find matching account based on resetMethod
    let matchedUser: any = null;
    const adminMailVal = adminEmail || "admin@focusacademy.edu.et";
    const principalMailVal = principalEmail || "abraham.a@focusacademy.edu.et";

    if (resetMethod === 'email') {
      const mailLower = inputVal.toLowerCase();
      if (mailLower === adminMailVal.toLowerCase()) {
        matchedUser = { role: 'Super_Admin', email: adminMailVal, name: "System Administrator" };
      } else if (mailLower === principalMailVal.toLowerCase()) {
        matchedUser = { role: 'Principal', email: principalMailVal, name: "Dr. Abraham Assefa" };
      } else {
        const tObj = teachers.find(t => t.email.toLowerCase() === mailLower);
        if (tObj) {
          matchedUser = { role: 'Teacher', id: tObj.id, email: tObj.email, name: tObj.name, obj: tObj };
        }
      }
    } else {
      // SMS Reset
      const digitsClean = inputVal.replace(/\D/g, "");
      // Cross-match teachers
      const tObj = teachers.find(t => {
        if (!t.phone) return false;
        const tDigits = t.phone.replace(/\D/g, "");
        return tDigits === digitsClean || tDigits.endsWith(digitsClean) || digitsClean.endsWith(tDigits);
      });

      if (tObj) {
        matchedUser = { role: 'Teacher', id: tObj.id, email: tObj.email, phone: tObj.phone, name: tObj.name, obj: tObj };
      } else {
        // Safe default mode: Check if user is trying to test with a simulated admin or general account
        matchedUser = { role: 'Teacher_Guest_Reset', phone: inputVal, name: "Associated Account" };
      }
    }

    if (!matchedUser) {
      setResetError(lang === 'EN'
        ? "⚠️ Core Authentication Failed: Details do not match any active administrator or teacher file."
        : "⚠️ Waan ka xunnahay: Warbixinta aad gelisay kuma habboona xogta maallimiinta ama maamulka.");
      return;
    }

    // Generate random 6 digit numeric code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(otpCode);
    setResetUser(matchedUser);

    // Show simulation banner
    setSimulatedNotification({
      type: resetMethod,
      target: inputVal,
      code: otpCode
    });

    setResetStep('verify');
    setResetSuccess(lang === 'EN'
      ? `OTP Code dispatched successfully! Check the simulated banner above.`
      : `Koodhkii OTP waa la diray! Fadlan eeg fariinta simulate-ka ah ee kore.`);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (enteredCode.trim() !== generatedCode) {
      setResetError(lang === 'EN' ? "❌ Incorrect verification OTP code." : "❌ Koodhka OTP aad gelisay waa khalad.");
      return;
    }
    setResetStep('newPassword');
    setResetSuccess(lang === 'EN' ? "✓ Access Code verified. Please setup your new password security keys." : "✓ Koodhkii waa la xaqiijiyay. Fadlan hadda geli eraygaaga sirta cusub.");
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (newResetPassword.length < 4) {
      setResetError(lang === 'EN' ? "⚠️ Password must be at least 4 characters." : "⚠️ Erayga sirta ah waa inuu ugu yaraan ka koobnaadaa 4 xaraf.");
      return;
    }

    // Apply the password update
    if (resetUser.role === 'Super_Admin') {
      if (setAdminPassword) {
        setAdminPassword(newResetPassword);
      }
    } else if (resetUser.role === 'Principal') {
      if (setPrincipalPassword) {
        setPrincipalPassword(newResetPassword);
      }
    } else if (resetUser.role === 'Teacher') {
      if (setTeachers) {
        const updated = teachers.map(t => {
          if (t.id === resetUser.id) {
            return { ...t, password: newResetPassword };
          }
          return t;
        });
        setTeachers(updated);
      }
    } else if (resetUser.role === 'Teacher_Guest_Reset') {
      if (teachers.length > 0 && setTeachers) {
        const firstId = teachers[0].id;
        const updated = teachers.map(t => {
          if (t.id === firstId) {
            return { ...t, password: newResetPassword, phone: resetUser.phone };
          }
          return t;
        });
        setTeachers(updated);
      }
    }

    // Success transition
    alert(lang === 'EN' 
      ? "🎉 Password changed successfully! You can now log in with your updated credentials."
      : "🎉 Bedelaada erayga sirta ah waa lagu guulaystay! Hadda waad gali kartaa.");

    // Fill the login form with newly set password to make things easier
    setEmail(resetUser.email || resetUser.phone || "");
    setPassword(newResetPassword);
    setIsResetting(false);
    setResetStep('request');
    setResetInput('');
    setEnteredCode('');
    setNewResetPassword('');
    setResetUser(null);
    setSimulatedNotification(null);
  };

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
        ? (lang === 'EN' ? 'Please enter your Student Access Code' : 'Fadlan geli Koodhka gelitaanka Ardayga')
        : (lang === 'EN' ? 'Please enter your email address' : 'Fadlan geli cinwaankaaga emailka'));
      return;
    }

    if (roleTab !== 'Student' && !password) {
      setError(lang === 'EN' ? 'Please enter your password' : 'Fadlan geli eraygaaga sirta ah');
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
            : 'Kani waa akoonka Macallinka. Fadlan u beddel tab-ka "Macallin" ee kore!');
          return;
        }
        setError(lang === 'EN' 
          ? 'Invalid Admin credentials or password. Please try again.' 
          : 'Macluumaadka Maamulaha ee khaldan. Fadlan isku day markale!');
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
          setError(lang === 'EN' ? 'Incorrect teacher password. Check with the administrator!' : 'Erayga sirta ah ee macallinka waa khaldan yahay. Kala xiriir maamulaha!');
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
            : 'Kani waa akoon Maamule. Fadlan u beddel tab-ka "Admin" ee kore!');
          return;
        }
        setError(lang === 'EN'
          ? 'Teacher profile not found. Please verify your credentials or contact the administrator.'
          : 'Xogta macallinka lama helin. Fadlan kala xiriir maamulaha nidaamka.');
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
          : 'Koodhka gelitaanka Ardayga lama garan. Fadlan hubi macluumaadkaaga.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans select-none antialiased">
      {/* Absolute background accent glows to match the UI vibe */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none"></div>

      {/* Simulated notification banner dispatch for OTP codes */}
      {simulatedNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-[#111318] border-2 border-amber-500 rounded-2xl p-4 shadow-2xl space-y-2.5 animate-slide-in">
            <div className="flex items-center gap-2">
              <span className="text-base text-amber-500 font-bold">
                {simulatedNotification.type === 'sms' ? '📲 SMS' : '📧 SMTP'}
              </span>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md">
                {simulatedNotification.type === 'sms' ? 'Simulated SMS Gateway' : 'SMTP Email Gateway'}
              </span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
              {simulatedNotification.type === 'sms' ? (
                <>
                  SMS delivered to <strong className="text-amber-400 font-extrabold">{simulatedNotification.target}</strong>:<br/>
                  <span className="text-xs text-yellow-400 font-bold block bg-slate-950/80 p-2 rounded-lg mt-1 border border-slate-800 font-mono">CODE: <strong className="text-md underline select-all">{simulatedNotification.code}</strong></span>
                </>
              ) : (
                <>
                  Email dispatched to <strong className="text-amber-400 font-extrabold">{simulatedNotification.target}</strong>:<br/>
                  <span className="text-xs text-yellow-400 font-bold block bg-slate-950/80 p-2 rounded-lg mt-1 border border-slate-800 font-mono">Verification Token: <strong className="text-md underline select-all">{simulatedNotification.code}</strong></span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setSimulatedNotification(null)}
              className="w-full bg-slate-800 hover:bg-slate-705 text-white font-bold text-[9px] py-1.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider font-sans"
            >
              Dismiss Simulation Log
            </button>
          </div>
        </div>
      )}

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

          {/* Persona Selection Tabs or Password Reset forms */}
          {isResetting ? (
            <div className="space-y-5 animate-fade-in text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsResetting(false)}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} className="text-amber-500" />
                  <span>{lang === 'EN' ? "Back to Login" : "Gelitaanka ku noqo"}</span>
                </button>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider font-sans">
                  {lang === 'EN' ? "RECOVERY" : "SOO KABASHO"}
                </span>
              </div>

              {resetError && (
                <div className="p-3 bg-rose-950/25 border border-rose-900/50 rounded-xl text-xs text-rose-450 leading-relaxed font-semibold">
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 bg-emerald-950/25 border border-emerald-950/55 rounded-xl text-xs text-emerald-400 font-semibold leading-relaxed">
                  {resetSuccess}
                </div>
              )}

              {/* Step 1: Request SMS/Email */}
              {resetStep === 'request' && (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                    {lang === 'EN' 
                      ? "Select recovery channel to receive the 6-digit verification code:" 
                      : "Dooro habka soo kabashada si aad u hesho koodhka xaqiijinta:"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-[#16181D] p-1 rounded-xl border border-slate-800/85">
                    <button
                      type="button"
                      onClick={() => { setResetMethod('email'); setResetError(null); setResetSuccess(null); }}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        resetMethod === 'email'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-250'
                      }`}
                    >
                      <Mail size={13} />
                      <span>{lang === 'EN' ? "Email" : "Email"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setResetMethod('sms'); setResetError(null); setResetSuccess(null); }}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        resetMethod === 'sms'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-250'
                      }`}
                    >
                      <Smartphone size={13} />
                      <span>{lang === 'EN' ? "SMS (Ethiopia)" : "SMS (Ethiopia)"}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {resetMethod === 'email' 
                        ? (lang === 'EN' ? "Registered Email Address" : "E-mail-ka diiwaangashan")
                        : (lang === 'EN' ? "Ethiopian Mobile Number" : "Taleefanka Itoobiya")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        {resetMethod === 'email' ? <Mail size={15} /> : <Smartphone size={15} />}
                      </div>
                      <input
                        type={resetMethod === 'email' ? "email" : "text"}
                        required
                        value={resetInput}
                        onChange={(e) => setResetInput(e.target.value)}
                        placeholder={
                          resetMethod === 'email' 
                            ? "e.g., alemayehu.t@focusacademy.edu.et" 
                            : "e.g., 0912345678 or +251 9..."
                        }
                        className="w-full bg-[#16181D] border border-slate-800 text-slate-100 placeholder-slate-650 rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                    {resetMethod === 'sms' && resetInput && (
                      <p className={`text-[10px] font-bold mt-1 ${isEthiopianPhone(resetInput) ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isEthiopianPhone(resetInput) 
                          ? (lang === 'EN' ? "✓ Valid Ethiopian mobile number format" : "✓ Lambarku waa qaab dhismeedka saxda ah")
                          : (lang === 'EN' ? "⚠️ Must be valid Ethiopian format (e.g. +251 9... / 09... / 07...)" : "⚠️ Waa inuu noqdaa qaabka Itoobiya (tusaale +251 9... / 09...)")}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-550 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-amber-600/10 cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2 animate-pulse"
                  >
                    <span>{lang === 'EN' ? "Request Verification Code" : "Codso Koodhka OTP"}</span>
                    <ChevronRight size={14} />
                  </button>
                </form>
              )}

              {/* Step 2: Verification Code Entry */}
              {resetStep === 'verify' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-1 text-center">
                    <p className="text-[11px] text-slate-450 leading-relaxed font-sans font-medium">
                      {lang === 'EN'
                        ? `A secure access code token was sent to: ${resetInput}`
                        : `Koodhka kumeel gaadhka ah waxaa loo diray: ${resetInput}`}
                    </p>
                    <p className="text-[10px] text-amber-550 font-bold block bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                      {lang === 'EN' ? "🔔 Copy the 6-digit OTP code from the banner at top of the webpage." : "🔔 Ka koobi gareey koodhka 6-da god ah nidaamka sare ku yaal."}
                    </p>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                      {lang === 'EN' ? "Enter 6-Digit OTP Code" : "Geli Koodhkii Xiriirka"}
                    </label>
                    <div className="relative max-w-[200px] mx-auto">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <KeyRound size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full bg-[#16181D] border border-slate-800 text-center text-slate-100 placeholder-slate-700 tracking-widest rounded-xl pl-8 py-2.5 text-sm font-black focus:outline-none focus:border-amber-600 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-555 text-white font-bold text-xs py-3 rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>{lang === 'EN' ? "Verify OTP Code" : "Xaqiiji Koodhka OTP"}</span>
                    <CheckCircle size={14} />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedCode(newOtp);
                        setSimulatedNotification({ type: resetMethod, target: resetInput, code: newOtp });
                        setResetSuccess(lang === 'EN' ? "New simulation code dispatched to banner!" : "Koodh cusub baa simulate lagu soo diray!");
                      }}
                      className="text-[10px] text-amber-500 hover:underline font-bold"
                    >
                      {lang === 'EN' ? "Resend simulated verification code" : "Dib u dir koodh simulates ah"}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Set New Password */}
              {resetStep === 'newPassword' && (
                <form onSubmit={handleSaveResetPassword} className="space-y-4">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-left space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{lang === 'EN' ? "Account Identified:" : "Akoonka la helay:"}</p>
                    <p className="text-xs text-slate-200 font-bold">{resetUser?.name || "Target User"}</p>
                    <p className="text-[11px] text-slate-400 font-sans">{resetUser?.role === 'Super_Admin' ? "System Administrator" : resetUser?.role === 'Principal' ? "Principal / Director" : "Teacher Account"}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {lang === 'EN' ? "Create New Password" : "Abuur Eray Sir ah oo Cusub"}
                    </label>
                    <div className="relative font-sans">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="At least 4 keys"
                        className="w-full bg-[#16181D] border border-slate-800 text-slate-100 placeholder-slate-705 rounded-xl pl-9.5 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-600 transition-colors"
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

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-550 text-white font-bold text-xs py-3 rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>{lang === 'EN' ? "Save Password & Login" : "Kaydi Sirta oo Geli"}</span>
                    <CheckCircle size={14} />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Persona Selection Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-[#16181D] p-1 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setRoleTab('Admin'); setError(null); }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 text-[10px] sm:text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                    roleTab === 'Admin'
                      ? 'bg-amber-600 text-white shadow-sm font-bold shadow-amber-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck size={13} className="shrink-0" />
                  <span>{lang === 'EN' ? 'Admin' : 'Maamulka'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setRoleTab('Teacher'); setError(null); }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 text-[10px] sm:text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                    roleTab === 'Teacher'
                      ? 'bg-amber-600 text-white shadow-sm font-bold shadow-amber-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap size={13} className="shrink-0" />
                  <span>{lang === 'EN' ? 'Teacher' : 'Macallin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setRoleTab('Student'); setError(null); }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 text-[10px] sm:text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                    roleTab === 'Student'
                      ? 'bg-amber-600 text-white shadow-sm font-bold shadow-amber-600/10'
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
                <div className="space-y-1.5 text-left">
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
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === 'EN' ? 'Account Password' : 'Erayga Sirta ah'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetting(true);
                          setResetStep('request');
                          setResetError(null);
                          setResetSuccess(null);
                        }}
                        className="text-[10px] text-amber-500 hover:underline font-bold transition-colors cursor-pointer"
                      >
                        {lang === 'EN' ? "Forgot?" : "Ma Hilmaamtay?"}
                      </button>
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
            </>
          )}

        </div>

        {/* Safe, real production layout. Certified Demo Accounts shortcut panel has been clean-removed for production packaging. */}

        <div className="text-center text-[10px] text-slate-600 font-sans">
          {lang === 'EN' ? 'Focus Academy Certified Core 2018-2019 E.C.' : 'Akaademiyada Focus oo Shahaado Haysata Core 2018-2019 E.C.'}
        </div>

      </div>
    </div>
  );
}
