/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProfile, AcademicYear } from '../types';
import { AppTranslations } from '../translations';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  Layers, 
  Plus, 
  Check, 
  Archive, 
  BadgeCheck 
} from 'lucide-react';

interface SchoolManagementProps {
  schoolProfile: SchoolProfile;
  setSchoolProfile: (profile: SchoolProfile) => void;
  academicYears: AcademicYear[];
  setAcademicYears: (years: AcademicYear[]) => void;
  t: AppTranslations;
  lang: 'EN' | 'SO';
}

export default function SchoolManagement({
  schoolProfile,
  setSchoolProfile,
  academicYears,
  setAcademicYears,
  t,
  lang
}: SchoolManagementProps) {
  // Local form state for Profile
  const [profileForm, setProfileForm] = useState<SchoolProfile>({ ...schoolProfile });
  const [isSaved, setIsSaved] = useState(false);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileForm(prev => ({ ...prev, logoUrl: base64String }));
        setSchoolProfile({ ...schoolProfile, logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Local form state for Academic Year creation
  const [newYearLabel, setNewYearLabel] = useState("");
  const [newYearId, setNewYearId] = useState("");
  const [showAddYear, setShowAddYear] = useState(false);

  // Region standard list in Ethiopia
  const ethiopianRegions = [
    "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", 
    "Gambela", "Harari", "Oromia", "Sidama", "Somali", 
    "South Ethiopia", "Central Ethiopia", "South West Ethiopia", "Tigray"
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolProfile(profileForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearLabel || !newYearId) return;

    const newYear: AcademicYear = {
      id: newYearId,
      label: newYearLabel,
      status: 'Draft',
      semester: 'Semester 1'
    };

    setAcademicYears([...academicYears, newYear]);
    setNewYearLabel("");
    setNewYearId("");
    setShowAddYear(false);
  };

  const setActiveYear = (id: string) => {
    const updated = academicYears.map(year => {
      if (year.id === id) {
        return { ...year, status: 'Active' as const };
      } else if (year.status === 'Active') {
        return { ...year, status: 'Archived' as const };
      }
      return year;
    });
    setAcademicYears(updated);
  };

  const archiveYear = (id: string) => {
    const updated = academicYears.map(year => {
      if (year.id === id) {
        return { ...year, status: 'Archived' as const };
      }
      return year;
    });
    setAcademicYears(updated);
  };

  const toggleSemester = (id: string) => {
    const updated = academicYears.map(year => {
      if (year.id === id) {
        const nextSemester = year.semester === 'Semester 1' ? 'Semester 2' as const : 'Semester 1' as const;
        return { ...year, semester: nextSemester };
      }
      return year;
    });
    setAcademicYears(updated);
  };

  const activeYearObj = academicYears.find(y => y.status === 'Active');

  return (
    <div className="space-y-8">
      
      {/* Grid containing Profile Form and Settings Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Editing Section */}
        <div className="lg:col-span-2 bg-[#16181D] p-6 rounded-2xl shadow-xs border border-slate-800">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
            <div 
              onClick={() => document.getElementById('logo-file-input')?.click()}
              className="p-1 w-11 h-11 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-amber-600/20 transition-all relative group shrink-0"
              title={lang === 'EN' ? "Click to change/upload School Logo" : "የትምህርት ቤቱን አርማ ለመቀየር/ለመጫን ይጫኑ"}
            >
              {profileForm.logoUrl ? (
                <img 
                  src={profileForm.logoUrl} 
                  alt="School Logo" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 size={22} />
              )}
              {/* Overlay edit state label */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                <span className="text-[8px] text-amber-400 font-extrabold uppercase tracking-wide">
                  {lang === 'EN' ? 'Logo' : 'አርማ'}
                </span>
              </div>
              <input 
                id="logo-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoFileChange}
              />
            </div>
            <div>
              <h2 className="font-display font-medium text-white text-lg">{t.schoolProfile}</h2>
              <p className="text-xs text-slate-500">{lang === 'EN' ? "Establish primary administrative identity contacts." : "ዋና ከተማ እና አድራሻዎችን ማቀናበሪያ ገጽ።"}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "School Name (English)" : "የትምህርት ቤቱ ስም (እንግሊዝኛ)"}</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  required
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "School Name (Amharic)" : "የትምህርት ቤቱ ስም (አማርኛ)"}</label>
                <input 
                  type="text" 
                  value={profileForm.nameAmharic} 
                  required
                  onChange={(e) => setProfileForm({ ...profileForm, nameAmharic: e.target.value })}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "Short Logo Initials" : "የትምህርት ቤቱ አጭር መጠሪያ ፊደል (Logo)"}</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={profileForm.logoText} 
                  required
                  onChange={(e) => setProfileForm({ ...profileForm, logoText: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans text-center font-bold tracking-wider focus:outline-hidden focus:border-amber-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "Principal / Director" : "ርዕሰ መምህር / ኃላፊ"}</label>
                <input 
                  type="text" 
                  value={profileForm.principalName} 
                  required
                  onChange={(e) => setProfileForm({ ...profileForm, principalName: e.target.value })}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    required
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-slate-900/50 rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.phone}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    value={profileForm.phone} 
                    required
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-slate-900/50 rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "Region" : "ክልል"}</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <select 
                    value={profileForm.region}
                    onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })}
                    className="w-full bg-slate-900/50 rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors appearance-none"
                  >
                    {ethiopianRegions.map(reg => (
                      <option key={reg} value={reg} className="bg-[#16181D] text-slate-200">{reg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "City / Town" : "ከተማ"}</label>
                <input 
                  type="text" 
                  value={profileForm.city} 
                  required
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.address}</label>
                <input 
                  type="text" 
                  value={profileForm.address} 
                  required
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "School Logo Image URL" : "የትምህርት ቤቱ አርማ ፎቶ URL"}</label>
                <input 
                  type="text" 
                  value={profileForm.logoUrl || ""} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfileForm({ ...profileForm, logoUrl: val });
                    setSchoolProfile({ ...schoolProfile, logoUrl: val });
                  }}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                  placeholder="https://images.unsplash.com/logo..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'EN' ? "School Campus Photo URL" : "የትምህርት ቤቱ ቅጥር ግቢ ፎቶ URL"}</label>
                <input 
                  type="text" 
                  value={profileForm.photoUrl || ""} 
                  onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                  className="w-full bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-200 font-sans focus:outline-hidden focus:border-amber-600 transition-colors"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

            </div>

            <div className="flex items-center justify-between border-t border-slate-805 pt-5">
              <span className="text-xs text-slate-500 font-medium font-sans">
                {lang === 'EN' ? "Structure: Ethiopian Mini Curriculum Standards Approved" : "አስተዳደር ሥርዓት፡ በኢትዮጵያ ስታንዳርድ የፀደቀ"}
              </span>
              <button 
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-[#D97706]/10"
              >
                {isSaved ? <BadgeCheck size={16} /> : null}
                {isSaved ? (lang === 'EN' ? "Profile Saved!" : "ተቀምጧል!") : t.save}
              </button>
            </div>
          </form>
        </div>

        {/* Current Active Settings Summary Side Widget */}
        <div className="space-y-6">
          <div className="bg-[#16181D] text-slate-250 rounded-2xl shadow-md border border-slate-800 overflow-hidden relative">
            {schoolProfile.photoUrl ? (
              <div className="h-40 w-full relative">
                <img 
                  src={schoolProfile.photoUrl} 
                  alt={schoolProfile.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16181D] via-[#16181D]/40 to-transparent" />
              </div>
            ) : null}
            
            <div className={`p-6 relative z-10 space-y-4 ${schoolProfile.photoUrl ? 'mt-[-20px]' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center font-display font-bold text-lg text-amber-500 border border-amber-550/30 shadow-md overflow-hidden">
                {schoolProfile.logoUrl ? (
                  <img src={schoolProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  schoolProfile.logoText || "FA"
                )}
              </div>
              <div>
                <h3 className="text-lg font-display font-medium text-white">{schoolProfile.name}</h3>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">{schoolProfile.nameAmharic}</span>
              </div>
              <div className="h-px bg-slate-800 my-4" />
              <div className="text-xs space-y-2 text-slate-405 font-sans">
                <div className="flex justify-between">
                  <span>{lang === 'EN' ? "System Language" : "የስርዓቱ ቋንቋ"}:</span>
                  <span className="font-bold text-slate-200">English / አማርኛ</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'EN' ? "Education Code" : "የልማት ኮድ"}:</span>
                  <span className="font-bold text-slate-200 font-mono">MoE-ET-2026/A</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'EN' ? "Active Semester" : "ገባሪ ሴሚስተር"}:</span>
                  <span className="font-semibold text-amber-500 font-mono bg-amber-600/10 px-2 py-0.5 rounded border border-amber-600/20">
                    {activeYearObj?.semester || "Semester 1"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'EN' ? "Database Cache" : "ዳታቤዝ መዝገብ"}:</span>
                  <span className="font-sans text-emerald-500 font-semibold">{lang === 'EN' ? "Persistent Live" : "የቀጥታ መዝገብ"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-600/10 border border-amber-600/20 p-5 rounded-2xl text-xs text-amber-500 space-y-2">
            <h4 className="font-bold font-display text-slate-200 flex items-center gap-1.5">
              <User size={14} className="text-amber-500" />
              {lang === 'EN' ? "Primary Principal Responsibility" : "የመስሪያ ቤቱ ርዕሰ መምህር ጠቅላላ ኃላፊነት"}
            </h4>
            <p className="leading-relaxed text-slate-400">
              {lang === 'EN' 
                ? "The principal is responsible for supervising the teachers academic structures, certifying report cards, authorizing promotions, and releasing leaving transfer certificates." 
                : "ርዕሰ መምህር የአካዳሚክ መዋቅሩን የመቆጣጠር ፣ የክፍል መግለጫዎችን በፊርማ የማረጋገጥ ፣ የመዛወሪያ ሰርተፍኬቶችን የመስጠት አጠቃላይ ኃላፊነት አለባቸው።"}
            </p>
          </div>
        </div>

      </div>

      {/* Academic Year Management List section */}
      <div className="bg-[#16181D] p-6 rounded-2xl shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="font-display font-medium text-white text-lg">{t.academicYear} & {t.semester}</h2>
              <p className="text-xs text-slate-500">{lang === 'EN' ? "Create, toggle, and archive academic years." : "የትምህርት ዓመታት መቆጣጠሪያ።"}</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddYear(!showAddYear)}
            className="self-start sm:self-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-amber-700/20"
          >
            <Plus size={14} />
            {lang === 'EN' ? "Create Year" : "አዲስ የጥናት ዘመን"}
          </button>
        </div>

        {showAddYear && (
          <form onSubmit={handleAddAcademicYear} className="mb-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl max-w-lg space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {lang === 'EN' ? "New Academic Year Details" : "አዲስ የዓመተ ምህረት መረጃ"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Code ID (e.g. 2026-2027)</label>
                <input 
                  type="text" 
                  value={newYearId}
                  placeholder="2027-2028"
                  required
                  onChange={(e) => setNewYearId(e.target.value)}
                  className="w-full bg-[#16181D] border border-slate-800 px-3 py-1.5 text-xs text-slate-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Label (e.g., 2027/2028 (2019 E.C.))</label>
                <input 
                  type="text" 
                  value={newYearLabel}
                  placeholder="2027/2028 Academic Year (2020 E.C.)"
                  required
                  onChange={(e) => setNewYearLabel(e.target.value)}
                  className="w-full bg-[#16181D] border border-slate-800 px-3 py-1.5 text-xs text-slate-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowAddYear(false)}
                className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-[11px] font-semibold text-slate-400 rounded-lg cursor-pointer"
              >
                {t.cancel}
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-lg cursor-pointer"
              >
                {lang === 'EN' ? "Add Year" : "ዓመት ፍጠር"}
              </button>
            </div>
          </form>
        )}

        {/* Years Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 font-semibold bg-slate-900/30">
                <th className="p-4">{lang === 'EN' ? "Academic Year Label" : "የጥናት ዓመት"}</th>
                <th className="p-4">{lang === 'EN' ? "Active Semester" : "ገባሪ ሴሚስተር"}</th>
                <th className="p-4">{t.status}</th>
                <th className="p-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-350">
              {academicYears.map((year) => (
                <tr key={year.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-200">{year.label}</td>
                  <td className="p-4">
                     <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300 font-mono bg-slate-805 px-2 py-0.5 rounded border border-slate-800">
                        {year.semester}
                      </span>
                      {year.status === 'Active' && (
                        <button 
                          onClick={() => toggleSemester(year.id)}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold border border-amber-600/20 hover:border-amber-600/50 px-2 py-0.5 rounded cursor-pointer"
                          title="Click to Switch Semester"
                        >
                          {lang === 'EN' ? "Switch Semester" : "ሴሚስተር ቀይር"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                      year.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : year.status === 'Archived' 
                          ? 'bg-slate-800/80 text-slate-500 border border-slate-800' 
                          : 'bg-amber-600/10 text-amber-500 border border-amber-600/20'
                    }`}>
                      {year.status === 'Active' ? t.active : year.status === 'Archived' ? "Archived" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {year.status !== 'Active' && (
                        <button
                          onClick={() => setActiveYear(year.id)}
                          className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-[10px] font-semibold hover:bg-emerald-500/25 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} />
                          {lang === 'EN' ? "Make Active" : "አንቃ"}
                        </button>
                      )}
                      {year.status === 'Active' && (
                        <button
                          onClick={() => archiveYear(year.id)}
                          className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] font-semibold border border-slate-705/30 hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Archive size={12} />
                          {lang === 'EN' ? "Archive" : "አስቀምጥ"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
