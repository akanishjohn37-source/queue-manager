import React, { useState, useEffect } from "react";
import { fetchProviders, fetchServices, fetchTokensByService, updateTokenStatus } from "../api";
import { Users, Clock, CheckCircle, XCircle, Play, SkipForward, AlertCircle, LayoutDashboard, Building2, Zap, ArrowRight, BellRing } from "lucide-react";
import HospitalDirectory from "../components/HospitalDirectory";

export default function ProviderDashboard() {
    const [myProviders, setMyProviders] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("manage");

    const userId = parseInt(localStorage.getItem("user_id"));

    useEffect(() => {
        if (!userId) return;

        import("../api").then(({ fetchMyService }) => {
            fetchMyService().then(assignment => {
                if (assignment && assignment.service) {
                    setSelectedService({ id: assignment.service, name: assignment.service_name });
                    setLoading(false);
                } else {
                    fetchProviders().then((allProviders) => {
                        setMyProviders(allProviders);
                        setLoading(false);
                    }).catch(console.error);
                }
            }).catch(() => {
                fetchProviders().then((allProviders) => {
                    setMyProviders(allProviders);
                    setLoading(false);
                }).catch(console.error);
            });
        });
    }, [userId]);

    useEffect(() => {
        if (!selectedService) return;
        const loadTokens = () => {
            fetchTokensByService(selectedService.id)
                .then(setTokens)
                .catch(console.error);
        };
        loadTokens();
        const interval = setInterval(loadTokens, 5000);
        return () => clearInterval(interval);
    }, [selectedService]);

    const handleStatusUpdate = async (tokenId, newStatus) => {
        try {
            await updateTokenStatus(tokenId, newStatus);
            const updated = await fetchTokensByService(selectedService.id);
            setTokens(updated);
        } catch (err) {
            console.error(err);
        }
    };

    const waitingTokens = tokens.filter(t => t.status === "waiting");
    const currentToken = tokens.find(t => t.status === "calling" || t.status === "serving");

    if (!userId) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400 container mx-auto px-6">
            <div className="bg-rose-50 p-6 rounded-[2rem] mb-6">
                <AlertCircle size={60} className="text-rose-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Authentication Required</h2>
            <p className="text-lg font-medium">Internal access only. Please authenticate as a service provider.</p>
        </div>
    );

    if (loading) return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={20} className="text-blue-600 animate-pulse" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in">
            <div className="relative overflow-hidden bg-slate-900 premium-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-none ring-1 ring-white/10">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <LayoutDashboard size={200} className="text-white" />
                </div>

                <div className="relative z-10 space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        <Zap size={12} fill="currentColor" />
                        Operation Center
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Clinical Dashboard</h1>
                    <p className="text-slate-400 font-medium text-lg">Managing: <span className="text-blue-400">{selectedService?.name || "System Base"}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Main Area: Queue Management */}
                <div className="lg:col-span-8 space-y-10">
                    {selectedService ? (
                        <>
                            {/* Active Token Card */}
                            <div className="premium-card overflow-hidden bg-white border-blue-100 ring-4 ring-blue-50">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                                            <BellRing size={18} className="animate-bounce" />
                                        </div>
                                        Current Engagement
                                    </h2>
                                    {currentToken && (
                                        <div className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                                            Active Session
                                        </div>
                                    )}
                                </div>
                                <div className="p-10">
                                    {currentToken ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                            <div className="text-center md:text-left space-y-1">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Patient Sequence</span>
                                                <div className="text-[8rem] font-black text-slate-900 leading-none tracking-tighter">#{currentToken.token_number}</div>
                                                <div className="text-3xl font-black text-slate-500 flex items-center justify-center md:justify-start gap-4 pt-4">
                                                    {currentToken.visitor_name || "Anonymous_User"}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <button
                                                    onClick={() => handleStatusUpdate(currentToken.id, "completed")}
                                                    className="btn-primary !py-5 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 flex items-center justify-center gap-3 group"
                                                >
                                                    <CheckCircle size={22} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-lg">Finalize Session</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(currentToken.id, "skipped")}
                                                    className="px-6 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3"
                                                >
                                                    <SkipForward size={20} />
                                                    Mark as Skipped
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-12 transition-transform duration-500">
                                                    <Clock size={40} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-400 tracking-tight">System on Standby</h3>
                                                <p className="text-slate-400 font-medium mt-2">Initialize the next patient from the sequence buffer.</p>

                                                {waitingTokens.length > 0 && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(waitingTokens[0].id, "calling")}
                                                        className="btn-primary mt-8 scale-110 !px-12 flex items-center gap-3 mx-auto"
                                                    >
                                                        <Play size={18} fill="currentColor" />
                                                        Call Token #{waitingTokens[0].token_number}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Waiting Queue List */}
                            <div className="premium-card overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center px-10">
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                        <Users size={20} className="text-blue-600" />
                                        Sequence Buffer
                                        <span className="ml-2 bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{waitingTokens.length} Pending</span>
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50">
                                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                                <th className="py-5 px-10">Identity</th>
                                                <th className="py-5 px-6">Timestamp</th>
                                                <th className="py-5 px-6 text-right">Operation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {waitingTokens.map(t => (
                                                <tr key={t.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                                    <td className="py-6 px-10">
                                                        <div className="flex items-center gap-5">
                                                            <div className="text-3xl font-black text-slate-900 tracking-tighter">#{t.token_number}</div>
                                                            <div className="flex flex-col">
                                                                <div className="font-bold text-slate-700">{t.visitor_name || "GUEST_USER"}</div>
                                                                {t.appointment_time && (
                                                                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                                                                        Slot {t.appointment_time.substring(0, 5)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-6 text-slate-400 font-bold text-sm">
                                                        {new Date(t.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-6 px-10 text-right">
                                                        <button
                                                            onClick={() => handleStatusUpdate(t.id, "calling")}
                                                            className="px-6 py-2 bg-white border border-slate-200 text-slate-900 hover:text-blue-600 hover:border-blue-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-lg active:scale-95"
                                                        >
                                                            Call Next
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {waitingTokens.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="py-20 text-center">
                                                        <div className="flex flex-col items-center opacity-20">
                                                            <Users size={64} className="mb-4" />
                                                            <p className="font-black uppercase tracking-widest text-xs">Buffer Cleared</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="premium-card p-20 flex flex-col items-center justify-center text-center space-y-8">
                            <Activity size={80} className="text-slate-100" />
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Stream Connectivity Required</h3>
                                <p className="text-slate-500 max-w-sm font-medium">Select a department stream from the sidebar to initialize queue management operations.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar / Secondary Sections */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Historical Session Data */}
                    <div className="premium-card p-8 bg-[#fdfdfd] border-slate-100">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                            <Clock size={16} className="text-blue-600" />
                            Recent History
                        </h2>

                        <div className="space-y-4">
                            {tokens.filter(t => t.status === "completed").slice(0, 5).map(t => (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-black text-slate-900 tracking-tighter">#{t.token_number}</div>
                                        <div className="text-xs font-bold text-slate-400 line-clamp-1 truncate w-24">{t.visitor_name}</div>
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 py-1 bg-emerald-50 rounded-lg shrink-0">Complete</span>
                                </div>
                            ))}
                            {tokens.filter(t => t.status === "completed").length === 0 && (
                                <p className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No historical data</p>
                            )}
                        </div>

                        {tokens.some(t => t.status === "skipped") && (
                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-6">Skipped / Holding Buffer</h3>
                                <div className="space-y-3">
                                    {tokens.filter(t => t.status === "skipped").map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-4 bg-amber-50/30 rounded-xl border border-amber-100 group">
                                            <div className="text-xl font-black text-amber-700 tracking-tighter">#{t.token_number}</div>
                                            <button
                                                onClick={() => handleStatusUpdate(t.id, "calling")}
                                                className="p-2 bg-white text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                            >
                                                <Play size={14} fill="currentColor" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analytics Sidebar */}
                    <div className="premium-card p-8 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Zap className="text-blue-500" size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operation Metrics</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <div className="text-3xl font-black tracking-tighter">{tokens.filter(t => t.status === 'completed').length}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase">Resolved</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-black tracking-tighter">{waitingTokens.length}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase">In-Queue</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-6">
                                <div className="h-full bg-blue-600 w-2/3 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
