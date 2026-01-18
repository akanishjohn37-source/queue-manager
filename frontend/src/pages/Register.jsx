// src/pages/Register.jsx
import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, User, Lock, Phone, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleDobChange = (e) => {
    const selectedDate = e.target.value;
    setDob(selectedDate);
    if (selectedDate) {
      const birthDate = new Date(selectedDate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge.toString());
    } else {
      setAge("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!username || !password || !password2 || !phone || !age || !dob) {
      setMsg("Please complete all required fields");
      return;
    }
    if (password !== password2) {
      setMsg("Passwords do not match");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setMsg("Contact number must be exactly 10 digits");
      return;
    }
    if (parseInt(age) > 99) {
      setMsg("Maximum age eligibility is 99");
      return;
    }
    if (new Date(dob) >= new Date()) {
      setMsg("Invalid date of birth provided");
      return;
    }

    setLoading(true);
    try {
      await registerUser(username, password, password2, phone, age, dob);
      setMsg("Account established successfully!");
      // Reset
      setUsername(""); setPassword(""); setPassword2(""); setPhone(""); setAge(""); setDob("");
      setTimeout(() => nav("/login"), 2000);
    } catch (err) {
      console.error("Register error:", err);
      let m = err.message || "Establishment failed";
      try {
        const json = JSON.parse(m.split(":").slice(1).join(":"));
        m = json.username?.[0] || json.password?.[0] || json.phone?.[0] || json.age?.[0] || json.dob?.[0] || json.non_field_errors?.[0] || json.detail || m;
      } catch { }
      setMsg(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-20 px-6 bg-slate-50">
      <div className="premium-card p-10 w-full max-w-2xl animate-scale-in">
        <div className="text-center mb-12">
          <div className="bg-blue-600/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
            <UserPlus className="text-blue-600 w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Create Corporate Account</h2>
          <p className="text-slate-500 mt-3 font-medium text-lg">Join our professional network to manage your queue-events</p>
        </div>

        {msg && (
          <div className={`mb-10 p-5 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-fade-in ${msg.includes("successfully") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
            {msg.includes("successfully") ? <CheckCircle2 size={20} /> : null}
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Identity Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  className="premium-input !pl-12"
                  placeholder="Unique ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Contact Protocol (10-digit)</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  className="premium-input !pl-12"
                  type="text"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={18} />
                <input
                  className="premium-input !pl-12"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={dob}
                  onChange={handleDobChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Current Age</label>
              <input
                className="premium-input bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-mono"
                value={age}
                readOnly
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  className="premium-input !pl-12"
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Confirm Protocol</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  className="premium-input !pl-12"
                  type="password"
                  placeholder="Repeat password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-base flex items-center justify-center gap-3 group mt-6">
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-medium tracking-tight">
            Already have an active profile?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 decoration-blue-100 underline-offset-4 hover:underline">
              Access account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
