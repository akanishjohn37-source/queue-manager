import React, { useState, useEffect } from "react";
import { fetchProviders, fetchServices, fetchTokensByService } from "../api";
import { Monitor, Clock, Users } from "lucide-react";

export default function NotificationPage() {
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [tokens, setTokens] = useState([]);

    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedService, setSelectedService] = useState("");

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
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
            <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Monitor className="text-blue-400" />
                    Live Queue Status
                </h1>
                <div className="text-gray-400 text-sm">
                    {new Date().toLocaleDateString()}
                </div>
            </header>

            {/* Selection Controls (Hidden if set via URL params in future, but visible for now) */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-700">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Hospital</label>
                    <select
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                        value={selectedProvider}
                        onChange={(e) => {
                            setSelectedProvider(e.target.value);
                            setSelectedService("");
                        }}
                    >
                        <option value="">-- Choose Hospital --</option>
                        {providers.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Service</label>
                    <select
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        disabled={!selectedProvider}
                    >
                        <option value="">-- Choose Service --</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Live Display */}
            {selectedService ? (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Token - Main Focus */}
                    <div className="flex flex-col justify-center items-center bg-blue-600 rounded-2xl shadow-2xl p-12 text-center transform transition-all animate-fade-in">
                        <h2 className="text-3xl font-semibold mb-6 uppercase tracking-widest opacity-80">Now Serving</h2>
                        {currentToken ? (
                            <div className="animate-pulse-slow">
                                <div className="text-9xl font-black mb-4 tracking-tighter">#{currentToken.token_number}</div>
                                <div className="text-4xl font-light opacity-90">{currentToken.visitor_name || "Guest"}</div>
                            </div>
                        ) : (
                            <div className="text-3xl opacity-60 font-light flex flex-col items-center">
                                <Clock size={64} className="mb-4 opacity-50" />
                                Please Wait...
                            </div>
                        )}
                    </div>

                    {/* Waiting List & History */}
                    <div className="space-y-6 flex flex-col">
                        {/* Upcoming */}
                        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex-1 border border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                <Users className="text-yellow-500" />
                                Up Next
                            </h3>
                            {waitingTokens.length === 0 ? (
                                <p className="text-gray-500 italic">No tokens waiting.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {waitingTokens.slice(0, 6).map((t, index) => (
                                        <li key={t.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-500">
                                            <span className="font-bold text-2xl text-white">#{t.token_number}</span>
                                            <span className="text-gray-300 text-lg">{t.visitor_name || "Guest"}</span>
                                        </li>
                                    ))}
                                    {waitingTokens.length > 6 && (
                                        <li className="text-center text-gray-500 text-sm pt-2">
                                            + {waitingTokens.length - 6} more waiting...
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* Recent History */}
                        {completedTokens.length > 0 && (
                            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-400 mb-3">Recently Completed</h3>
                                <div className="flex flex-wrap gap-3">
                                    {completedTokens.slice(0, 8).map((t) => (
                                        <span key={t.id} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-600">
                                            #{t.token_number}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <Monitor size={64} className="mb-4 opacity-20" />
                    <p className="text-xl">Select a hospital and service to view the live queue.</p>
                </div>
            )}
        </div>
    );
}

