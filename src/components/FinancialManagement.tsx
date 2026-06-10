/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Invoice, FeeStructure, Student } from '../types';
import { AppTranslations } from '../translations';
import { initialFeeStructures } from '../data';
import { 
  CircleDollarSign, 
  Receipt, 
  TrendingUp, 
  Wallet, 
  Plus, 
  Printer, 
  Check, 
  Smartphone, 
  HandCoins,
  ArrowUpRight,
  Lock,
  Unlock
} from 'lucide-react';

interface FinancialManagementProps {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  students: Student[];
  t: AppTranslations;
  lang: 'EN' | 'SO';
  bursarPasscode: string;
  bursarName: string;
  isFinanceLocked: boolean;
}

export default function FinancialManagement({
  invoices,
  setInvoices,
  students,
  t,
  lang,
  bursarPasscode,
  bursarName,
  isFinanceLocked
}: FinancialManagementProps) {
  const [activeFinanceTab, setActiveFinanceTab] = useState<'Structure' | 'Ledger' | 'Reports'>('Ledger');
  
  // Bursar/Manager passcode states
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [pinError, setPinError] = useState("");
  const activeBursarName = bursarName;

  if (isFinanceLocked) {
    return (
      <div className="max-w-2xl mx-auto bg-[#111318] p-8 rounded-2xl border border-red-900/30 text-center space-y-6 mt-10 animate-fade-in font-sans">
        <div className="mx-auto w-16 h-16 bg-red-950/20 border border-red-950/30 rounded-2xl flex items-center justify-center text-red-500">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] bg-red-550/10 border border-red-500/20 text-red-500 font-extrabold tracking-widest uppercase px-2.5 py-1 rounded inline-block font-mono">
            {lang === 'EN' ? "FINANCE PORTAL SUSPENDED" : "የክፍያ ሒሳብ ማዕከል ታግዷል"}
          </span>
          <h2 className="font-display font-bold text-slate-100 text-lg">
            {lang === 'EN' ? "Bursar Access Temporarily Restructured" : "የበጀት ማስተላለፊያው በጊዜያዊነት ተቆልፏል"}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {lang === 'EN'
              ? "All active monetary transactions, ledger operations, and invoice payments have been suspended by the school General Director for system auditing. Please contact the Principal's office for the authorization release code."
              : "ሁሉም የክፍያ መረጃዎች እና የባንክ ደረሰኝ ምዝገባዎች በትምህርት ቤቱ የበላይ ኃላፊ ውሳኔ በጊዜያዊነት ታግደዋል። እባክዎ ለበለጠ መረጃ የዋና አስተዳዳሪውን ቢሮ ያነጋግሩ።"}
          </p>
        </div>
        <div className="text-[11px] text-slate-650 font-mono">
          SYSTEM_ID: SECURE_FIN_GATEWAY_v1.0
        </div>
      </div>
    );
  }

  // Payment recording state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'Telebirr' | 'CBE Birr' | 'Awash Bank Transfer' | 'Commercial Bank of Ethiopia (CBE)' | 'Cash'>('Telebirr');
  const [payRef, setPayRef] = useState("");

  // Receipt printable preview trigger
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);

  // New billing trigger
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [billStudentId, setBillStudentId] = useState("");
  const [billFeeType, setBillFeeType] = useState("Tuition Fee");
  const [billAmount, setBillAmount] = useState<number>(4500);

  // Stats Calculations
  const expectedTotal = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const collectedTotal = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const balanceOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
  const collectionRate = expectedTotal > 0 ? (collectedTotal / expectedTotal) * 100 : 100;

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balance);
    setPayRef(`TX-${Math.floor(Math.random() * 900000) + 100000}`);
    setShowPayModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    const updated = invoices.map(inv => {
      if (inv.id === selectedInvoice.id) {
        const nextPaid = inv.paidAmount + Number(payAmount);
        const nextBal = inv.amount - nextPaid;
        let nextStatus: 'Paid' | 'Partially Paid' | 'Unpaid' = 'Unpaid';
        if (nextBal <= 0) {
          nextStatus = 'Paid';
        } else if (nextPaid > 0) {
          nextStatus = 'Partially Paid';
        }

        const newReceipt: any = {
          receiptId: `REC-2026-${Math.floor(Math.random() * 8000) + 1000}`,
          date: new Date().toISOString().split('T')[0],
          amountPaid: Number(payAmount),
          paymentMethod: payMethod,
          referenceNo: payRef || `CBE-${Math.floor(Math.random() * 90000) + 10000}`
        };

        return {
          ...inv,
          paidAmount: nextPaid,
          balance: Math.max(0, nextBal),
          status: nextStatus,
          paymentHistory: [...inv.paymentHistory, newReceipt]
        };
      }
      return inv;
    });

    setInvoices(updated);
    setShowPayModal(false);
    setSelectedInvoice(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billStudentId) return;

    const std = students.find(s => s.id === billStudentId);
    if (!std) return;

    const newInv: Invoice = {
      id: `INV-2026-${Math.floor(Math.random() * 800) + 100}`,
      studentId: billStudentId,
      studentName: std.name,
      grade: std.grade,
      section: std.section,
      feeType: billFeeType,
      amount: Number(billAmount),
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paidAmount: 0,
      balance: Number(billAmount),
      status: 'Unpaid',
      paymentHistory: []
    };

    setInvoices([newInv, ...invoices]);
    setShowAddInvoice(false);
    setBillStudentId("");
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Tabs selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 self-start max-w-sm">
        {[
          { id: 'Ledger', label: t.paymentTracking, icon: <Wallet size={15} /> },
          { id: 'Structure', label: t.feeStructure, icon: <CircleDollarSign size={15} /> },
          { id: 'Reports', label: lang === 'EN' ? "Financial Overview" : "የበጀት መግለጫ", icon: <TrendingUp size={15} /> }
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => { setActiveFinanceTab(sub.id as any); setSelectedReceipt(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFinanceTab === sub.id 
                ? 'bg-white text-indigo-700 shadow-sm font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {sub.icon}
            {sub.label}
          </button>
        ))}
      </div>

      {!isAuthorized ? (() => {
        const handleNumPress = (num: string) => {
          setPinError("");
          if (pinCode.length < 4) {
            const next = pinCode + num;
            setPinCode(next);
            if (next === bursarPasscode) {
              setIsAuthorized(true);
              setPinCode("");
              setPinError("");
            } else if (next.length === 4) {
              setPinError(lang === 'EN' ? `Incorrect Passcode! Hint: ${bursarPasscode}` : `Koodhka sirta ah waa khaldan yahay! Tixraac: ${bursarPasscode}`);
              setPinCode("");
            }
          }
        };

        const handleClear = () => {
          setPinCode("");
          setPinError("");
        };

        return (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-150 shadow-xs space-y-6 text-center mt-10 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-700 relative">
              <Lock size={28} className="text-slate-700" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold tracking-widest uppercase px-2.5 py-1 rounded inline-block font-mono">
                {lang === 'EN' ? "REGISTRAR SECURE LEDGER" : "የክፍያ ማስተዳደሪያ ደብተር"}
              </span>
              <h2 className="font-display font-bold text-slate-800 text-lg">{lang === 'EN' ? "Bursar Authorization Needed" : "የትምህርት ቤት ክፍያ ፈቃድ ኮድ ሁኔታ"}</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {lang === 'EN' 
                  ? "Bursar passcode authentication is required to access cash ledger files, record mobile payments, or update invoice statements." 
                  : "የተማሪዎችን ክፍያ ለመመዝገብ፣ አዳዲስ ደረሰኞችን ለማተም ወይም የበጀት ሰነዶችን ለመክፈት የፋይናንስ አስተዳዳሪ ኮድ ማስገባት ግዴታ ነው።"}
              </p>
            </div>

            {/* Pin dots */}
            <div className="flex justify-center gap-4 py-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    idx < pinCode.length 
                      ? 'bg-slate-850 border-slate-850 scale-110 shadow-xs' 
                      : 'bg-white border-slate-200'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-red-500 font-semibold animate-pulse">{pinError}</p>
            )}

            {/* PIN Pad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumPress(num)}
                  className="h-12 w-full flex items-center justify-center text-slate-700 hover:text-slate-900 bg-slate-50 active:bg-slate-100 border border-slate-100 font-mono font-bold text-base rounded-xl transition-all cursor-pointer hover:shadow-2xs active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase p-2 flex items-center justify-center cursor-pointer font-sans"
              >
                {lang === 'EN' ? "Clear" : "Tiftir"}
              </button>
              <button
                type="button"
                onClick={() => handleNumPress("0")}
                className="h-12 w-full flex items-center justify-center text-slate-700 hover:text-slate-900 bg-slate-50 active:bg-slate-100 border border-slate-100 font-mono font-bold text-base rounded-xl transition-all cursor-pointer hover:shadow-2xs active:scale-95"
              >
                0
              </button>
              <div className="flex items-center justify-center text-[10px] bg-slate-100/60 border border-dashed border-slate-200 rounded-xl font-mono text-slate-500 select-none">
                PIN: {bursarPasscode}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 font-sans">
              {lang === 'EN' ? "Central Telecom Gateway • Secure 256-bit TLS" : "Isgaarsiinta Dhexe • Ammaanka 256-bit TLS"}
            </div>
          </div>
        );
      })() : (
        <>
          {/* Active bursar session banner */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-700 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2">
              <Unlock size={14} className="text-indigo-600 animate-pulse animate-duration-1000" />
              <span>
                {lang === 'EN' 
                  ? `Authorized Session: Active as ${activeBursarName}` 
                  : `የተፈቀደለት የስራ ጊዜ: ንቁ በ ${activeBursarName}`}
              </span>
            </div>
            <button 
              onClick={() => setIsAuthorized(false)}
              className="text-[10px] font-bold text-indigo-850 hover:text-indigo-950 px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-300 rounded-lg shadow-2xs active:scale-95 cursor-pointer transition-all"
            >
              {lang === 'EN' ? "Lock Terminal" : "ተርሚናል ዝጋ"}
            </button>
          </div>

          {/* -------------------------------------------------------------
              SUB-TAB: BILLING & INVOICE LEDGER (PRIMARY TAB)
              ------------------------------------------------------------- */}
      {activeFinanceTab === 'Ledger' && !selectedReceipt && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Billing Quick Stats bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{lang === 'EN' ? "Total Invoiced" : "የታተሙ ደረሰኞች ድምር"}</span>
                <span className="text-base font-bold text-slate-700">{expectedTotal.toLocaleString()} ETB</span>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Receipt size={18} /></div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{lang === 'EN' ? "Collected (ETB)" : "የተሰበሰበ ክፍያ"}</span>
                <span className="text-base font-bold text-emerald-600">{collectedTotal.toLocaleString()} ETB</span>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Check size={18} /></div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{lang === 'EN' ? "Outstanding Dues" : "ቀሪ ቀሪ ዕዳ"}</span>
                <span className="text-base font-bold text-rose-600">{balanceOutstanding.toLocaleString()} ETB</span>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><HandCoins size={18} /></div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{lang === 'EN' ? "Collection Efficiency" : "የስብስብ ውጤታማነት"}</span>
                <span className="text-base font-bold text-slate-700">{collectionRate.toFixed(1)}%</span>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ArrowUpRight size={18} /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="font-display font-medium text-slate-800 text-lg">{lang === 'EN' ? "Billing Ledger & Payments Directory" : "የልዩ ልዩ ክፍያዎች መመዝገቢያ መዝገብ"}</h2>
                <span className="text-xs text-slate-400 block mt-1">
                  {lang === 'EN' 
                    ? "Log custom invoices, capture CBE/Telebirr statements, and print client receipts." 
                    : "የተማሪዎችን ክፍያ መከታተያ፣ መቀበያ እና የባንክ ማመሳከሪያ ደረሰኝ ማተሚያ።"}
                </span>
              </div>

              <button
                onClick={() => setShowAddInvoice(!showAddInvoice)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                {lang === 'EN' ? "Issue Simple Invoice" : "አዲስ ክፍያ ጫን"}
              </button>
            </div>

            {/* Custom Invoice Generator Box */}
            {showAddInvoice && (
              <form onSubmit={handleCreateInvoice} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 max-w-lg">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{lang === 'EN' ? "Add Single-Student Invoice" : "ለተማሪ አዲስ ደረሰኝ ማውጫ"}</h4>
                <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                  <div className="col-span-2">
                    <label className="block text-slate-400 font-bold mb-1">Select Student</label>
                    <select 
                      value={billStudentId} 
                      required 
                      onChange={(e) => setBillStudentId(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                    >
                      <option value="">-- Choose child --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Fee Classification</label>
                    <select 
                      value={billFeeType} 
                      onChange={(e) => setBillFeeType(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                    >
                      <option value="Tuition Fee">Tuition Fee</option>
                      <option value="Registration Fee">Registration Fee</option>
                      <option value="Sports & Lab Fee">Sports & Lab Fee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Amount (ETB)</label>
                    <input 
                      type="number" 
                      value={billAmount} 
                      onChange={(e) => setBillAmount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-3 py-1.2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
                  <button type="button" onClick={() => setShowAddInvoice(false)} className="px-3 py-1.5 border border-slate-200 text-[11px] rounded-lg cursor-pointer">{t.cancel}</button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg cursor-pointer">Post Invoice</button>
                </div>
              </form>
            )}

            {/* Invoices Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400 font-semibold bg-slate-50/50">
                    <th className="p-3">{t.invoiceId}</th>
                    <th className="p-3">{t.student}</th>
                    <th className="p-3">Fee Type</th>
                    <th className="p-3 text-right">{t.amount}</th>
                    <th className="p-3 text-right">{t.paidAmount}</th>
                    <th className="p-3 text-right">{t.balance}</th>
                    <th className="p-3">{t.status}</th>
                    <th className="p-3 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-sans">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-55/40">
                      <td className="p-3 font-mono font-bold text-slate-800">{inv.id}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-700 block">{inv.studentName}</span>
                        <span className="text-[10px] text-indigo-700 block font-sans">{inv.grade} • Sec {inv.section}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-550">{inv.feeType}</td>
                      <td className="p-3 text-right font-mono">{inv.amount.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-emerald-600 font-semibold">{inv.paidAmount.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-semibold">{inv.balance.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : inv.status === 'Partially Paid' 
                              ? 'bg-amber-50 text-amber-700' 
                              : 'bg-rose-50 text-rose-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {inv.balance > 0 && (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              {lang === 'EN' ? "Collect" : "መዝግብ"}
                            </button>
                          )}
                          
                          {inv.paymentHistory.length > 0 && (
                            <button
                              onClick={() => setSelectedReceipt(inv)}
                              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                              title="Print Receipt"
                            >
                              <Printer size={13} />
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
      )}

      {/* Payment Processing Interactive Overlay */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmPayment} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
              <Smartphone className="text-indigo-600" size={20} />
              {lang === 'EN' ? "Capture Digital Transaction" : "የክፍያ ፎርም መሙያ ማረጋገጫ"}
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-slate-700">{selectedInvoice.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Details:</span>
                <span className="font-semibold text-slate-500">{selectedInvoice.feeType}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="font-bold text-slate-700">Oustanding Fee Balance:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">{selectedInvoice.balance.toLocaleString()} ETB</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Payment Amount (ETB)</label>
                <input 
                  type="number" 
                  max={selectedInvoice.balance} 
                  required
                  value={payAmount} 
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Select Channel / Method</label>
                <select 
                  value={payMethod} 
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.8"
                >
                  <option value="Telebirr">Telebirr (ቴሌብር)</option>
                  <option value="CBE Birr">CBE Birr (ሲቢኢ ብር)</option>
                  <option value="Awash Bank Transfer">Awash Bank Transfer</option>
                  <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Cash">Direct Office Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Transaction Ref Code / Slip No</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. TX-TELE..." 
                  value={payRef} 
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.8 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-200 pt-4">
              <button 
                type="button" 
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {lang === 'EN' ? "Commit Payment" : "ክፍያውን አፅድቅ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB: PRINTABLE PAYMENT RECEIPTS PREVIEW
          ------------------------------------------------------------- */}
      {selectedReceipt && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6 animate-fade-in print-card max-w-2xl mx-auto">
          
          <div className="flex items-center justify-between no-print border-b border-slate-100 pb-3">
            <button 
              onClick={() => setSelectedReceipt(null)} 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              &larr; Back to Ledger
            </button>
            <button 
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={14} />
              {lang === 'EN' ? "Print Receipt" : "ደረሰኝ አትም"}
            </button>
          </div>

          {/* Actual Receipt design formatted for printing */}
          <div className="space-y-6 p-4">
            
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.ethiopiaGov}</span>
              <h2 className="font-display font-extrabold text-slate-800 text-lg uppercase tracking-wider">Focus Academy Private School</h2>
              <span className="text-slate-500 text-xs italic block">Bole Sub-City, Addis Ababa, Ethiopia • Tel: +251 11-661-2345</span>
              <div className="h-0.5 bg-indigo-700 w-24 mx-auto my-3" />
              <h3 className="font-display font-bold text-slate-700 text-sm tracking-widest uppercase">{t.feeReceipt} / የክፍያ ደረሰኝ</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Payer Student Name</span>
                <span className="font-bold text-slate-800">{selectedReceipt.studentName}</span>
                <span className="block text-[10px] text-slate-500">Class: {selectedReceipt.grade} • Section: {selectedReceipt.section}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoice ID Reference</span>
                <span className="font-bold text-slate-800 font-mono">{selectedReceipt.id}</span>
                <span className="block text-[10px] text-slate-400">Date Issued: {selectedReceipt.dateIssued}</span>
              </div>
            </div>

            {/* Payment history listing blocks */}
            <div className="space-y-2 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Ledger Settlements List</span>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-slate-50 p-2.5 font-bold border-b border-indigo-700/10 text-slate-600">
                  <span>Receipt No</span>
                  <span>Method</span>
                  <span>Reference ID</span>
                  <span className="text-right">Paid Amount (ETB)</span>
                </div>

                {selectedReceipt.paymentHistory.map((h, i) => (
                  <div key={i} className="grid grid-cols-4 p-2.5 border-b border-slate-100 last:border-0 font-sans text-slate-600">
                    <span className="font-semibold">{h.receiptId}</span>
                    <span>{h.paymentMethod}</span>
                    <span className="font-mono text-slate-500">{h.referenceNo}</span>
                    <span className="text-right font-mono font-bold text-emerald-600">+{h.amountPaid.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 grid grid-cols-2 items-end">
              <div className="text-xs space-y-1 text-slate-500 font-sans">
                <span>Thank you for choosing Focus Academy!</span>
                <span className="block">All educational fees are subjects of MoE guidelines.</span>
              </div>
              <div className="text-right space-y-1 font-sans">
                <div className="flex justify-end gap-2 text-xs">
                  <span className="text-slate-400">Expected Total Fee:</span>
                  <span className="font-semibold font-mono text-slate-700">{selectedReceipt.amount.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <span className="text-slate-400">Cumulative Paid:</span>
                  <span className="font-bold font-mono text-emerald-700">{selectedReceipt.paidAmount.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-end gap-2 text-sm border-t border-slate-250 pt-1.5">
                  <span className="font-bold text-slate-700">Remaining Balance:</span>
                  <span className="font-bold font-mono text-rose-600">{selectedReceipt.balance.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* School stamp & authorized signee line placeholder to secure real documents look */}
            <div className="border-t border-dashed border-slate-300 pt-8 mt-8 flex justify-between items-center text-xs">
              <div className="space-y-0.5 text-slate-400 font-sans">
                <span>Verified by Systems Ledger Operator</span>
                <span className="block text-[9px] font-mono">MD-ET-8809B / Focus System v1.0</span>
              </div>
              <div className="text-center space-y-0.5 text-slate-500">
                <div className="w-40 border-b border-slate-400 mx-auto" style={{ height: '30px' }} />
                <span>Finance Director Seal & Sign</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB: FEES STRUCTURE REFERENCE
          ------------------------------------------------------------- */}
      {activeFinanceTab === 'Structure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <h2 className="font-display font-medium text-slate-800 text-base mb-1">{t.feeStructure} • 2026/2027</h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'EN' 
                ? "Standard tuition and operational fee components approved by the School Board." 
                : "የትምህርት ቤቱ ቦርድ ዘንድ የፀደቁ የወርሃዊ እና የዓመታዊ ጠቅላላ ክፍያዎች ተመን ዝርዝሮች።"}
            </p>

            <div className="space-y-3 font-sans">
              {initialFeeStructures.map((fee) => (
                <div key={fee.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-700">{fee.type}</span>
                    <span className="block text-[10px] text-indigo-700 font-bold uppercase">{fee.gradeRange} Track ({fee.frequency})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-sm text-indigo-600">{fee.amount.toLocaleString()} ETB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-xs text-amber-900 space-y-4 font-sans leading-relaxed">
            <h3 className="font-bold text-amber-950 font-display text-sm flex items-center gap-1.5">
              <CircleDollarSign size={16} />
              CBE Bank Deposit Instructions
            </h3>
            <p>
              Focus Academy supports cashless settlements. Parents are encouraged to utilize CBE Birr or direct Telebirr deposits to complete standard monthly fees before the 15th of each active academic month.
            </p>
            <div className="space-y-2 bg-white/60 p-3 rounded-xl border border-amber-200/50">
              <span className="font-bold block text-slate-700">Official Banking Channels:</span>
              <div>
                <span className="block font-mono">Commercial Bank of Ethiopia (CBE)</span>
                <span className="block font-bold font-mono">A/C: 1000-2244-88414-02</span>
              </div>
              <div className="h-px bg-amber-200" />
              <div>
                <span className="block font-mono">Awash Bank Private Sector Channel</span>
                <span className="block font-bold font-mono">A/C: 3201-22415-09</span>
              </div>
            </div>
            <p className="font-bold text-amber-950">
              Note: System automatically generates balance reminders for unpaid bills exceeding 30 calendar days.
            </p>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB: FINANCIAL REPORTS CENTER
          ------------------------------------------------------------- */}
      {activeFinanceTab === 'Reports' && (
        <div id="financial-reports-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs animate-fade-in space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-display font-medium text-slate-800 text-base">{lang === 'EN' ? "Consolidated Financial Activity Report" : "ጠቅላላ የበጀት ስርጭት እና የክፍያዎች ሪፖርት"}</h2>
            <p className="text-xs text-slate-400">Comprehensive overview of collections and budget achievements.</p>
          </div>

          {/* Simple Custom Visual representation of Collections vs Remaining Budget using standard pure elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 font-sans">
              <div className="space-y-1 pb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Collection Milestone Progress</span>
                <h4 className="text-xl font-display font-bold text-slate-700">{collectionRate.toFixed(1)}% Completed</h4>
              </div>
              
              <div className="w-full bg-slate-150 rounded-full h-4 overflow-hidden flex">
                <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: `${collectionRate}%` }} title="Collected"></div>
                <div className="bg-rose-500 h-full rounded-r-full" style={{ width: `${100 - collectionRate}%` }} title="Balance"></div>
              </div>

              <div className="flex gap-4 text-xs pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span className="text-slate-500">Fees Collected ({collectedTotal.toLocaleString()} ETB)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-rose-500 rounded-sm" />
                  <span className="text-slate-500">Unpaid Balance ({balanceOutstanding.toLocaleString()} ETB)</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-50/70 space-y-3 font-sans text-xs">
              <span className="font-bold text-indigo-900 block font-display text-sm">Financial Analytics Metrics</span>
              
              <div className="flex justify-between border-b border-indigo-200/20 pb-2">
                <span className="text-slate-500">Active Invoiced Families:</span>
                <span className="font-bold text-slate-700">{students.length} students</span>
              </div>

              <div className="flex justify-between border-b border-indigo-200/20 pb-2">
                <span className="text-slate-500">Average Paid Tuition per student:</span>
                <span className="font-bold text-slate-750 font-mono">{Math.round(collectedTotal / (students.length || 1)).toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between text-indigo-900 font-bold">
                <span>Total Expected Financial Year Revenue:</span>
                <span className="font-mono">{expectedTotal.toLocaleString()} ETB</span>
              </div>
            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
}
