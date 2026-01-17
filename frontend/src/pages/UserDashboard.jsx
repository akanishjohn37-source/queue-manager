import React, { useEffect, useState, useRef } from "react";
import { fetchProviders, fetchServices, fetchTokensByService, createToken, fetchMyTokens } from "../api";
import { Building2, Stethoscope, User, Ticket, Clock, CheckCircle, AlertCircle, Calendar, ChevronRight, Search, Zap, BellRing } from "lucide-react";

export default function UserDashboard() {
  const [viewMode, setViewMode] = useState("book"); // "book" or "directory"
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState("");
  const [myTokens, setMyTokens] = useState([]);

  // Load Providers
  useEffect(() => {
    fetchProviders().then(setProviders).catch(() => setMessage("Failed to load clinical network"));
    fetchMyTokens().then(setMyTokens).catch(console.error);
  }, []);

  // Load Services when Provider changes
  useEffect(() => {
    if (!selectedProvider) {
      setServices([]);
      return;
    }
    fetchServices(selectedProvider).then(setServices).catch(() => setMessage("Failed to load department services"));
  }, [selectedProvider]);

  const loadQueue = () => {
    if (!selectedService) {
      setQueue([]);
      return;
    }
    fetchTokensByService(selectedService)
      .then((data) => {
        setQueue(data);
      })
      .catch(() => setMessage("Connection error during queue fetch"));
  };

  useEffect(() => {
    if (!selectedService) return;
    loadQueue();
    const id = setInterval(loadQueue, 5000);
    return () => clearInterval(id);
  }, [selectedService]);

  const handleCreateToken = async () => {
    const name = localStorage.getItem("username") || "User";
    if (!selectedService || !selectedTime) {
      setMessage("Please select a clinical specialty and time window.");
      return;
    }
    try {
      const token = await createToken(selectedService, name, selectedTime);
      setMessage(`Confirmed! Your unique entry token is #${token.token_number} for the ${selectedTime} window.`);
      setMyTokens(prev => [token, ...prev]);
      setSelectedTime("");
      loadQueue();
    } catch (err) {
      setMessage("System error during token generation");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white premium-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-none ring-1 ring-slate-200/50">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Zap size={12} />
            Real-time Systems Active
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Client Hub</h1>
          <p className="text-slate-500 font-medium text-lg">Securely manage clinical scheduling and live status monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-12">
          {message && (
            <div className={`mb-10 p-5 rounded-2xl flex items-center gap-4 animate-fade-in font-semibold border ${message.includes("Confirmed") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
              {message.includes("Confirmed") ? <CheckCircle className="shrink-0" size={24} /> : <AlertCircle className="shrink-0" size={24} />}
              <span className="text-sm md:text-base">{message}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-10">
          <div className="premium-card p-10 space-y-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
                  <Zap size={20} />
                </span>
                Scheduling Matrix
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Step {!selectedProvider ? 1 : !selectedService ? 2 : 3} / 3
              </span>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Clinical Institution</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 pointer-events-none" size={18} />
                    <select
                      className="premium-input !pl-12 !py-4 appearance-none font-bold"
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                    >
                      <option value="">Select Hospital</option>
                      {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Specialized Service</label>
                  <div className="relative group">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 pointer-events-none" size={18} />
                    <select
                      className="premium-input !pl-12 !py-4 appearance-none font-bold disabled:bg-slate-50"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      disabled={!selectedProvider}
                    >
                      <option value="">Choose Department</option>
                      {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={14} />
                  Preferred Operation Window
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                    "12:00", "12:30", "13:00", "13:30", "14:00"].map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-1 rounded-xl text-[13px] font-bold transition-all duration-300 border-2 ${isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                            : "bg-white border-slate-100 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                            }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                </div>
              </div>

              <button
                onClick={handleCreateToken}
                className="btn-primary w-full !py-5 text-lg flex items-center justify-center gap-3 group"
              >
                <Zap size={20} className="group-hover:animate-pulse" />
                <span>Execute Booking Request</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Current Queue Display */}
          {selectedService && (
            <div className="premium-card p-10 animate-fade-in border-blue-100 bg-blue-50/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <BellRing size={20} className="animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-none">Live Service Stream</h2>
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for active tokens...</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="py-5 px-6">Sequence</th>
                        <th className="py-5 px-6">Identity</th>
                        <th className="py-5 px-6">Department</th>
                        <th className="py-5 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queue.map((t) => (
                        <tr key={t.id} className={`transition-all ${t.status === 'calling' ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                          <td className="py-5 px-6 font-black text-blue-600 text-lg tracking-tighter">#{t.token_number}</td>
                          <td className="py-5 px-6 font-bold text-slate-700">{t.visitor_name}</td>
                          <td className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                            <div className="flex flex-col">
                              <span>{t.provider_name}</span>
                              <span className="text-[10px] opacity-60 italic">{t.service_name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                ${t.status === 'calling' ? 'bg-emerald-100 text-emerald-700' :
                                t.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'calling' ? 'bg-emerald-500 animate-ping' : 'bg-current'}`} />
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-5 space-y-10">
          <div className="premium-card p-10 sticky top-32 flex flex-col h-[800px] border-amber-100">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="p-2 bg-slate-900 rounded-lg text-white">
                  <Clock size={20} />
                </span>
                Session History
              </h2>
            </div>

            <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
              {myTokens.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 opacity-50">
                    <Ticket size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-400">Empty Register</h3>
                  <p className="text-slate-400 text-sm mt-2">Active session history will populate here upon booking.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {myTokens.map((t) => (
                    <div key={t.id} className="group relative p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Entry Ref</span>
                          <div className="text-3xl font-black text-slate-900 tracking-tighter">#{t.token_number}</div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none
                              ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              t.status === 'calling' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white shadow-sm text-slate-500 border border-slate-100'}`}>
                            {t.status}
                          </span>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t.provider_name}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-900">
                          <Stethoscope size={16} className="text-blue-500" />
                          <span className="text-sm font-bold uppercase tracking-tight">{t.service_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200/50">
                        <div className="flex items-center gap-2 text-slate-500 shrink-0">
                          <User size={16} />
                          <span className="text-xs font-bold truncate max-w-[80px]">{t.visitor_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={16} />
                          <span className="text-xs font-bold">{t.appointment_time || "Now"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System Analytics</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black">{myTokens.length}</div>
                <div className="text-[10px] text-slate-500 font-bold mb-1">Total session tokens</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
