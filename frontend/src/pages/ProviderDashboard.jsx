import React, { useState, useEffect } from "react";
import { fetchProviders, fetchServices, fetchTokensByService, updateTokenStatus } from "../api";
import { Users, Clock, CheckCircle, XCircle, Play, SkipForward, AlertCircle } from "lucide-react";
import HospitalDirectory from "../components/HospitalDirectory";

export default function ProviderDashboard() {
    const [myProviders, setMyProviders] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = parseInt(localStorage.getItem("user_id"));

    useEffect(() => {
        if (!userId) return;

        // Try to fetch assigned service first
        import("../api").then(({ fetchMyService }) => {
            fetchMyService().then(assignment => {
                if (assignment && assignment.service) {
                    // Assignment object has { service: ID, service_name: "Name" } from serializer
                    // Construct a service object compatible with selectedService logic
                    setSelectedService({ id: assignment.service, name: assignment.service_name });
                    setLoading(false);
                } else {
                    // Fallback for demo/testing or if not assigned
                    fetchProviders().then((allProviders) => {
                        setMyProviders(allProviders);
                        setLoading(false);
                    }).catch(console.error);
                }
            }).catch(() => {
                // Fallback if fetchMyService fails (e.g. not a staff user or endpoint error)
                fetchProviders().then((allProviders) => {
                    setMyProviders(allProviders);
                    setLoading(false);
                }).catch(console.error);
            });
        });
    }, [userId]);

    // useEffect for loading services removed to prevent auto-loading all services.
    // Services are now only loaded when a specific hospital is selected.

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
            alert("Failed to update status");
            console.error(err);
        }
    };

    const waitingTokens = tokens.filter(t => t.status === "waiting");
    const currentToken = tokens.find(t => t.status === "calling" || t.status === "serving");

    const [viewMode, setViewMode] = useState("manage"); // "manage" or "directory"
    const [allProviders, setAllProviders] = useState([]);
    const [allServices, setAllServices] = useState([]);

    useEffect(() => {
        if (viewMode === "directory" && allProviders.length === 0) {
            Promise.all([fetchProviders(), fetchServices()]).then(([providers, services]) => {
                setAllProviders(providers);
                setAllServices(services);
            }).catch(console.error);
        }
    }, [viewMode]);

    if (!userId) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
            <AlertCircle size={48} className="mb-4 text-red-400" />
            <p className="text-lg">Please login as a service provider.</p>
        </div>
    );

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
                    <div className="text-sm text-gray-500">Manage your queues efficiently</div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode("manage")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "manage" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                        Manage Queue
                    </button>
                    <button
                        onClick={() => setViewMode("directory")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "directory" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                        Hospital Directory
                    </button>
                </div>
            </div>

            {viewMode === "directory" ? (
                <HospitalDirectory />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar: Selection Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-700 flex items-center space-x-2">
                                <Users size={18} />
                                <span>My Station</span>
                            </h2>
                        </div>
                        <div className="p-4">
                            {selectedService ? (
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Assigned Service</div>
                                    <div className="font-bold text-lg text-blue-700 mb-1">{selectedService.name}</div>
                                    {/* We can fetch provider name if we want, or just show service */}
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <CheckCircle size={14} className="text-green-500" />
                                        <span>Active & Online</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-500">Loading your assignment...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Area: Queue Management */}
                    <div className="lg:col-span-3 space-y-6">
                        {selectedService ? (
                            <>
                                {/* Active Token Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-semibold text-gray-800">Current Token</h2>
                                    </div>
                                    <div className="p-6">
                                        {currentToken ? (
                                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="text-center md:text-left">
                                                    <div className="text-6xl font-black text-blue-600 tracking-tight">#{currentToken.token_number}</div>
                                                    <div className="text-xl text-gray-700 mt-2 font-medium">{currentToken.visitor_name || "User"}</div>
                                                    {currentToken.appointment_time && (
                                                        <div className="text-sm text-blue-600 font-medium mt-1">
                                                            Scheduled: {currentToken.appointment_time.substring(0, 5)}
                                                        </div>
                                                    )}
                                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 mt-3 uppercase tracking-wide">
                                                        <Play size={14} className="mr-1" /> {currentToken.status}
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleStatusUpdate(currentToken.id, "completed")}
                                                        className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all font-medium"
                                                    >
                                                        <CheckCircle size={20} className="mr-2" /> Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(currentToken.id, "skipped")}
                                                        className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all font-medium"
                                                    >
                                                        <SkipForward size={20} className="mr-2" /> Skip
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                                <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500 font-medium">No token is currently being served.</p>
                                                <p className="text-sm text-gray-400">Call the next person from the waiting queue.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Waiting Queue */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <Users size={20} className="mr-2 text-gray-500" />
                                            Waiting Queue <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{waitingTokens.length}</span>
                                        </h2>
                                        {waitingTokens.length > 0 && !currentToken && (
                                            <button
                                                onClick={() => handleStatusUpdate(waitingTokens[0].id, "calling")}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-medium animate-pulse flex items-center"
                                            >
                                                <Play size={16} className="mr-2" /> Call Next #{waitingTokens[0].token_number}
                                            </button>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50">
                                                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="py-3 px-6 font-medium">Token</th>
                                                    <th className="py-3 px-6 font-medium">Name</th>
                                                    <th className="py-3 px-6 font-medium">Issued At</th>
                                                    <th className="py-3 px-6 text-right font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {waitingTokens.map(t => (
                                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-6 font-bold text-gray-800">#{t.token_number}</td>
                                                        <td className="py-4 px-6 text-gray-600">
                                                            <div>{t.visitor_name || "User"}</div>
                                                            {t.appointment_time && (
                                                                <div className="text-xs text-blue-600 font-medium mt-1">
                                                                    Slot: {t.appointment_time.substring(0, 5)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-500 text-sm">{new Date(t.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button
                                                                onClick={() => handleStatusUpdate(t.id, "calling")}
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                                            >
                                                                Call Now
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {waitingTokens.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="py-8 text-center text-gray-500 italic">Queue is empty.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Skipped / On Hold Queue */}
                                {tokens.some(t => t.status === "skipped") && (
                                    <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden mt-6">
                                        <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-50">
                                            <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                                                <Clock size={20} className="mr-2" />
                                                On Hold / Skipped
                                            </h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <tbody className="divide-y divide-orange-100">
                                                    {tokens.filter(t => t.status === "skipped").map(t => (
                                                        <tr key={t.id} className="hover:bg-orange-50/50 transition-colors">
                                                            <td className="py-3 px-6 font-bold text-gray-800">#{t.token_number}</td>
                                                            <td className="py-3 px-6 text-gray-600">{t.visitor_name || "User"}</td>
                                                            <td className="py-3 px-6 text-right">
                                                                <button
                                                                    onClick={() => handleStatusUpdate(t.id, "calling")}
                                                                    className="px-3 py-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded text-xs font-semibold"
                                                                >
                                                                    Recall
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Completed / Served History */}
                                {tokens.some(t => t.status === "completed") && (
                                    <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden mt-6">
                                        <div className="p-4 border-b border-green-100 flex justify-between items-center bg-green-50">
                                            <h2 className="text-lg font-semibold text-green-800 flex items-center">
                                                <CheckCircle size={20} className="mr-2" />
                                                Called Members / Served
                                            </h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <tbody className="divide-y divide-green-100">
                                                    {tokens.filter(t => t.status === "completed").slice(0, 10).map(t => (
                                                        <tr key={t.id} className="hover:bg-green-50/50 transition-colors">
                                                            <td className="py-3 px-6 font-bold text-gray-800">#{t.token_number}</td>
                                                            <td className="py-3 px-6 text-gray-600">{t.visitor_name || "User"}</td>
                                                            <td className="py-3 px-6 text-gray-500 text-right text-sm">
                                                                Completed at {t.updated_at ? new Date(t.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
                                <Users size={48} className="mb-4 text-gray-300" />
                                <p className="font-medium">Select a service from the sidebar to manage the queue.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
