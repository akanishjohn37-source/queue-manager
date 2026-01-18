import React, { useState, useEffect, useRef } from "react";
import { fetchServices, fetchTokensByService, updateTokenStatus, fetchProviders, apiPost, apiDelete, fetchAllAssignments } from "../api";
import { LayoutDashboard, Building2, Stethoscope, Users, Plus, Trash2, Edit, CheckCircle, Clock, AlertCircle, Search, Zap, ArrowRight, ShieldCheck, UserPlus, Eye, EyeOff, MapPin, Unplug, ClipboardList } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("queue");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const NavItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-bold text-sm tracking-tight ${activeTab === id
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`}
    >
      <Icon size={18} className={activeTab === id ? "animate-pulse" : ""} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">Admin Control</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mt-1">Institutional Root</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-3">
          <NavItem id="queue" label="Queue Monitoring" icon={Clock} />
          <NavItem id="providers" label="Hospital Instances" icon={Building2} />
          <NavItem id="services" label="Service Matrix" icon={Stethoscope} />
          <NavItem id="staff" label="Operation Staff" icon={Users} />
          <NavItem id="registry" label="Staff Registry" icon={ClipboardList} />
        </nav>

        <div className="p-8 border-t border-slate-50 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
          QueueManager Elite V2.0
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-slate-200 flex justify-around p-3 z-50 rounded-[2rem] shadow-2xl">
        {[
          { id: 'queue', icon: Clock },
          { id: 'services', icon: Stethoscope },
          { id: 'staff', icon: Users },
          { id: 'registry', icon: ClipboardList },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3 rounded-2xl transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-400"}`}>
            <item.icon size={20} />
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:p-12 p-6 animate-fade-in pb-32">
        <div className="max-w-6xl mx-auto space-y-10">
          {message && (
            <div className="p-5 rounded-2xl flex items-center gap-4 bg-blue-50 text-blue-700 border border-blue-100 shadow-xl shadow-blue-500/5 animate-scale-in font-bold text-sm">
              <Zap size={20} className="animate-pulse" />
              {message}
            </div>
          )}

          <div className="premium-card p-10 bg-white">
            {activeTab === "queue" && <QueueTab setMessage={setMessage} />}
            {activeTab === "providers" && <ProvidersTab setMessage={setMessage} />}
            {activeTab === "services" && <ServicesTab setMessage={setMessage} />}
            {activeTab === "staff" && <StaffTab setMessage={setMessage} />}
            {activeTab === "registry" && <StaffRegistryTab setMessage={setMessage} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal Tabs with consistent premium styling
function QueueTab({ setMessage }) {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [queue, setQueue] = useState([]);
  const pollingRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const provs = await fetchProviders();
        setProviders(provs);
      } catch { }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedProvider) {
      setServices([]);
      setSelectedService("");
      return;
    }
    fetchServices(selectedProvider).then(setServices);
    setSelectedService(""); // Reset service when provider changes
  }, [selectedProvider]);

  const loadQueue = async () => {
    if (!selectedService) return setQueue([]);
    try {
      const data = await fetchTokensByService(selectedService);
      setQueue(Array.isArray(data) ? data : []);
    } catch { }
  };

  useEffect(() => {
    if (!selectedService) {
      setQueue([]);
      return;
    }
    loadQueue();
    pollingRef.current = setInterval(loadQueue, 5000);
    return () => clearInterval(pollingRef.current);
  }, [selectedService]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-50 pb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Queue Registry</h2>
          <p className="text-slate-400 font-medium">Real-time surveillance of service streams.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <select
              className="premium-input !py-4 font-bold tracking-tight appearance-none cursor-pointer"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="">Select Hospital</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-64">
            <select
              className="premium-input !py-4 font-bold tracking-tight appearance-none cursor-pointer disabled:opacity-50"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              disabled={!selectedProvider}
            >
              <option value="">{selectedProvider ? "Select Stream specialty" : "Select Hospital First"}</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedService ? (
        <div className="animate-fade-in space-y-6">
          {queue.length === 0 ? (
            <div className="py-32 text-center opacity-20 flex flex-col items-center gap-4">
              <Users size={80} />
              <p className="font-black uppercase tracking-widest text-xs">No active nodes in buffer</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm bg-white">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="py-5 px-8">Sequence</th>
                    <th className="py-5 px-8">Identity</th>
                    <th className="py-5 px-8">Appointment</th>
                    <th className="py-5 px-8">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queue.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all font-bold text-slate-700">
                      <td className="py-6 px-8 text-2xl font-black text-blue-600 tracking-tighter">#{t.token_number}</td>
                      <td className="py-6 px-8">
                        <div>{t.visitor_name || "GUEST"}</div>
                        <div className="text-[10px] text-slate-400 font-mono pt-1">ID: {t.id}</div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-900 text-xs">
                            <span className="opacity-50">📅</span> {t.appointment_date || "Walk-in"}
                          </div>
                          {t.appointment_time && (
                            <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                              <span className="opacity-50">⏰</span> {t.appointment_time}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${t.status === 'calling' ? 'bg-emerald-100 text-emerald-700' :
                            t.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
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
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-slate-300 gap-4">
          <LayoutDashboard size={64} className="opacity-20 animate-pulse" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Select Scope</h3>
            <p className="text-xs font-bold text-slate-300">Choose a Hospital and Specialty above <br /> to access real-time queue telemetry.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProvidersTab({ setMessage }) {
  const [providers, setProviders] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const load = () => fetchProviders().then(setProviders);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name) return setMessage("Hospital identifier required");
    try {
      await apiPost("/providers/", { name, location });
      setMessage("Instance successfully deployed to global registry.");
      setName(""); setLocation("");
      load();
    } catch { setMessage("Instance deployment failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this hospital?")) return;
    try {
      await apiDelete(`/providers/${id}/`);
      setMessage("Hospital removed from registry.");
      load();
    } catch { setMessage("Deletion failed"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Register Institution</h3>
          <p className="text-slate-500 font-medium">Add a new hospital instance to the system network.</p>
        </div>
        <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hospital Name</label>
            <input className="premium-input" placeholder="e.g. Apollo Elite" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Location</label>
            <input className="premium-input" placeholder="e.g. Manhattan District" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <button onClick={handleCreate} className="btn-primary w-full shadow-blue-500/20 py-4 flex items-center justify-center gap-3">
            <Plus size={20} /> Add Hospital
          </button>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="bg-[#fcfcfc] rounded-[2rem] border border-slate-100 p-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
            <Building2 size={20} className="text-blue-600" /> Active Registry
          </h3>
          <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {providers.map(p => (
              <div key={p.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-lg tracking-tight">{p.name}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {p.location || "GLOBAL_CLUSTER"}
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
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

  const load = () => fetchServices().then(setServices);
  useEffect(() => {
    load();
    fetchProviders().then(setProviders);
  }, []);

  const handleCreate = async () => {
    if (!name || !providerId) return setMessage("Identifier and Provider binding required");
    try {
      await apiPost("/services/", { name, provider: providerId });
      setMessage("Matrix specialty service established.");
      setName(""); load();
    } catch { setMessage("Service creation failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service stream?")) return;
    try {
      await apiDelete(`/services/${id}/`);
      setMessage("Service stream removed.");
      load();
    } catch { setMessage("Deletion failed"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Initialize Specialty</h3>
          <p className="text-slate-500 font-medium">Create and bind new specialty services to institutions.</p>
        </div>
        <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Host</label>
            <select className="premium-input appearance-none cursor-pointer" value={providerId} onChange={e => setProviderId(e.target.value)}>
              <option value="">Select Host Hospital</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialty Name</label>
            <input className="premium-input" placeholder="e.g. Neuro-Surgery" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <button onClick={handleCreate} className="btn-primary w-full shadow-emerald-500/10 bg-emerald-600 hover:bg-emerald-700 py-4 flex items-center justify-center gap-3">
            <Plus size={20} /> Establish Specialty
          </button>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="bg-[#fcfcfc] rounded-[2rem] border border-slate-100 p-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
            <Stethoscope size={20} className="text-blue-600" /> Service Matrix
          </h3>
          <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {services.map(s => (
              <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-lg tracking-tight">{s.name}</div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    {s.provider_name}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:text-blue-600"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
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
    fetchProviders().then(setProviders);
  }, []);

  useEffect(() => {
    if (!selectedProvider) return setServices([]);
    fetchServices(selectedProvider).then(setServices);
  }, [selectedProvider]);

  useEffect(() => {
    if (!selectedService) return setTokens([]);
    setLoading(true);
    fetchTokensByService(selectedService).then(setTokens).finally(() => setLoading(false));
  }, [selectedService]);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
          <Search size={32} className="text-blue-600" /> Global User Search
        </h2>
        <p className="text-slate-500 font-medium">Query the centralized registry for identity across all service streams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Filter</label>
          <select
            className="premium-input appearance-none bg-white cursor-pointer"
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value)}
          >
            <option value="">Select Hospital</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stream Specialty</label>
          <select
            className="premium-input appearance-none bg-white cursor-pointer disabled:opacity-50"
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            disabled={!selectedProvider}
          >
            <option value="">Select Department</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {selectedService && (
        <div className="animate-fade-in overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white">
          <div className="flex justify-between items-center p-8 bg-slate-50/50">
            <h3 className="text-lg font-black tracking-tight text-slate-900">Search Results</h3>
            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{tokens.length} Matches Found</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div>
          ) : tokens.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No entries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-5 px-8">Serial</th>
                    <th className="py-5 px-8">Full Identity</th>
                    <th className="py-5 px-8">Status</th>
                    <th className="py-5 px-8 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tokens.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-8 text-2xl font-black text-blue-600 tracking-tighter">#{t.token_number}</td>
                      <td className="py-6 px-8 font-black text-slate-800 tracking-tight">{t.visitor_name || "GUEST"}</td>
                      <td className="py-6 px-8">
                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-500">{t.status}</span>
                      </td>
                      <td className="py-6 px-8 text-right text-xs font-bold text-slate-400">{new Date(t.issued_at).toLocaleString()}</td>
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

function StaffTab({ setMessage }) {
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState(new Set());
  const [assignedServices, setAssignedServices] = useState(new Set());
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const loadData = async () => {
    try {
      const { fetchStaff } = await import("../api");
      const [staff, provs, assignments] = await Promise.all([fetchStaff(), fetchProviders(), fetchAllAssignments()]);
      setStaffList(staff);
      setProviders(provs);
      setAssignments(assignments);

      const assignedSet = new Set(assignments.map(a => a.user));
      setAssignedStaff(assignedSet);

      const assignedServiceSet = new Set(assignments.map(a => a.service));
      setAssignedServices(assignedServiceSet);
    } catch { }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedProvider) return setServices([]);
    fetchServices(selectedProvider).then(setServices);
  }, [selectedProvider]);

  const handleCreateStaff = async () => {
    if (!username || !password) return setMessage("Credential set incomplete");
    try {
      const { createStaff } = await import("../api");
      await createStaff({ username, email, password });
      setMessage("Staff node established in network.");
      setUsername(""); setEmail(""); setPassword("");
      loadData();
    } catch (err) {
      let msg = "Staff creation failed";
      if (err.body) {
        const parts = [];
        for (const [key, val] of Object.entries(err.body)) {
          const valStr = Array.isArray(val) ? val.join(" ") : String(val);
          parts.push(`${key}: ${valStr}`);
        }
        if (parts.length > 0) msg = "Failed: " + parts.join(" | ");
      }
      setMessage(msg);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff || !selectedService) return setMessage("Select Staff and Specialty target");
    try {
      const { assignStaff } = await import("../api");
      await assignStaff(selectedStaff, selectedService);
      setMessage("Staff assigned to Specialty Stream.");
      setSelectedStaff(""); setSelectedService(""); setSelectedProvider("");
    } catch { setMessage("Assignment operation failed"); }
  };

  // Removed delete and unassign handlers from here as they are now in the Registry tab

  return (
    <div className="grid grid-cols-1 lg:grid-cols-11 gap-12">
      <div className="lg:col-span-5 space-y-12">
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <UserPlus size={24} className="text-purple-600" /> Provision Account
          </h3>
          <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label><input className="premium-input" value={username} onChange={e => setUsername(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Corporate Email</label><input className="premium-input" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Protocol</label>
              <div className="relative">
                <input
                  className="premium-input pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button onClick={handleCreateStaff} className="btn-primary w-full bg-slate-900 border-none hover:bg-black py-4">Establish Staff Node</button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 border-r border-slate-100 hidden lg:block"></div>

      <div className="lg:col-span-5 space-y-12">
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Zap size={24} className="text-blue-600" /> Matrix Assignment
          </h3>
          <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Staff Node</label>
              <select className="premium-input appearance-none bg-white cursor-pointer" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                <option value="">Choose Staff User</option>
                {staffList.map(u => {
                  const isAssigned = assignedStaff.has(u.id);
                  return (
                    <option key={u.id} value={u.id} disabled={isAssigned}>
                      {u.username} ({u.email}) {isAssigned ? '- Active Assignment' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Host Institution</label>
              <select className="premium-input appearance-none bg-white cursor-pointer" value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}>
                <option value="">Select Hospital</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Service Target</label>
              <select className="premium-input appearance-none bg-white cursor-pointer disabled:opacity-50" value={selectedService} onChange={e => setSelectedService(e.target.value)} disabled={!selectedProvider}>
                <option value="">Select Specialty</option>
                {services.map(s => {
                  const isAssigned = assignedServices.has(s.id);
                  return (
                    <option key={s.id} value={s.id} disabled={isAssigned}>
                      {s.name} {isAssigned ? '(Assigned)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <button onClick={handleAssign} className="btn-primary w-full py-4 shadow-xl shadow-blue-500/10">Execute Assignment</button>
          </div>
        </div>

        {null}
      </div>
    </div>
  );
}

function StaffRegistryTab({ setMessage }) {
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const loadData = async () => {
    try {
      const { fetchStaff, fetchAllAssignments } = await import("../api");
      const [staff, allAssignments] = await Promise.all([fetchStaff(), fetchAllAssignments()]);
      setStaffList(staff);
      setAssignments(allAssignments);
    } catch { }
  };

  useEffect(() => { loadData(); }, []);

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Remove this staff account? This will also remove any active assignments.")) return;
    try {
      await apiDelete(`/staff/${id}/`);
      setMessage("Staff node removed.");
      loadData();
    } catch { setMessage("Deletion failed"); }
  };

  const handleUnassign = async (assignmentId) => {
    if (!window.confirm("Revoke this service assignment?")) return;
    try {
      await apiDelete(`/service-staff/${assignmentId}/`);
      setMessage("Assignment revoked.");
      loadData();
    } catch { setMessage("Unassign operation failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
          <ClipboardList size={32} className="text-blue-600" /> Staff Registry
        </h2>
        <p className="text-slate-500 font-medium">Comprehensive directory of operational staff and service assignments.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="py-4 px-6">Identity</th>
              <th className="py-4 px-6">Assignment Context</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map(u => {
              const assign = assignments.find(a => a.user === u.id);
              return (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-500 font-bold text-xs uppercase w-8 h-8 flex items-center justify-center">
                        {u.username.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{u.username}</div>
                        <div className="text-[10px] font-bold text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {assign ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-tight">
                          <Building2 size={12} /> {assign.provider_name}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] pl-0.5">
                          <Stethoscope size={12} /> {assign.service_name} • <MapPin size={10} /> {assign.provider_location}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        Available
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      {assign && (
                        <button
                          onClick={() => handleUnassign(assign.id)}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Revoke Assignment (Unassign)"
                        >
                          <Unplug size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteStaff(u.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Staff Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {staffList.length === 0 && (
              <tr>
                <td colSpan="3" className="py-8 text-center text-xs text-slate-400 italic">No staff nodes detected in registry</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
