import React, { useState, useEffect } from "react";
import { fetchProviders, fetchServices, fetchTokensByService, updateTokenStatus, cancelAllTokens, fetchNotifications, markNotificationRead, clearNotifications } from "../api";
import { Users, Clock, CheckCircle, XCircle, Play, SkipForward, AlertCircle, LayoutDashboard, Building2, Zap, ArrowRight, BellRing, FileText, X, Download, Ban } from "lucide-react";
import HospitalDirectory from "../components/HospitalDirectory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ProviderDashboard() {
    const [myProviders, setMyProviders] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("manage");
    const [showReport, setShowReport] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    // Notification System
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const [toasts, setToasts] = useState([]);
    const seenIds = React.useRef(new Set());
    const isFirstLoad = React.useRef(true);

    const addToast = (msg) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleNotificationClick = async (n) => {
        setSelectedNotification(n);
        setShowNotifications(false);
        if (!n.is_read) {
            try {
                await markNotificationRead(n.id);
                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
            } catch { }
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Clear all notifications?")) return;
        try {
            await clearNotifications();
            setNotifications([]);
        } catch (e) { console.error(e); }
    };

    const userId = parseInt(localStorage.getItem("user_id"));

    useEffect(() => {
        const loadNotifs = async () => {
            try {
                const data = await fetchNotifications();
                const currentList = Array.isArray(data) ? data : [];
                setNotifications(currentList);

                currentList.forEach(n => {
                    if (!seenIds.current.has(n.id)) {
                        if (!isFirstLoad.current) {
                            addToast(n.message);
                        }
                        seenIds.current.add(n.id);
                    }
                });
                isFirstLoad.current = false;
            } catch { }
        };
        loadNotifs();
        const interval = setInterval(loadNotifs, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!userId) return;

        import("../api").then(({ fetchMyService }) => {
            fetchMyService().then(assignment => {
                if (assignment && assignment.service) {
                    setSelectedService({
                        id: assignment.service,
                        name: assignment.service_name,
                        providerName: assignment.provider_name,
                        providerLocation: assignment.provider_location
                    });
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

    const handleEmergencyCancel = async () => {
        if (!cancelReason) return alert("Please provide a reason.");
        if (!window.confirm("Are you sure you want to cancel ALL waiting tokens? This action cannot be undone.")) return;

        try {
            await cancelAllTokens(selectedService.id, cancelReason);
            setShowCancelModal(false);
            setCancelReason("");
            // refresh
            const updated = await fetchTokensByService(selectedService.id);
            setTokens(updated);
            alert("All waiting tokens have been cancelled.");
        } catch (e) {
            console.error(e);
            alert("Failed to cancel tokens.");
        }
    };

    const waitingTokens = tokens.filter(t => t.status === "waiting");
    const currentToken = tokens.find(t => t.status === "calling" || t.status === "serving");

    // Report Data
    const processedTokens = tokens.filter(t => ['completed', 'skipped', 'cancelled'].includes(t.status));
    const stats = {
        completed: processedTokens.filter(t => t.status === 'completed').length,
        skipped: processedTokens.filter(t => t.status === 'skipped').length,
        cancelled: processedTokens.filter(t => t.status === 'cancelled').length,
        total: processedTokens.length
    };

    if (!userId) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400 container mx-auto px-6">
            <div className="bg-rose-50 p-6 rounded-[2rem] mb-6">
                <AlertCircle size={60} className="text-rose-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Authentication Required</h2>
            <p className="text-lg font-medium">Internal access only. Please authenticate as a service provider.</p>
        </div>
    );

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text("Daily Session Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(`Date: ${new Date().toDateString()}`, 14, 28);

        if (selectedService) {
            doc.text(`Provider: ${selectedService.providerName} | Service: ${selectedService.name}`, 14, 34);
        }

        // Stats
        doc.setFillColor(241, 245, 249); // Slate 100
        doc.roundedRect(14, 40, 180, 20, 3, 3, "F");

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text(`Total: ${stats.total}`, 20, 53);
        doc.text(`Completed: ${stats.completed}`, 70, 53);
        doc.text(`Skipped: ${stats.skipped}`, 120, 53);
        doc.text(`Cancelled: ${stats.cancelled}`, 160, 53);

        // Table
        const tableColumn = ["Time", "Token", "Patient Name", "Status"];
        const tableRows = [];

        processedTokens.forEach(token => {
            const tokenData = [
                token.appointment_time || "-",
                `#${token.token_number}`,
                token.visitor_name || "Guest",
                token.status.toUpperCase()
            ];
            tableRows.push(tokenData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 4 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        doc.save(`session_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

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
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in relative">
            {/* Report Modal */}
            {showReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-500/30">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Session Report</h2>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{new Date().toDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReport(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4 p-8 bg-white border-b border-slate-100">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                <div className="text-3xl font-black text-slate-900">{stats.total}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Processed</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                                <div className="text-3xl font-black text-emerald-600">{stats.completed}</div>
                                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Completed</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                                <div className="text-3xl font-black text-amber-600">{stats.skipped}</div>
                                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1">Skipped</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                                <div className="text-3xl font-black text-rose-600">{stats.cancelled}</div>
                                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Cancelled</div>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                            {processedTokens.length === 0 ? (
                                <div className="text-center py-12 opacity-50 font-bold text-slate-400">No records found for today's session.</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200">
                                            <th className="py-4 px-4">Time</th>
                                            <th className="py-4 px-4">Token</th>
                                            <th className="py-4 px-4">Patient Name</th>
                                            <th className="py-4 px-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {processedTokens.map(t => (
                                            <tr key={t.id} className="font-bold text-slate-600 text-sm hover:bg-white transition-colors">
                                                <td className="py-4 px-4 font-mono text-xs">{t.appointment_time || "-"}</td>
                                                <td className="py-4 px-4 text-blue-600">#{t.token_number}</td>
                                                <td className="py-4 px-4">{t.visitor_name || "Guest"}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                                                        ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            t.status === 'skipped' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-rose-100 text-rose-700'}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                            <button
                                onClick={handleDownloadPDF}
                                className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <Download size={18} />
                                <span>Download PDF</span>
                            </button>
                            <button onClick={() => setShowReport(false)} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-rose-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-rose-600 p-3 rounded-xl text-white shadow-lg shadow-rose-500/30">
                                    <Ban size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Emergency Stop</h2>
                                    <p className="text-rose-600 font-bold text-xs uppercase tracking-widest">Cancel All Waiting</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCancelModal(false)} className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-400 hover:text-rose-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <p className="text-slate-600 font-medium text-sm">
                                This will cancel all <strong>{waitingTokens.length}</strong> waiting tokens. Please specify a reason for the notifications (e.g., "Doctor Emergency", "Session Limit Reached").
                            </p>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">cancellation Reason</label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none h-32"
                                    placeholder="Enter reason here..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
                            <button onClick={() => setShowCancelModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                Abort
                            </button>
                            <button onClick={handleEmergencyCancel} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/30">
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <p className="text-slate-400 font-medium text-lg">
                        {selectedService ? (
                            <>
                                <span className="text-white font-bold">{selectedService.providerName}</span>
                                {selectedService.providerLocation && <span className="text-slate-500">, {selectedService.providerLocation}</span>}
                                <span className="mx-2 text-slate-600">|</span>
                                <span className="text-blue-400">{selectedService.name}</span>
                            </>
                        ) : (
                            "System Base"
                        )}
                    </p>
                </div>

                <div className="relative z-10 flex gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-2xl font-bold transition-all flex items-center gap-3 border border-white/10 shadow-xl"
                        >
                            <div className="relative">
                                <BellRing size={20} />
                                {notifications.some(n => !n.is_read) && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900"></span>
                                )}
                            </div>
                        </button>

                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in origin-top-right text-left z-50">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <span className="font-bold text-slate-700">Notifications <span className="text-[10px] text-slate-400 font-normal ml-1">(Click item to view)</span></span>
                                    <span
                                        onClick={() => notifications.length > 0 && handleNotificationClick(notifications[0])}
                                        className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                                        title="View latest"
                                    >
                                        {notifications.filter(n => !n.is_read).length}
                                    </span>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm italic">No new notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className={`text-sm text-slate-700 leading-snug ${!n.is_read ? 'font-black' : 'font-medium'}`}>{n.message}</p>
                                                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setShowAllNotifications(true)}>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View All History</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-6 py-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 backdrop-blur-md rounded-2xl font-bold transition-all flex items-center gap-3 border border-rose-500/20 shadow-xl"
                    >
                        <Ban size={20} />
                        <span>End Session</span>
                    </button>
                    <button
                        onClick={() => setShowReport(true)}
                        className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-2xl font-bold transition-all flex items-center gap-3 border border-white/10 shadow-xl"
                    >
                        <FileText size={20} />
                        <span>Daily Report</span>
                    </button>
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
                                                        className="btn-primary mt-8 scale-110 !px-12 flex flex-col items-center gap-1 mx-auto py-4"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Play size={18} fill="currentColor" />
                                                            <span>Call Token #{waitingTokens[0].token_number}</span>
                                                        </div>
                                                        <div className="text-xs font-normal opacity-80">
                                                            {waitingTokens[0].visitor_name || "Guest"}
                                                        </div>
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
                            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                                <div className="space-y-1">
                                    <div className="text-3xl font-black tracking-tighter text-emerald-400">{stats.completed}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase">Resolved</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-black tracking-tighter text-white">{waitingTokens.length}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase">In-Queue</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-black tracking-tighter text-amber-500">{stats.skipped}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase">Skipped</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-black tracking-tighter text-rose-500">{stats.cancelled}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase">Cancelled</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-6">
                                <div className="h-full bg-blue-600 w-2/3 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedNotification(null)}>
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                                <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                                    <BellRing size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Notification Details</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedNotification.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="py-2">
                                <p className="text-lg font-medium text-slate-700 leading-relaxed">{selectedNotification.message}</p>
                            </div>
                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button onClick={() => setSelectedNotification(null)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">Dismiss</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification History Modal */}
            {showAllNotifications && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={() => setShowAllNotifications(false)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-white/20" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><BellRing className="text-blue-600" size={28} /> Notification Feed</h3>
                                <p className="text-slate-500 font-bold text-sm mt-1">Complete history of system alerts.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleClearAll}
                                    className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors text-xs uppercase tracking-widest"
                                >
                                    Clear All
                                </button>
                                <button onClick={() => setShowAllNotifications(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="text-slate-400 hover:text-slate-600" size={24} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-slate-50/50">
                            {notifications.length === 0 ? (
                                <div className="p-20 text-center text-slate-400 font-bold italic">No history available</div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} className={`p-8 border-b border-slate-100/50 hover:bg-white transition-all duration-300 ${!n.is_read ? 'bg-blue-50/40' : 'bg-transparent'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${!n.is_read ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-500'}`}>
                                                {!n.is_read ? <Zap size={10} className="fill-current" /> : <CheckCircle size={10} />}
                                                {new Date(n.timestamp).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                                <Clock size={12} className="text-slate-300" /> {new Date(n.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className={`text-base text-slate-700 leading-relaxed ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-6 right-6 z-50 space-y-4">
                {toasts.map(t => (
                    <div key={t.id} className="bg-slate-900/90 text-white backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-700/50 flex items-center justify-between gap-6 min-w-[300px] animate-slide-up">
                        <div className="flex items-center gap-3">
                            <BellRing size={18} className="text-blue-400 animate-pulse" />
                            <span className="text-sm font-bold leading-tight">{t.msg}</span>
                        </div>
                        <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
