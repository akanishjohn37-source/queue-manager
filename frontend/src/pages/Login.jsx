// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { loginUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, User, Lock, LogOut, LayoutDashboard, ArrowRight } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      setIsLoggedIn(false);
      setCurrentUser("");
      setUsername("");
      setPassword("");
      setMsg("Logged out successfully");
    }
  };

  const handleGoToDashboard = () => {
    const isStaff = localStorage.getItem("is_staff") === "true";
    const isProvider = localStorage.getItem("is_provider") === "true";
    if (isProvider) nav("/provider");
    else if (isStaff) nav("/admin");
    else nav("/user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await loginUser(username, password);
      // Success redirect logic in loginUser usually sets storage
      const isStaff = localStorage.getItem("is_staff") === "true";
      const isProvider = localStorage.getItem("is_provider") === "true";

      if (isProvider) nav("/provider");
      else if (isStaff) nav("/admin");
      else nav("/user");
    } catch (err) {
      console.error("Login error:", err);
      let m = err.message || "Login failed";
      try {
        const json = JSON.parse(m.split(":").slice(1).join(":"));
        m = json.detail || json.non_field_errors?.[0] || m;
      } catch { }
      setMsg(m);
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] px-6">
        <div className="premium-card p-10 w-full max-w-md text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 transition-transform hover:rotate-0 duration-300">
            <User className="text-blue-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
          <p className="text-slate-500 mb-8">
            Signed in as <span className="font-bold text-blue-600">{currentUser}</span>
          </p>

          <div className="space-y-4">
            <button onClick={handleGoToDashboard} className="btn-primary w-full flex items-center justify-center gap-2 group">
              <LayoutDashboard size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Enter Dashboard</span>
              <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={handleLogout} className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 rounded-xl">
              <LogOut size={18} />
              <span>Log out of session</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="premium-card p-10 w-full max-w-md animate-scale-in">
        <div className="text-center mb-10">
          <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Login</h2>
          <p className="text-slate-500 mt-2 font-medium">Please enter your credentials to proceed</p>
        </div>

        {msg && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-medium animate-fade-in ${msg.includes("successful") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-slate-400">
                <User size={18} />
              </div>
              <input
                className="premium-input !pl-12"
                placeholder="Ex: jsmith_23"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">Secret Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                className="premium-input !pl-12"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-3 group">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New to our platform?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold decoration-blue-200 underline-offset-4 hover:underline">
              Start your application
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
