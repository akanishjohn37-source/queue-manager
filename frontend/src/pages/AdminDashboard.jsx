import React, { useState, useEffect, useRef } from "react";
import { fetchServices, fetchTokensByService, updateTokenStatus, fetchProviders, apiPost } from "../api";
import { LayoutDashboard, Building2, Stethoscope, Users, Plus, Trash2, Edit, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("queue");
  const [message, setMessage] = useState("");

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 hidden md:block">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            Admin Panel
          </h2>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab("queue")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "queue" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Clock size={20} />
            <span>Queue Management</span>
          </button>
          <button
            onClick={() => setActiveTab("providers")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "providers" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Building2 size={20} />
            <span>Hospitals</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "services" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Stethoscope size={20} />
            <span>Services</span>
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "search" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Search size={20} />
            <span>User Search</span>
          </button>
        </nav>
      </div>

      {/* Mobile Tab Bar (Visible only on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-10">
        <button onClick={() => setActiveTab("queue")} className={`p-2 flex flex-col items-center ${activeTab === "queue" ? "text-blue-600" : "text-gray-500"}`}>
          <Clock size={20} />
          <span className="text-xs mt-1">Queue</span>
        </button>
        <button onClick={() => setActiveTab("providers")} className={`p-2 flex flex-col items-center ${activeTab === "providers" ? "text-blue-600" : "text-gray-500"}`}>
          <Building2 size={20} />
          <span className="text-xs mt-1">Hospitals</span>
        </button>
        <button onClick={() => setActiveTab("services")} className={`p-2 flex flex-col items-center ${activeTab === "services" ? "text-blue-600" : "text-gray-500"}`}>
          <Stethoscope size={20} />
          <span className="text-xs mt-1">Services</span>
        </button>
        <button onClick={() => setActiveTab("search")} className={`p-2 flex flex-col items-center ${activeTab === "search" ? "text-blue-600" : "text-gray-500"}`}>
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {message && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-2 border border-blue-100 shadow-sm animate-fade-in-down">
              <AlertCircle size={20} />
              {message}
            </div>
          )}

          {activeTab === "queue" && <QueueTab setMessage={setMessage} />}
          {activeTab === "providers" && <ProvidersTab setMessage={setMessage} />}
          {activeTab === "services" && <ServicesTab setMessage={setMessage} />}
          {activeTab === "search" && <UserSearchTab setMessage={setMessage} />}
        </div>
      </div>
    </div>
  );
}

function QueueTab({ setMessage }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [queue, setQueue] = useState([]);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchServices().then(setServices).catch(() => setMessage("Failed to load services"));
  }, [setMessage]);

  const loadQueue = async () => {
    if (!selectedService) {
      setQueue([]);
      return;
    }
    try {
      const data = await fetchTokensByService(selectedService);
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!selectedService) return;
    loadQueue();
    pollingRef.current = setInterval(loadQueue, 4000);
    return () => clearInterval(pollingRef.current);
  }, [selectedService]);

  const handleStatus = async (id, status) => {
    try {
      await updateTokenStatus(id, status);
      loadQueue();
    } catch (err) {
      setMessage("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Queue Monitor</h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service to Monitor</label>
          <select
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-white border"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">-- Select Service --</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.provider_name})</option>)}
          </select>
        </div>
      </div>

      {selectedService && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">Live Queue</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{queue.length} Tokens</span>
          </div>

          {queue.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p>No tokens in the queue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="py-3 px-6 font-medium">Token</th>
                    <th className="py-3 px-6 font-medium">Visitor</th>
                    <th className="py-3 px-6 font-medium">Status</th>
                    <th className="py-3 px-6 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queue.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-800">#{t.token_number}</td>
                      <td className="py-4 px-6 text-gray-600">{t.visitor_name || "Guest"}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                          ${t.status === 'calling' ? 'bg-green-100 text-green-800' :
                            t.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {t.status === "waiting" && (
                          <button onClick={() => handleStatus(t.id, "calling")} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Call</button>
                        )}
                        {(t.status === "calling" || t.status === "waiting") && (
                          <button onClick={() => handleStatus(t.id, "completed")} className="text-green-600 hover:text-green-800 font-medium text-sm">Complete</button>
                        )}
                        <button onClick={() => handleStatus(t.id, "skipped")} className="text-gray-500 hover:text-gray-700 font-medium text-sm">Skip</button>
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
  );
}

function ProvidersTab({ setMessage }) {
  const [providers, setProviders] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const load = () => fetchProviders().then(setProviders).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name) return setMessage("Name required");
    try {
      await apiPost("/providers/", { name, location });
      setMessage("Hospital added successfully!");
      setName(""); setLocation("");
      load();
    } catch (err) {
      setMessage("Failed to create provider");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-blue-600" />
            Add Hospital
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
              <input
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                placeholder="e.g. City General"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                placeholder="e.g. Downtown"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Create Hospital
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-800">Existing Hospitals</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {providers.map(p => (
              <li key={p.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Building2 size={14} />
                    {p.location || "No location specified"}
                  </div>
                </div>
                <div className="text-gray-400">
                  {/* Future: Add Edit/Delete actions here */}
                </div>
              </li>
            ))}
            {providers.length === 0 && (
              <li className="p-8 text-center text-gray-500 italic">No hospitals found. Add one to get started.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ServicesTab({ setMessage }) {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [name, setName] = useState("");
  const [providerId, setProviderId] = useState("");

  const load = () => fetchServices().then(setServices).catch(console.error);
  useEffect(() => {
    load();
    fetchProviders().then(setProviders).catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!name || !providerId) return setMessage("Name and Hospital required");
    try {
      await apiPost("/services/", { name, provider: providerId });
      setMessage("Service created successfully!");
      setName("");
      load();
    } catch (err) {
      setMessage("Failed to create service");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-green-600" />
            Add Service
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2.5 border bg-white"
                value={providerId}
                onChange={e => setProviderId(e.target.value)}
              >
                <option value="">-- Select Hospital --</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2.5 border"
                placeholder="e.g. Cardiology"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Create Service
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-800">Existing Services</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {services.map(s => (
              <li key={s.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{s.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Building2 size={14} />
                    {s.provider_name}
                  </div>
                </div>
              </li>
            ))}
            {services.length === 0 && (
              <li className="p-8 text-center text-gray-500 italic">No services found. Add one to get started.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function UserSearchTab({ setMessage }) {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [tokens, setTokens] = useState([]);

  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProviders().then(setProviders).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProvider) {
      setServices([]);
      setSelectedService("");
      return;
    }
    fetchServices(selectedProvider).then(setServices).catch(console.error);
  }, [selectedProvider]);

  useEffect(() => {
    if (!selectedService) {
      setTokens([]);
      return;
    }
    setLoading(true);
    fetchTokensByService(selectedService)
      .then(setTokens)
      .catch(err => {
        console.error(err);
        setMessage("Failed to fetch tokens");
      })
      .finally(() => setLoading(false));
  }, [selectedService]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Search size={24} className="text-blue-600" />
          Search Users
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
            <select
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-white"
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
            >
              <option value="">-- Select Hospital --</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
            <select
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-white"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              disabled={!selectedProvider}
            >
              <option value="">-- Select Service --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedService && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">Search Results</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tokens.length} Found</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : tokens.length === 0 ? (
            <div className="p-12 text-center text-gray-500 italic">No users found for this service.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="py-3 px-6 font-medium">Token</th>
                    <th className="py-3 px-6 font-medium">Visitor Name</th>
                    <th className="py-3 px-6 font-medium">Appointment</th>
                    <th className="py-3 px-6 font-medium">Status</th>
                    <th className="py-3 px-6 font-medium">Issued At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tokens.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-800">#{t.token_number}</td>
                      <td className="py-4 px-6 text-gray-600">{t.visitor_name || "Guest"}</td>
                      <td className="py-4 px-6 text-blue-600 font-medium">
                        {t.appointment_time ? t.appointment_time.substring(0, 5) : "Walk-in"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                                ${t.status === 'calling' ? 'bg-green-100 text-green-800' :
                            t.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {new Date(t.issued_at).toLocaleString()}
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
  );
}
