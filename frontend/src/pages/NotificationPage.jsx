import React, { useState, useEffect } from "react";
import { fetchProviders, fetchServices, fetchTokensByService } from "../api";
import { Monitor, Clock, Users, Activity, LayoutDashboard, Calendar, Search } from "lucide-react";

export default function NotificationPage() {
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [tokens, setTokens] = useState([]);

    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load Providers on mount
    useEffect(() => {
        fetchProviders().then(setProviders).catch(console.error);
    }, []);

    // Load Services when Provider changes
    useEffect(() => {
        if (!selectedProvider) {
            setServices([]);
            return;
        }
        fetchServices(selectedProvider).then(setServices).catch(console.error);
    }, [selectedProvider]);

    // Poll Tokens when Service is selected
    useEffect(() => {
        if (!selectedService) {
            setTokens([]);
            return;
        }

        const loadTokens = () => {
            fetchTokensByService(selectedService)
                .then(setTokens)
                .catch(console.error);
        };

        loadTokens();
        const interval = setInterval(loadTokens, 3000); // Poll every 3s for live updates
        return () => clearInterval(interval);
    }, [selectedService]);

    const currentToken = tokens.find((t) => t.status === "calling" || t.status === "serving");
    const waitingTokens = tokens.filter((t) => t.status === "waiting");
    const completedTokens = tokens.filter((t) => t.status === "completed" || t.status === "skipped");

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-300 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white pb-10">
            {/* Professional Industry Header */}
            <header className="bg-[#0f1218] border-b border-white/5 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-50 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                        <Monitor className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-widest uppercase mb-0.5">Live Queue Stream</h1>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Real-time Node Connected
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 bg-white/5 px-8 py-3 rounded-2xl border border-white/10">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Current Date</span>
                        <span className="text-sm font-bold text-white tracking-tight">{currentTime.toLocaleDateString()}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Network Time</span>
                        <span className="text-sm font-bold text-white tracking-tight font-mono uppercase">{currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </header>

            {/* Selection Matrix */}
            <Section className="!py-10 max-w-none px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <LayoutDashboard size={120} />
                    </div>

                    <div className="relative space-y-3">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.25em] ml-1">Hospital Instance</label>
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <select
                                className="w-full bg-slate-900 border-white/10 text-white rounded-2xl shadow-sm p-4 pl-14 border focus:ring-blue-500 focus:border-blue-500 appearance-none font-bold tracking-tight cursor-pointer hover:bg-slate-800 transition-colors"
                                value={selectedProvider}
                                onChange={(e) => {
                                    setSelectedProvider(e.target.value);
                                    setSelectedService("");
                                }}
                            >
                                <option value="">Select Institutional Provider</option>
                                {providers.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="relative space-y-3">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.25em] ml-1">Department Stream</label>
                        <div className="relative group">
                            <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <select
                                className="w-full bg-slate-900 border-white/10 text-white rounded-2xl shadow-sm p-4 pl-14 border focus:ring-blue-500 focus:border-blue-500 appearance-none font-bold tracking-tight cursor-pointer hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                disabled={!selectedProvider}
                            >
                                <option value="">Select Service Specialty</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                {/* Industrial Display Grid */}
                {selectedService ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 animate-fade-in items-start">
                        {/* Current Token - Heavy Focus */}
                        <div className="lg:col-span-12 xl:col-span-8 flex flex-col justify-center items-center bg-blue-600 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.2)] p-20 text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <Monitor size={200} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                            <div className="relative z-10 space-y-4">
                                <h2 className="text-xl font-black uppercase tracking-[0.5em] text-white/60 mb-8">Now Processing</h2>
                                {currentToken ? (
                                    <div className="animate-fade-in">
                                        <div className="text-[12rem] md:text-[18rem] font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                                            #{currentToken.token_number}
                                        </div>
                                        <div className="text-4xl md:text-6xl font-black text-blue-100 tracking-tight mt-10">
                                            {currentToken.visitor_name || "SYSTEM_USER"}
                                        </div>
                                        <div className="mt-12 flex justify-center">
                                            <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                                Serving in Progress
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-20 animate-pulse">
                                        <Clock size={120} className="text-white/30 mb-8" />
                                        <div className="text-4xl font-black text-white/40 tracking-[0.2em] uppercase italic">System_Standby</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Waiting List - Professional List Style */}
                        <div className="lg:col-span-12 xl:col-span-4 space-y-8 h-full">
                            <div className="bg-[#161b24] rounded-[2.5rem] border border-white/5 p-10 h-full flex flex-col shadow-2xl relative">
                                <h3 className="text-xl font-black text-white mb-10 pb-6 border-b border-white/5 flex items-center gap-4">
                                    <Users className="text-blue-500" size={24} />
                                    Sequence Buffer
                                </h3>

                                {waitingTokens.length === 0 ? (
                                    <div className="flex-grow flex flex-col items-center justify-center space-y-4 opacity-20">
                                        <Users size={64} />
                                        <p className="font-bold uppercase tracking-widest text-xs">Buffer Clean</p>
                                    </div>
                                ) : (
                                    <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar pr-2">
                                        {waitingTokens.map((t, idx) => (
                                            <div key={t.id} className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all duration-300">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-black text-blue-500 border border-white/10 shadow-lg">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="text-3xl font-black text-white tracking-tighter">#{t.token_number}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-slate-400 font-bold mb-1 truncate max-w-[120px]">{t.visitor_name || "GUEST"}</div>
                                                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Summary Mini Card */}
                                <div className="mt-10 p-6 bg-blue-600/10 rounded-2xl border border-blue-600/20 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Active Nodes</span>
                                    <div className="text-3xl font-black text-white">{waitingTokens.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-20 flex flex-col items-center justify-center text-slate-600 space-y-8 animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600/5 blur-[60px] rounded-full"></div>
                            <Monitor size={140} className="relative grayscale opacity-20" />
                        </div>
                        <div className="text-center space-y-3">
                            <h2 className="text-2xl font-black text-slate-700 tracking-tight">Unified Data Stream</h2>
                            <p className="text-slate-500 font-medium max-w-sm">Establish a network connection by selecting an institutional provider and department above.</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-1 bg-slate-800 rounded-full"></div>)}
                        </div>
                    </div>
                )}
            </Section>
        </div>
    );
}
