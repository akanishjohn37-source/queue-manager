import React, { useEffect, useState, useRef } from "react";
import { fetchProviders, fetchServices, fetchTokensByService, createToken } from "../api";
import { Building2, Stethoscope, User, Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";

import HospitalDirectory from "../components/HospitalDirectory";

export default function UserDashboard() {
  const [viewMode, setViewMode] = useState("book"); // "book" or "directory"
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [visitorName, setVisitorName] = useState("");

  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState("");
  const [myTokens, setMyTokens] = useState([]); // Track tokens created in this session

  // Load Providers
  useEffect(() => {
    fetchProviders().then(setProviders).catch(() => setMessage("Failed to load hospitals"));
  }, []);

  // Load Services when Provider changes
  useEffect(() => {
    if (!selectedProvider) {
      setServices([]);
      return;
    }
    fetchServices(selectedProvider).then(setServices).catch(() => setMessage("Failed to load services"));
  }, [selectedProvider]);

  // Poll Queue
  const loadQueue = () => {
    if (!selectedService) {
      setQueue([]);
      return;
    }
    fetchTokensByService(selectedService)
      .then((data) => {
        setQueue(data);
      })
      .catch(() => setMessage("Failed to load queue"));
  };

  useEffect(() => {
    if (!selectedService) return;
    loadQueue();
    const id = setInterval(loadQueue, 5000);
    return () => clearInterval(id);
  }, [selectedService]);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = () => {
    // Simple beep sound (Base64)
    const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3");
    audio.play().catch(e => console.error("Audio play failed:", e));
  };

  const notifyUser = (token) => {
    if (Notification.permission === "granted") {
      new Notification("Token Called!", {
        body: `Token #${token.token_number} for ${token.visitor_name} is now being served!`,
        icon: "/vite.svg"
      });
    }
    playNotificationSound();
  };

  // Monitor Queue for Status Changes
  useEffect(() => {
    if (queue.length === 0) return;

    setMyTokens(prevTokens => {
      let hasChanges = false;
      const newTokens = prevTokens.map(t => {
        const match = queue.find(q => q.id === t.id);
        if (match && match.status !== t.status) {
          hasChanges = true;
          // Trigger notification if status changes to 'calling'
          if (match.status === 'calling' && t.status === 'waiting') {
            notifyUser(match);
          }
          return match;
        }
        return t;
      });
      return hasChanges ? newTokens : prevTokens;
    });
  }, [queue]);

  const handleCreateToken = async () => {
    if (!selectedService || !visitorName || !selectedTime) {
      setMessage("Please select a hospital, service, time slot, and enter a name.");
      return;
    }
    try {
      const token = await createToken(selectedService, visitorName, selectedTime);
      setMessage(`Success! Your token number is #${token.token_number} for ${selectedTime}`);
      setMyTokens(prev => [...prev, token]);
      setVisitorName(""); // Clear name for next booking
      setSelectedTime(""); // Clear time
      loadQueue();
    } catch (err) {
      console.error(err);
      setMessage("Error generating token");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="text-gray-500 mt-1">Book tokens and view hospital details</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("book")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "book" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
          >
            Book Token
          </button>
          <button
            onClick={() => setViewMode("directory")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "directory" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
          >
            Hospital Directory
          </button>
        </div>
      </div>

      {viewMode === "directory" ? (
        <HospitalDirectory />
      ) : (
        <>
          {message && (
            <div className={`max-w-4xl mx-auto p-4 rounded-lg flex items-center space-x-2 ${message.includes("Success") ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
              {message.includes("Success") ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message}</span>
            </div>
          )}

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Booking Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Ticket className="text-blue-600" />
                <span>New Booking</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                      value={selectedProvider}
                      onChange={(e) => {
                        setSelectedProvider(e.target.value);
                        setSelectedService("");
                      }}
                    >
                      <option value="">-- Choose Hospital --</option>
                      {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      disabled={!selectedProvider}
                    >
                      <option value="">-- Choose Service --</option>
                      {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter name"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"].map((time, index) => {
                        // VIBGYOR Colors Mapping
                        const colors = [
                          "bg-violet-500 hover:bg-violet-600", // 8-9
                          "bg-indigo-500 hover:bg-indigo-600", // 9-10
                          "bg-blue-500 hover:bg-blue-600",     // 10-11
                          "bg-green-500 hover:bg-green-600",   // 11-12
                          "bg-yellow-500 hover:bg-yellow-600", // 12-13
                          "bg-orange-500 hover:bg-orange-600", // 13-14
                          "bg-red-500 hover:bg-red-600"        // 14-15
                        ];
                        // Map index to color group (approx 2 slots per hour)
                        const colorClass = colors[Math.floor(index / 2)] || "bg-gray-500";
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 px-1 rounded text-white text-xs font-bold transition-all transform ${isSelected ? "ring-4 ring-offset-1 ring-gray-400 scale-105" : ""
                              } ${colorClass}`}
                          >
                            {time}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <button
                  onClick={handleCreateToken}
                  className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex justify-center items-center space-x-2 mt-4"
                >
                  <span>Generate Token</span>
                </button>
              </div>
            </div>

            {/* My Recent Tokens */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Clock className="text-blue-600" />
                <span>My Recent Tokens</span>
              </h2>

              <div className="flex-grow overflow-y-auto pr-2">
                {myTokens.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <Ticket size={48} className="opacity-20" />
                    <p>No tokens booked yet</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {myTokens.map((t) => (
                      <li key={t.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center hover:bg-blue-50 transition-colors">
                        <div>
                          <div className="font-bold text-blue-700 text-lg">#{t.token_number}</div>
                          <div className="text-gray-600 text-sm">{t.visitor_name}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                          ${t.status === 'completed' ? 'bg-green-100 text-green-800' :
                            t.status === 'calling' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {t.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Current Queue Display */}
          {selectedService && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Current Queue Status</h2>
              {queue.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tokens in queue currently.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-gray-500 text-sm uppercase tracking-wider">
                        <th className="py-3 px-4">Token</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {queue.map((t) => (
                        <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${t.status === 'calling' ? 'bg-blue-50' : ''}`}>
                          <td className="py-3 px-4 font-bold text-gray-800">#{t.token_number}</td>
                          <td className="py-3 px-4 text-gray-600">{t.visitor_name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase
                              ${t.status === 'calling' ? 'bg-green-100 text-green-800' :
                                t.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'}`}>
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
        </>
      )}
    </div>
  );
}

