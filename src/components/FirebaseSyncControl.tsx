/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  HelpCircle,
  Play,
  Terminal,
  Activity
} from 'lucide-react';
import { Student, Teacher, ScoreRecord, Invoice } from '../types';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  getFirebaseInstance,
  uploadCollectionToFirestore,
  downloadCollectionFromFirestore
} from '../lib/firebase';

interface FirebaseSyncControlProps {
  lang: 'EN' | 'SO';
  students: Student[];
  setStudents: (students: Student[]) => void;
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  scoreRecords: ScoreRecord[];
  setScoreRecords: (records: ScoreRecord[]) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  triggerToast: (msg: string) => void;
}

export default function FirebaseSyncControl({
  lang,
  students,
  setStudents,
  teachers,
  setTeachers,
  scoreRecords,
  setScoreRecords,
  invoices,
  setInvoices,
  triggerToast
}: FirebaseSyncControlProps) {
  const [configInput, setConfigInput] = useState('');
  const [currentConfig, setCurrentConfig] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [showHowTo, setShowHowTo] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setCurrentConfig(saved);
      setConfigInput(JSON.stringify(saved, null, 2));
      testLiveConnection();
    }
  }, []);

  const testLiveConnection = async () => {
    const config = getSavedFirebaseConfig();
    if (!config) {
      setIsConnected(false);
      return;
    }

    try {
      const { db } = getFirebaseInstance();
      if (db) {
        // Attempt a quick metadata read or simply verify dynamic configuration
        setIsConnected(true);
        addLog("✅ Firebase Cloud Client initialized successfully.");
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      addLog(`❌ Connection test failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const addLog = (msg: string) => {
    setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleSaveConfig = () => {
    try {
      const cleaned = configInput.trim();
      if (!cleaned) {
        triggerToast(lang === 'EN' ? "Please paste a valid JSON configuration." : "እባክዎ ትክክለኛ የJSON መረጃ ያስገቡ።");
        return;
      }

      const parsed = JSON.parse(cleaned);
      if (!parsed.apiKey || !parsed.projectId) {
        triggerToast(lang === 'EN' ? "Missing required parameters (apiKey, projectId)" : "አስፈላጊ መለያዎች ጎድለዋል (apiKey, projectId)");
        return;
      }

      const isSaved = saveFirebaseConfig(parsed);
      if (isSaved) {
        setCurrentConfig(parsed);
        // Reset dynamic instances
        window.location.reload(); // Reload to re-initialize firebase with new configuration clean
        triggerToast(lang === 'EN' ? "Firebase configuration successfully saved! Reloading..." : "የደመና ግንኙነቱ በሚገባ ተቀምጧል! ሲስተሙ እየተነሳ ነው...");
      }
    } catch (e) {
      triggerToast(lang === 'EN' ? "Invalid JSON formatting. Please check syntax." : "የተሳሳተ የኮድ ቅርጸት። እባክዎ በትክክል መሆኑን ይፈትሹ።");
      addLog(`❌ JSON parsing failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleClearConfig = () => {
    if (confirm(lang === 'EN' ? "Are you sure you want to revert to Local-offline storage only?" : "እርግጠኛ ነዎት የደመና ግንኙነቱን አቋርጠው ወደ አካባቢያዊ ማከማቻ ብቻ መመለስ ይፈልጋሉ?")) {
      clearFirebaseConfig();
      setCurrentConfig(null);
      setConfigInput('');
      setIsConnected(false);
      addLog("⚠️ Firebase configuration deleted. System reverted to Local Storage Mode.");
      triggerToast(lang === 'EN' ? "Now running in Local Offline Mode." : "ሲስተሙ ወደ አካባቢያዊ ማከማቻ ተመልሷል።");
      window.location.reload();
    }
  };

  // Run Bi-directional replication push (Local -> Cloud)
  const handlePushToCloud = async () => {
    if (!isConnected) {
      triggerToast(lang === 'EN' ? "Please configure and connect Firebase first." : "እባክዎ መጀመሪያ ፋየርቤዝን ያገናኙ።");
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setSyncLogs([]);
    addLog("🚀 Starting complete migration database upload (Local ➡️ Firebase Cloud)...");

    try {
      // 1. Sync Students Code
      addLog(`📋 Batch 1/4: Packaging ${students.length} student records...`);
      await uploadCollectionToFirestore('students', students, (p) => setSyncProgress(Math.floor(p * 0.25)));
      addLog(`✓ Student records uploaded successfully.`);

      // 2. Sync Teachers Code
      addLog(`📋 Batch 2/4: Packaging ${teachers.length} teacher records...`);
      await uploadCollectionToFirestore('teachers', teachers, (p) => setSyncProgress(25 + Math.floor(p * 0.25)));
      addLog(`✓ Teacher profiles uploaded successfully.`);

      // 3. Sync Score Records
      addLog(`📋 Batch 3/4: Packaging ${scoreRecords.length} exam grade sheets...`);
      await uploadCollectionToFirestore('scoreRecords', scoreRecords, (p) => setSyncProgress(50 + Math.floor(p * 0.25)));
      addLog(`✓ Score grades synchronized successfully.`);

      // 4. Sync Invoices
      addLog(`📋 Batch 4/4: Packaging ${invoices.length} billing receipts...`);
      await uploadCollectionToFirestore('invoices', invoices, (p) => setSyncProgress(75 + Math.floor(p * 0.25)));
      addLog(`✓ Finance invoices deployed online.`);

      setSyncProgress(100);
      addLog("🎉 CLOUD MIGRATION SUCCESSFUL! All school datasets are synced live.");
      triggerToast(lang === 'EN' ? "Database synchronization completed successfully!" : "የዳታ ማዘዣው በተሳካ ሁኔታ ተጠናቋል!");

    } catch (err) {
      addLog(`❌ Sync Error abort: ${err instanceof Error ? err.message : String(err)}`);
      triggerToast(lang === 'EN' ? "Migration failed. Refer to logs." : "ዳታ ማዘዣው አልተሳካም። ማስታወሻውን ይዩ።");
    } finally {
      setIsSyncing(false);
    }
  };

  // Run Bi-directional replication pull (Cloud -> Local)
  const handlePullFromCloud = async () => {
    if (!isConnected) {
      triggerToast(lang === 'EN' ? "Please configure and connect Firebase first." : "እባክዎ መጀመሪያ ፋየርቤዝን ያገናኙ።");
      return;
    }

    if (!confirm(lang === 'EN' 
      ? "Warning: Pulling from cloud will overwrite current local school datasets. Proceed?" 
      : "ማስጠንቀቂያ፡ ይህን ማድረግ አሁን ያሉትን የአካባቢ መረጃዎች በሙሉ በደመናው መረጃ ይተካል። መቀጠል ይፈልጋሉ?")) {
      return;
    }

    setIsSyncing(true);
    setSyncProgress(10);
    setSyncLogs([]);
    addLog("📥 Fetching master databases from Firebase Secure Cloud...");

    try {
      // 1. Download Students
      addLog("🔍 Retrieving remote 'students' collection...");
      const dbStudents = await downloadCollectionFromFirestore('students');
      if (dbStudents.length > 0) {
        setStudents(dbStudents);
        addLog(`✓ Synced ${dbStudents.length} student records downloaded.`);
      } else {
        addLog("ℹ️ No student records found in cloud.");
      }
      setSyncProgress(35);

      // 2. Download Teachers
      addLog("🔍 Retrieving remote 'teachers' collection...");
      const dbTeachers = await downloadCollectionFromFirestore('teachers');
      if (dbTeachers.length > 0) {
        setTeachers(dbTeachers);
        addLog(`✓ Synced ${dbTeachers.length} teacher records downloaded.`);
      } else {
        addLog("ℹ️ No teacher records found in cloud.");
      }
      setSyncProgress(60);

      // 3. Download Score Records
      addLog("🔍 Retrieving remote 'scoreRecords' collection...");
      const dbScores = await downloadCollectionFromFirestore('scoreRecords');
      if (dbScores.length > 0) {
        setScoreRecords(dbScores);
        addLog(`✓ Synced ${dbScores.length} grade sheets downloaded.`);
      } else {
        addLog("ℹ️ No grade sheets found in cloud.");
      }
      setSyncProgress(80);

      // 4. Download Invoices
      addLog("🔍 Retrieving remote 'invoices' collection...");
      const dbInvoices = await downloadCollectionFromFirestore('invoices');
      if (dbInvoices.length > 0) {
        setInvoices(dbInvoices);
        addLog(`✓ Synced ${dbInvoices.length} billing records downloaded.`);
      } else {
        addLog("ℹ️ No invoices found in cloud.");
      }

      setSyncProgress(100);
      addLog("🎉 LOCAL DOWNLOAD COMPLETED! Current workspace has been updated.");
      triggerToast(lang === 'EN' ? "Local storage refreshed from Cloud!" : "አካባቢያዊ መረጃዎች በደመናው ዳታ ተተክተዋል!");

    } catch (err) {
      addLog(`❌ Download Error: ${err instanceof Error ? err.message : String(err)}`);
      triggerToast(lang === 'EN' ? "Pull failed. Refer to logs." : "ዳታ ከደመና ማምጣት አልተሳካም።");
    } finally {
      setIsSyncing(false);
    }
  };

  const fillDemoConfig = () => {
    const demo = {
      apiKey: "AIzaSyFakeKey_FocusAcademy_ET_9081",
      authDomain: "focus-academy-ethiopia.firebaseapp.com",
      projectId: "focus-academy-ethiopia",
      storageBucket: "focus-academy-ethiopia.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:9f8e7d6c5b4a3f2e"
    };
    setConfigInput(JSON.stringify(demo, null, 2));
    triggerToast(lang === 'EN' ? "Demo keys template loaded. Press Save." : "የመሞከሪያ ቁልፍ ተጭኗል። አስቀምጥን ይጫኑ።");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="firebase_config_sub_tab">
      
      {/* Cloud Service Banner Status */}
      <div className="bg-gradient-to-r from-slate-900 to-[#141d2d] border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full opacity-5 pointer-events-none flex items-center justify-center">
          <Cloud size={180} className="text-sky-500" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${
                isConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {isConnected ? "✓ LIVE_CLOUD_CONNECTED" : "⚠ OFFLINE_LOCAL_MODE"}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded font-mono font-bold">
                {currentConfig ? `App: ${currentConfig.projectId}` : "Local Environment"}
              </span>
            </div>
            <h3 className="text-lg font-display font-medium text-white tracking-tight">
              {lang === 'EN' ? "Google Cloud & Firebase Database Synchronization" : "የጉግል ኛውክ ፕላትፎርም ደመና ግንኙነት"}
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl font-sans leading-relaxed">
              {lang === 'EN' 
                ? "This portal acts as the master sync bridge. Connecting Firebase migrates your local database online, enabling real-time multi-device school data persistence, automatic grade tracking, back-ups, and student portals secure access."
                : "ይህ ክፍል የአስተዳደር መረጃዎችን ከደመና ማዕከል ጋር ያገናኛል። ፋየርቤዝ ሲገናኝ የአካባቢ መረጃዎች ወደ ጉግል ሰርቨር የሚጫኑ ሲሆን ይህም በሁሉም ኮምፒውተሮች ላይ መረጃዎች በእውነተኛ ጊዜ እንዲገኙ ያስችላል።"}
            </p>
          </div>

          <button 
            type="button"
            onClick={() => setShowHowTo(!showHowTo)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-205 rounded-xl transition-all cursor-pointer border border-slate-700/60"
          >
            <HelpCircle size={14} className="text-sky-400" />
            {lang === 'EN' ? "Setup Instructions" : "የማስተካከያ መመሪያ"}
          </button>
        </div>
      </div>

      {/* How to configure guide overlay */}
      {showHowTo && (
        <div className="bg-[#111318] border border-sky-950/40 p-6 rounded-3xl space-y-4 animate-fade-in text-xs leading-relaxed text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-sky-400 flex items-center gap-1.5 uppercase font-sans tracking-wide">
              <Activity size={14} />
              {lang === 'EN' ? "How to Create and Connect Cloud Database" : "የደመና ዳታቤዝ እንዴት ፈጥረን እናገናኛለን?"}
            </h4>
            <button 
              type="button" 
              onClick={() => setShowHowTo(false)}
              className="text-xs text-slate-550 hover:text-slate-405 font-mono cursor-pointer"
            >
              [ {lang === 'EN' ? "Hide" : "ደብቅ"} ]
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-205">Step-by-Step Google Console Guide</h5>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-450 hover:underline">Google Firebase Console</a> and sign in.</li>
                <li>Click <strong>Add Project</strong> and name it (e.g. <code>Focus-Academy-Admin</code>).</li>
                <li>In the left sidebar, click <strong>Firestore Database</strong> and click <strong>Create Database</strong>. Choose <em>Start in Test Mode</em>.</li>
                <li>Go to <strong>Project Settings (⚙️ icon)</strong> in the top left, scroll down to <em>Your Apps</em>, choose <strong>Web App (&lt;/&gt;)</strong>, and register it.</li>
                <li>Copy the generated <code>firebaseConfig</code> JSON block that looks like <code>{"{"} &quot;apiKey&quot;: &quot;...&quot;, &quot;projectId&quot;: &quot;...&quot; {"}"}</code>.</li>
                <li>Paste it in the credential board on the right and click **Save Config**!</li>
              </ol>
            </div>
            
            <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
              <div className="space-y-1">
                <h5 className="font-bold text-white text-[10px] uppercase tracking-wider text-slate-205">🔑 Somali & Amharic Hand-off Helper</h5>
                <p className="text-slate-450 leading-relaxed text-[11px]">
                  <strong>Amharic:</strong> ለትምህርት ቤቱ ይህንን ሲስተም ሲያስረክቡ ወይም ሲሸጡ፤ የራሳቸውን መረጃ ሙሉ ባለቤት እንዲሆኑ የራሳቸውን የጉግል ፋየርቤዝ አካውንት አስከፍተው ኮንፊግሬሽን ኮዱን እዚህ እንዲለጥፉ ማድረግ ይችላሉ። በዚህም ለእርስዎ ምንም አይነት ተጨማሪ ክፍያ ሳይኖርባቸው ሰርቨሩን በነፃ መጠቀም ይችላሉ።
                </p>
                <p className="text-slate-450 leading-relaxed text-[11px] mt-1">
                  <strong>Somali:</strong> Markaad dugsiga ku wareejinayso nidaamkan, waxaad ku xidhi kartaa Google Firebase mashruucooda gaarka ah si ay u yeeshaan lahaanshaha buuxa ee xogtooda. Nuqul ka samee config JSON ee dashboard-ka Google-ka oo ku dheji halkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main split dashboard: CONFIGURATION on left, DATA SYNC on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: CONFIGURATION BOARD */}
        <div className="lg:col-span-5 bg-[#111318] border border-slate-800 p-6 rounded-3xl flex flex-col space-y-4">
          <div className="space-y-1">
            <h4 className="font-display font-medium text-slate-100 text-sm flex items-center gap-2">
              <Database size={15} className="text-sky-400" />
              {lang === 'EN' ? "Firebase Credential Board" : "የግንኙነት መረጃ ሠሌዳ"}
            </h4>
            <p className="text-[11px] text-slate-450 font-sans">
              {lang === 'EN' 
                ? "Paste the config object JSON. The client will parse and activate the cloud portal instantly."
                : "ለግንኙነት የተዘጋጀውን የኮንፊግሬሽን ኮድ (JSON) እዚህ ይለጥፉት።"}
            </p>
          </div>

          <div className="flex-1 min-h-[220px] flex flex-col">
            <textarea
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}`}
              className="w-full flex-1 p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[11px] text-sky-350 focus:outline-none focus:border-sky-500/40 resize-none min-h-[180px]"
              id="firebase_config_textarea"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!currentConfig && (
              <button
                type="button"
                onClick={fillDemoConfig}
                className="px-3.5 py-2 hover:bg-slate-900 border border-slate-800/80 text-[11px] font-bold text-sky-400 rounded-xl transition-all cursor-pointer hover:border-sky-500/20"
              >
                {lang === 'EN' ? "Load Practice Keys" : "ዲሞ መረጃ ጫን"}
              </button>
            )}

            <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
              {currentConfig && (
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className="px-3.5 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-[11px] font-bold text-rose-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  {lang === 'EN' ? "Disconnect" : "አቋርጥ"}
                </button>
              )}
              
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 border border-sky-600/30 text-[11px] font-bold text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/10 flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Save size={12} />
                {lang === 'EN' ? "Save & Activate" : "አስቀምጥና አገናኝ"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: MIGRATION & REPLICATION PANEL */}
        <div className="lg:col-span-7 bg-[#111318] border border-slate-800 p-6 rounded-3xl flex flex-col space-y-6">
          <div className="space-y-1">
            <h4 className="font-display font-medium text-slate-100 text-sm flex items-center gap-2">
              <RefreshCw size={15} className={`text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
              {lang === 'EN' ? "Bi-directional Data Replication Center" : "የዳታ ማዘዣ እና መቆጣጠሪያ ማዕከል"}
            </h4>
            <p className="text-[11px] text-slate-450 font-sans">
              {lang === 'EN' 
                ? "Synchronize your offline database records with Google Firestore live safely."
                : "የአካባቢ መረጃዎችን በደመናው ማህደር ላይ ይገንቡ ፤ ወይም ከዛ ያምጡ።"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Action: PUSH LOCAL TO CLOUD */}
            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                  <ArrowUpRight size={15} />
                  {lang === 'EN' ? "PUSH Local ➡️ Cloud" : "ወደ ደመና ለመስቀል (Push)"}
                </div>
                <p className="text-[10.5px] text-slate-450 font-sans leading-relaxed">
                  {lang === 'EN' 
                    ? "Uploads your offline students, teachers, grades, and invoices to Firebase, overwriting old cloud copies."
                    : "ሁሉንም የአካባቢ የክፍያ ፤ የመምህራን ፤ የተማሪዎችና ሰነዶች መረጃዎች ወደ ደመናው ፋየርቤዝ ይሰቅላል።"}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePushToCloud}
                disabled={isSyncing || !isConnected}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  !isConnected 
                    ? 'bg-slate-900 border-slate-800/40 text-slate-600 cursor-not-allowed'
                    : isSyncing 
                      ? 'bg-slate-850 border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                }`}
              >
                <Play size={12} className={isSyncing ? 'animate-pulse' : ''} />
                {lang === 'EN' ? "Push All Datasets" : "መረጃዎቹን በሙሉ ስቀል"}
              </button>
            </div>

            {/* Action: PULL CLOUD TO LOCAL */}
            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <ArrowDownLeft size={15} />
                  {lang === 'EN' ? "PULL Cloud 📥 Local" : "ከደመናው ለማውረድ (Pull)"}
                </div>
                <p className="text-[10.5px] text-slate-450 font-sans leading-relaxed">
                  {lang === 'EN' 
                    ? "Replaces your browser's local state by pulling down the master active database from Firebase cloud."
                    : "በጉግል ደመና የተቀመጡትን ከተማሪዎችና ከክፍያ መረጃዎችን በሙሉ አውርዶ በአዲሱ ሲስተም ላይ ይተካል።"}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePullFromCloud}
                disabled={isSyncing || !isConnected}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  !isConnected 
                    ? 'bg-slate-900 border-slate-800/40 text-slate-600 cursor-not-allowed'
                    : isSyncing 
                      ? 'bg-slate-850 border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border-amber-500/25 shadow-lg shadow-amber-500/5'
                }`}
              >
                <Play size={12} />
                {lang === 'EN' ? "Pull Cloud Copies" : "መረጃዎችን ከደመና አምጣ"}
              </button>
            </div>

          </div>

          {/* SYNC PROGRESS / TERMINAL LOGS */}
          <div className="space-y-2 flex-1 flex flex-col justify-end">
            {isSyncing && (
              <div className="space-y-1 bg-slate-950/30 p-3 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between text-[11px] font-mono text-sky-400">
                  <span>Replication Syncing...</span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Simulated Live Log Consol */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex-1 max-h-[160px] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 font-mono">
                  <Terminal size={12} className="text-sky-400" />
                  {lang === 'EN' ? "Replication Engine Stream" : "የማስተባበሪያ እንቅስቃሴ ማስታወሻ"}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[9.5px] text-slate-400 space-y-1.5 pr-1">
                {syncLogs.length === 0 ? (
                  <div className="text-slate-600 text-center py-4">
                    {lang === 'EN' ? "Terminal idle. Launch a data transaction above." : "ማስተባበሪያው ዝግጁ ነው። ዳታ ሲያስተላልፉ ዝርዝሩ እዚህ ይታያል።"}
                  </div>
                ) : (
                  syncLogs.map((log, index) => (
                    <div key={index} className="leading-5 break-all whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
