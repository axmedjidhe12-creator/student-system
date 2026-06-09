/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Pause,
  CheckCircle2, 
  HelpCircle, 
  Video, 
  Terminal, 
  ShieldAlert, 
  FileSpreadsheet, 
  CreditCard, 
  Cloud, 
  ArrowRight, 
  UserCheck, 
  Activity, 
  BookOpenCheck,
  ChevronRight,
  Database,
  Building2,
  Users
} from 'lucide-react';

interface UserManualProps {
  lang: 'EN' | 'AM' | 'SO';
}

export default function UserManual({ lang }: UserManualProps) {
  const [activeManualTab, setActiveManualTab] = useState<'walkthrough' | 'modules' | 'troubleshooting'>('walkthrough');
  const [selectedVideo, setSelectedVideo] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(45);

  const [checklist, setChecklist] = useState({
    login: true,
    viewDashboard: false,
    addStudent: false,
    inputGrades: false,
    bursarLock: false,
    cloudSync: false
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Walkthrough simulated video guides
  const videoGuides = [
    {
      id: 0,
      titleEN: "1. Overview & Admin Control Center Tour",
      titleSO: "1. Kor-joogteynta Nabgelyada iyo Maamulidda",
      duration: "3:42",
      descriptionEN: "Complete administrative panel overview. How to track school statistics, manage users, and issue security codes.",
      descriptionSO: "Faahfaahinta guud ee maamulka sare. Sida loo dhiibo lambarada sSirta ah ee bursarka iyo maaraynta dadka.",
      stepsEN: [
        "Login using your certified principal or system admin login credentials.",
        "Check overall school metrics including total students, teachers, parents, and fee collections.",
        "Use the Master Admin tab to access security audit logs and MoE registers."
      ],
      stepsSO: [
        "Ka soo gal nidaamka adoo isticmaalaya xogta maamulaha sare ee laguu diyaariyey.",
        "Hubi tire-koobka guud ee dugsiga sida ardayda, macallimiinta, waalidiinta iyo lacagaha laguu soo shubay.",
        "Isticmaal qaybta 'Master Admin' si aad u aragto dhaqdhaqaaqa iyo logs-ka nidaamka."
      ]
    },
    {
      id: 1,
      titleEN: "2. Grade Management & Report Cards",
      titleSO: "2. Maaraynta Buundooyinka & Warqadda Natiijada",
      duration: "4:15",
      descriptionEN: "Learn continuous assessment mapping (30%), Midterms (20%), and Final exam marks input with printable reports.",
      descriptionSO: "Baro sida loo geliyo buundooyinka qiimaynta joogtada ah (30%), Imtixaanka Dhexe (20%), iyo kan fIinalka (50%).",
      stepsEN: [
        "Navigate to Academic Management section.",
        "Select Grade, Section, and Subject to instantly view classroom register.",
        "Input marks. Grade letters (A, B, C...) and promotion status calculutes instantly.",
        "Go to Reports tab to generate and print elegant MoE compliant student report cards."
      ],
      stepsSO: [
        "Aad qaybta daryeelka 'Academic Management'.",
        "Dooro fasalka (Grade), qaybta (Section), iyo maaddada si aad u aragto liiska ardayda.",
        "Geli buundooyinka. Nidaamka ayaa xisaabin doona dhibcaha guud iyo haddii ardaygu gudbay ama haray.",
        "Aad qaybta 'Reports' si aad u soo saarto warqadda natiijada (Report Card) si aad u daabacdo."
      ]
    },
    {
      id: 2,
      titleEN: "3. Cashier & Financial Billing Code",
      titleSO: "3. Maamulka Lacagaha & Tigidhada Bangiga",
      duration: "2:50",
      descriptionEN: "Invoice generation, tracking bank reference tracking, and locking student portals with Bursar security passcode.",
      descriptionSO: "Baro sida loo sameeyo qaansheegyo (invoices), hubinta tigidhada bangiga, iyo xidhista xogta lacag bixinta.",
      stepsEN: [
        "Access Financial Management by entering the secure Bursar passcode (Default: 8844).",
        "Generate student invoices for semester tuition fees.",
        "Cross reference Bank deposit reference codes (e.g. CBE, Awash, Telebirr) to approve payments."
      ],
      stepsSO: [
        "Ku gal qaybta Maaliyadda adbadbaadada adoo isticmaalaya furaha Bursar-ka (Default: 8844).",
        "U samee ardayda qaansheeg qeybaha sannad-dugsiyeedkan.",
        "Hubi koodhadhka rIixraaca bangiyada (sida CBE, Awash, Telebirr) si aad u xaqiijiso lacag bixinta."
      ]
    },
    {
      id: 3,
      titleEN: "4. Cloud Database & Live Synchronization",
      titleSO: "4. Isku-xidhka Live-ka ah ee Google Cloud Firebase",
      duration: "3:10",
      descriptionEN: "Keep entire system up-to-date. Configure custom Firebase credentials to automatically sync database across dual screens.",
      descriptionSO: "Sida ugu fudud ee aad u samayn karto backup-garayn ku kaydsan Google Cloud adoo isticmaalaya nidaamka Firebase.",
      stepsEN: [
        "Go to Master Admin -> Firebase Cloud Sync tab.",
        "Follow provided step-by-step console setup guide to paste custom free-tier Firebase JSON key.",
        "Click 'Push All Datasets' to host all records online, or 'Pull Cloud Copies' to download remote records."
      ],
      stepsSO: [
        "Aad Master Admin -> Firebase Cloud Sync tab dhanka midig.",
        "Geli JSON key ka socda mashruucaaga Google Firebase ee bilaashka ah.",
        "Guji 'Push All Datasets' si aad xogta oo dhan ugu raddo internetka, ama 'Pull Cloud Copies' si aad ula soo degto."
      ]
    }
  ];

  const currentVid = videoGuides[selectedVideo];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in" id="system_user_manual_section">
      
      {/* Title Header area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-850 pb-6">
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] bg-amber-600/10 text-amber-500 font-extrabold px-3 py-1 rounded-full border border-amber-600/20 font-sans tracking-wider uppercase inline-flex items-center gap-1.5">
            <BookOpenCheck size={12} />
            {lang === 'EN' ? "OPERATIONS ACADEMY" : "HAGAHA MAAMULIDDA APPSKA"}
          </span>
          <h2 className="text-2xl font-display font-medium text-white tracking-tight">
            {lang === 'EN' ? "Interactive System Training Manual & Walkthrough Guide" : "Hagaha Isticmaalka iyo Tababarka Interactive-ka ah"}
          </h2>
          <p className="text-xs text-slate-400 font-sans max-w-2xl">
            {lang === 'EN' 
              ? "Welcome to the school administrative control room handbook. Learn how to map student curricula, verify cash reference keys, audit teacher logs, and synchronize offline states live online."
              : "Ku soo dhowow xarunta tababarka maamulka dugsiga. Halkan ka baro sida loo maamulo ardayda, xisaabaadka bangiyada, buundooyinka, iyo isku xidhka internetka ee Live-ka ah."}
          </p>
        </div>

        {/* Navigation Selector Pill Tabs */}
        <div className="bg-[#111318] p-1 border border-slate-850 rounded-xl flex items-center shadow-xs shrink-0 font-sans text-xs">
          <button
            onClick={() => setActiveManualTab('walkthrough')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeManualTab === 'walkthrough' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Video size={13} />
            {lang === 'EN' ? "Video Simulator" : "Simulatoorka Muuqaalka"}
          </button>
          <button
            onClick={() => setActiveManualTab('modules')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeManualTab === 'modules' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Terminal size={13} />
            {lang === 'EN' ? "Admin Playbook" : "Buugga Farsamada"}
          </button>
          <button
            onClick={() => setActiveManualTab('troubleshooting')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeManualTab === 'troubleshooting' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <HelpCircle size={13} />
            {lang === 'EN' ? "FAQ & Hand-off" : "Su'aalaha Macmiilka"}
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: INTERACTIVE SIMULATED VIDEO WALKTHROUGH */}
      {activeManualTab === 'walkthrough' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="manual_simulated_video_tab">
          
          {/* Video Player Display on left (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden aspect-video relative flex flex-col items-center justify-center group shadow-2xl">
              
              {/* Simulated Screen Overlay UI */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 z-20">
                <span className="flex items-center gap-1.5 uppercase bg-black/40 px-2 py-1 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  {lang === 'EN' ? `TUTORIAL ${selectedVideo + 1}` : `MUUQAALKA ${selectedVideo + 1}`}
                </span>
                <span className="bg-black/40 px-2 py-1 rounded">REC 4K STREAM</span>
              </div>

              {/* Video Graphics Overlay representing active video */}
              <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 bg-radial-to-t from-[#0d121c]/90 via-[#0a0b0e]/60 to-[#0a0b0e]/30">
                <div />
                <div className="space-y-2 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block font-sans">
                      {lang === 'EN' ? "Focus Academy Training Series" : "Dugsiga Focus Tababarada"}
                    </span>
                    <h3 className="text-lg font-display font-medium text-white tracking-tight">
                      {lang === 'EN' ? currentVid.titleEN : currentVid.titleSO}
                    </h3>
                    <p className="text-xs text-slate-350 max-w-lg leading-relaxed font-sans">
                      {lang === 'EN' ? currentVid.descriptionEN : currentVid.descriptionSO}
                    </p>
                  </div>

                  {/* Controls HUD */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-800/40">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-10 w-10 text-xs text-black bg-amber-500 hover:bg-amber-400 font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-amber-500/20 shrink-0"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                    
                    <div className="flex-1 space-y-1">
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
                        <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${playbackProgress}%` }}></div>
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-slate-550">
                        <span>{isPlaying ? "0:45" : "0:00"}</span>
                        <span>{currentVid.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background simulated software screen capture graphic */}
              <div className="absolute inset-0 opacity-15 grayscale select-none blur-xs flex items-center justify-center pointer-events-none">
                <div className="w-full h-full bg-[#111318] p-8 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="h-4 w-32 bg-slate-800 rounded"></div>
                    <div className="flex gap-1.5">
                      <div className="h-4 w-10 bg-slate-800 rounded"></div>
                      <div className="h-4 w-10 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 my-auto">
                    <div className="h-20 bg-slate-800 rounded-2xl"></div>
                    <div className="h-20 bg-slate-800 rounded-2xl"></div>
                    <div className="h-20 bg-slate-800 rounded-2xl"></div>
                  </div>
                  <div className="h-6 w-full bg-slate-800 rounded"></div>
                </div>
              </div>

            </div>

            {/* Video Subtitles & Transcript Steps */}
            <div className="bg-[#111318] border border-slate-850 p-5 rounded-2xl space-y-3.5 text-left font-sans">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={14} className="text-amber-500" />
                {lang === 'EN' ? "Workflow Step-By-Step Interactive Actions" : "Tallaabooyinka Casharka Hal-hal u Raac"}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 pl-1">
                {(lang === 'EN' ? currentVid.stepsEN : currentVid.stepsSO).map((step, index) => (
                  <li key={index} className="flex gap-2.5 items-start leading-relaxed">
                    <span className="h-5 w-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[10px] font-bold text-amber-500 shrink-0">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tutorial selection menu on right (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#111318] border border-slate-850 p-5.5 rounded-3xl space-y-4">
              <div className="space-y-1 text-left">
                <h4 className="font-display font-medium text-slate-100 text-sm">
                  {lang === 'EN' ? "Training Modules Playlist" : "Liiska Fiidiyowyada Casharka"}
                </h4>
                <p className="text-[11px] text-slate-450">
                  {lang === 'EN' ? "Choose a workflow video to initiate interactive tutorial" : "Dooro cutubka aad rabto inaad si faahfaahsan u barato"}
                </p>
              </div>

              <div className="space-y-2">
                {videoGuides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => {
                      setSelectedVideo(guide.id);
                      setIsPlaying(false);
                      setPlaybackProgress(guide.id === 0 ? 45 : 0);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border cursor-pointer transition-all flex items-center justify-between group ${
                      selectedVideo === guide.id
                        ? 'bg-amber-600/10 border-amber-600/30 shadow-lg shadow-amber-600/5'
                        : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className={`text-xs font-semibold ${selectedVideo === guide.id ? 'text-amber-500' : 'text-slate-300 group-hover:text-amber-500 transition-colors'}`}>
                        {lang === 'EN' ? guide.titleEN : guide.titleSO}
                      </div>
                      <div className="text-[10.5px] text-slate-450 leading-relaxed font-sans line-clamp-1 max-w-[280px]">
                        {lang === 'EN' ? guide.descriptionEN : guide.descriptionSO}
                      </div>
                    </div>
                    
                    <span className={`h-8 w-8 rounded-xl flex items-center justify-center border font-mono text-[10px] font-bold ${
                      selectedVideo === guide.id 
                        ? 'bg-amber-600 text-white border-amber-600/30' 
                        : 'bg-slate-900 text-slate-500 border-slate-800 group-hover:bg-slate-850 group-hover:text-slate-300 transition-all'
                    }`}>
                      {guide.duration}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Practical sandbox interactive checklist */}
            <div className="bg-[#111318] border border-slate-850 p-5.5 rounded-3xl space-y-4">
              <div className="space-y-1 text-left">
                <h4 className="font-display font-medium text-slate-100 text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-amber-500" />
                  {lang === 'EN' ? "Staff Training Checklist" : "Isku-dryidda oo Kooban (Practical)"}
                </h4>
                <p className="text-[11px] text-slate-450">
                  {lang === 'EN' ? "Simulate operating the app. Successfully master these features!" : "Tijaabi hawlahan kaddibna calamadee si aad u hubiso fahamkaaga."}
                </p>
              </div>

              <div className="space-y-2.5 font-sans">
                {[
                  { key: 'login', labelEN: "Log in with Principal Credentials", labelSO: "Ku soo gal magaca Principal-ka sSare" },
                  { key: 'viewDashboard', labelEN: "Audit total school finances graph in Dashboard", labelSO: "Eeg garaafka xisaabaadka ee Dashboard-ka" },
                  { key: 'addStudent', labelEN: "Register a new Student profile in School tab", labelSO: "Diiwaangeli arday cusub fasallada ku jira" },
                  { key: 'inputGrades', labelEN: "Enter 30% Continuous Assessment grades", labelSO: "Geli buundooyinka Qiimaynta Joogtada ah (30%)" },
                  { key: 'bursarLock', labelEN: "Unlock finance sheet with bursar passcode (8844)", labelSO: "Maaree lock-ka bursar-ka adoo isticmaalaya furaha (8844)" },
                  { key: 'cloudSync', labelEN: "Upload database copy online using Firebase", labelSO: "U rar xogta internetka adoo isticmaalaya Firebase" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCheck(item.key as any)}
                    className="w-full flex items-center gap-3 p-2.5 bg-slate-950/40 hover:bg-slate-950 border border-slate-850/60 rounded-xl cursor-pointer text-left transition-all"
                  >
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                      checklist[item.key as keyof typeof checklist]
                        ? 'bg-amber-600/20 border-amber-500 text-amber-500'
                        : 'border-slate-800 bg-slate-950 text-transparent'
                    }`}>
                      <CheckCircle2 size={13} className="stroke-[3]" />
                    </div>
                    <span className={`text-[11px] leading-none ${checklist[item.key as keyof typeof checklist] ? 'line-through text-slate-500' : 'text-slate-350'}`}>
                      {lang === 'EN' ? item.labelEN : item.labelSO}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER TAB 2: DETAILED ADMIN PLAYBOOK */}
      {activeManualTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left" id="manual_admin_playbook_tab">
          
          {/* Box 1: Student registration & Academics */}
          <div className="bg-[#111318] border border-slate-850 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <FileSpreadsheet size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-white">
                  {lang === 'EN' ? "1. Student Curricula & Registration" : "1. Diiwaangelinta & Maaraynta Waxbarashada"}
                </h4>
                <p className="text-[10px] text-slate-450 font-mono">MODULE_ACADEMICS_01</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {lang === 'EN'
                ? "This section details how to manage the fundamental school structure including academic years, semesters, teacher assignments, and classroom logs."
                : "Cutubkan wuxuu faahfaahinayaa maaraynta aasaasiga ah ee dugsiga, oo ay ku jiraan sannad-dugsiyeedka, simistarrada, macallimiinta iyo fasallada."}
            </p>

            <div className="space-y-2 font-sans text-xs bg-slate-950 p-4 rounded-2xl border border-slate-850/60 text-slate-350">
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Add Classrooms:</strong> Create Grade levels (Grades 1-12) and map custom study sections (e.g., A, B, C).</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Ministry Rules:</strong> Calculated letter grades (A, B, C, D, F) strictly follow standard grade distribution profiles.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Student Portals:</strong> Students sign in securely using their distinct unique Student Access Code (e.g. 1001, 1002).</p>
              </div>
            </div>
          </div>

          {/* Box 2: Secure Ledger & Bank Reference approvals */}
          <div className="bg-[#111318] border border-slate-850 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-white">
                  {lang === 'EN' ? "2. Secure Financial Billing Ledger" : "2. Nidaamka Lacag Bixinta ee Dhijitaalka ah"}
                </h4>
                <p className="text-[10px] text-slate-450 font-mono">MODULE_FINANCE_02</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {lang === 'EN'
                ? "Provides high-grade verification checks for school accounts. Restricts the student portal interface once payment blocks are active."
                : "Wuxuu xaqiijiyaa lacagaha dugsiga soo gala ee bangiyada. Waxaa lagu xidhi karaa nidaamka si looga ilaaliyo khaladaadka."}
            </p>

            <div className="space-y-2 font-sans text-xs bg-slate-950 p-4 rounded-2xl border border-slate-850/60 text-slate-350">
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Bursar Passcode:</strong> Standard initial lock is active with code <code>8844</code> inside Master Admin Tab.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Generate Invoices:</strong> Create billing profiles indicating due dates, paid balances, and payment methods.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Bank Reference Keys:</strong> Match payment reference logs directly with CBE, Telebirr, and Awash transactions.</p>
              </div>
            </div>
          </div>

          {/* Box 3: Remote Cloud backup & deployment */}
          <div className="bg-[#111318] border border-slate-850 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Cloud size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-white">
                  {lang === 'EN' ? "3. Bi-directional Remote Cloud Backup" : "3. Isku-xidhka iyo Backup-ka Google Cloud"}
                </h4>
                <p className="text-[10px] text-slate-450 font-mono">MODULE_CLOUD_03</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {lang === 'EN'
                ? "Guarantees ultimate data durability. Connecting Firebase migrates your offline data into the cloud, completely free of charge!"
                : "Wuxuu xaqiijiyaa badbaadada xogta iyadoo loo rrayo Google Firebase. Waa hab gebi ahaanba bilaash ah oo degdeg ah."}
            </p>

            <div className="space-y-2 font-sans text-xs bg-slate-950 p-4 rounded-2xl border border-slate-850/60 text-slate-350">
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Zero Operations Cost:</strong> Schools can use their own Free Google Firebase Console account permanently.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Bi-directional Sync:</strong> 'Push' hosts local memory online, 'Pull' instantly retrieves database on any new device.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Auto Sanitize:</strong> Cloud operations sanitize IDs dynamically to comply with Google database key constraints.</p>
              </div>
            </div>
          </div>

          {/* Box 4: Security Auditor */}
          <div className="bg-[#111318] border border-slate-850 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-white">
                  {lang === 'EN' ? "4. Auditing Logs & Data Preservation" : "4. Raad-raaca Dhaqdhaqaaqa iyo Nabadgelyada"}
                </h4>
                <p className="text-[10px] text-slate-450 font-mono">MODULE_AUDIT_04</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {lang === 'EN'
                ? "Keeps a perfect chronological ledger of critical administrative actions. Prevents ghost payments and unauthorized grade edits."
                : "Wuxuu xafidayaa fIil kasta oo hawl-kar ah si looga hortago wax-is-dabamarin ama bedelaada dhibcaha fasalka iyadoon la ogayn."}
            </p>

            <div className="space-y-2 font-sans text-xs bg-slate-950 p-4 rounded-2xl border border-slate-850/60 text-slate-350">
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Un-editable Audit Logs:</strong> Access live administrative actions (login, grading, finance edits) from Master Admin tab.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Custom PDF Marks:</strong> Instantly export filtered lists or academic scoresheets directly to printable documents.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <p><strong>Preservation Mode:</strong> Replaces local sandbox lists automatically with secure system states for live operations.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* RENDER TAB 3: CUSTOMER HAND-OFF FAQ */}
      {activeManualTab === 'troubleshooting' && (
        <div className="bg-[#111318] border border-slate-850 p-6 rounded-3xl space-y-6 text-left" id="manual_handoff_tabs">
          <div className="space-y-1">
            <h4 className="font-display font-medium text-slate-100 text-sm flex items-center gap-2">
              <UserCheck size={16} className="text-amber-500" />
              {lang === 'EN' ? "School Owner & Client Hand-off Guidelines" : "Hagaha Wareejinta Macmiilka (Focus System hand-off)"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {lang === 'EN'
                ? "This playbook is prepared to help you easily deliver this software product to school principals, regional school boards, or administrative partners. Use these guidelines for high trust and perfect delivery."
                : "Hagahan waxaa loogu talagalay inuu kaa caawiyo sida ku wareejin karto nidaamka maamulaha iskuulka ama guddiga waxbarashada dalka si aad u kasbato kalsoonidooda buuxda."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs text-slate-350 leading-relaxed">
            
            <div className="space-y-3">
              <h5 className="font-black text-white text-[11px] uppercase tracking-wider text-slate-205 border-b border-slate-800 pb-2">
                📋 Frequently Asked Questions (Somali & English)
              </h5>
              
              <div className="space-y-2">
                <p className="text-slate-200 font-bold">Q: Sidee fasax u dhiibaa xisaabiye cusub (New Cashier)?</p>
                <p className="text-slate-400 pl-3 border-l border-slate-850">
                  Aad Master Admin &rarr; Fee Security &rarr; beddel magaca Bursar-ka iyo furaha qarsoon (passcode). Sii xisaabiyaha dhowrkaas nambarka ee custom-ka ah si ay u galaan qaybta Finance-ka oo kaliya iyaga oo aan beddeli karin xogta kale ee maamulayaasha.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-slate-200 font-bold">Q: How do we generate custom student transcript certificates?</p>
                <p className="text-slate-400 pl-3 border-l border-slate-850">
                  Navigate to the <strong>Reports Center</strong>, search for the student name, and select <strong>Student Certificate</strong>. The system pulls and structures all information automatically into an elegant Ministry standard printable PDF certificate.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-slate-200 font-bold">Q: Ma xog weyn oo arday badan ah ayaan geli karaa hal mar?</p>
                <p className="text-slate-400 pl-3 border-l border-slate-850">
                  Haa! Aad Master Admin &rarr; Data Migration &amp; Import. Waxaad si toos ah uga rran kartaa computer-kaaga fIil Excel ah adoo isticmaalaya Intelligent Parser-kayaga kaas oo si otomaatig ah u sawira magacyada, koodhka, fasallada iyo qoraalada kale oo dhan hal daqiiqo gudaheed.
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-850 pb-6">
              <h5 className="font-black text-white text-[11px] uppercase tracking-wider text-amber-500">
                ⭐ Premium Whitelabel Handoff Strategy
              </h5>
              <div className="space-y-3.5">
                <p className="text-[11px] text-slate-400">
                  To present this system successfully as your own proprietary premium software product without references to automated building cycles:
                </p>
                
                <ol className="list-decimal list-inside pl-1 space-y-2.5 text-slate-350">
                  <li>
                    <strong>Custom Brand</strong>: Update the school profile name, address, and logo text in the **School Profile** tab to match the client's localized identity (e.g., Hope Academy, Mogadishu).
                  </li>
                  <li>
                    <strong>Secure Passcodes</strong>: Navigate to **Admin Center** and immediately change the system Admin credentials and Bursar passcodes before handing over the controls.
                  </li>
                  <li>
                    <strong>Configure Firestore Sync</strong>: Help your client set up their free Firebase account, paste the configuration credentials inside raw JSON input, and perform the first **Push Sync** to initialize their live student database copy. This guarantees they will never lose database states.
                  </li>
                  <li>
                    <strong>No Demo Shortcuts</strong>: The demo shortcut panels have been fully removed from the production layout, ensuring a secure, professional, custom login screen tailored exclusively for real school operations.
                  </li>
                </ol>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Friendly handoff signature */}
      <div className="flex items-center justify-between border-t border-slate-850 pt-5 text-[10px] text-slate-500 font-mono">
        <span>© FOCUS ACADEMY OPERATIONS CORE SYSTEM</span>
        <span>VERSION 4.2.1-SECURE</span>
      </div>

    </div>
  );
}
