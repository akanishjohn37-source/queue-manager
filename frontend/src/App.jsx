import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Facebook, Linkedin, Youtube, LogOut, LayoutDashboard, Bell, User as UserIcon } from "lucide-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationPage from "./pages/NotificationPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import LandingPage from "./pages/LandingPage";

// --- Components ---

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const isProvider = localStorage.getItem("is_provider") === "true";
  const isStaff = localStorage.getItem("is_staff") === "true";
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const NavLink = ({ to, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`nav-link ${isActive ? 'active' : ''}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <header className="glass-nav">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 no-underline group">
              <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                <span className="text-2xl font-black text-white leading-none">Q</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 leading-none">QueueManager</span>
                <span className="text-[10px] font-medium text-blue-600 tracking-widest uppercase mt-0.5">Professional Edge</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn ? (
              <>
                {!isProvider && (
                  <>
                    <NavLink to="/user">BOOK TOKEN</NavLink>
                    <NavLink to="/notifications">LIVE STATUS</NavLink>
                  </>
                )}
                {(isStaff || isProvider) && (
                  <NavLink to="/provider">PROVIDER</NavLink>
                )}
                {isStaff && (
                  <NavLink to="/admin">ADMIN</NavLink>
                )}
                <div className="h-6 w-px bg-slate-200"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-500 transition-all bg-slate-50 hover:bg-red-50 rounded-lg group"
                >
                  <UserIcon size={14} className="opacity-50 group-hover:opacity-100" />
                  <span className="truncate max-w-[100px]">{username}</span>
                  <LogOut size={14} className="opacity-50 group-hover:opacity-100" />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">LOGIN</NavLink>
                <Link to="/register">
                  <button className="btn-gold !py-2 !px-5 text-sm uppercase tracking-wider">Join Now</button>
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 focus:outline-none md:hidden bg-slate-100 rounded-lg transition-colors hover:bg-slate-200">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-40 transform transition-all duration-500 ease-in-out pt-28 px-8 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} md:hidden`}>
        <div className="flex flex-col gap-8 items-center text-center">
          {isLoggedIn ? (
            <>
              {!isProvider && (
                <>
                  <NavLink to="/user" onClick={() => setIsMenuOpen(false)}>BOOK TOKEN</NavLink>
                  <NavLink to="/notifications" onClick={() => setIsMenuOpen(false)}>LIVE STATUS</NavLink>
                </>
              )}
              {(isStaff || isProvider) && (
                <NavLink to="/provider" onClick={() => setIsMenuOpen(false)}>PROVIDER</NavLink>
              )}
              {isStaff && (
                <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>ADMIN</NavLink>
              )}
              <div className="w-full h-px bg-slate-100 mt-4"></div>
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full text-center font-bold text-red-500 py-4 flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                LOGOUT ({username})
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>LOGIN</NavLink>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full">
                <button className="btn-gold w-full text-center">REGISTER NOW</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-20 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-6 grayscale brightness-200 opacity-80">
            <div className="bg-white p-1.5 rounded-lg">
              <span className="text-xl font-black text-slate-900 leading-none">Q</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">QueueManager</span>
          </div>
          <p className="text-sm leading-relaxed max-w-md mx-auto md:mx-0">
            Redefining patient waiting experiences through innovative token management and real-time tracking solutions. Built for professionals, designed for care.
          </p>
          <div className="flex gap-4 mt-8 justify-center md:justify-start">
            {[Facebook, Linkedin, Youtube].map((Icon, idx) => (
              <a key={idx} href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navigation</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/login" className="hover:text-blue-400 transition-colors">Client Login</Link></li>
            <li><Link to="/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
            <li><Link to="/notifications" className="hover:text-blue-400 transition-colors">Live Dashboards</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <span>support@queuemanager.pro</span>
            </li>
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <span>+1 (800) Q-MANAGER</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium uppercase tracking-widest">
        <p>© {new Date().getFullYear()} QueueManager Global. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <NavBar />
      <main className="flex-grow animate-fade-in">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const isStaff = localStorage.getItem("is_staff") === "true";
  return isStaff ? children : <Navigate to="/user" replace />;
}

function ProviderRoute({ children }) {
  const isProvider = localStorage.getItem("is_provider") === "true";
  return isProvider || localStorage.getItem("is_staff") === "true" ? children : <Navigate to="/user" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </PrivateRoute>
          } />
          <Route path="/notifications" element={
            <PrivateRoute>
              <NotificationPage />
            </PrivateRoute>
          } />
          <Route path="/provider" element={
            <PrivateRoute>
              <ProviderRoute>
                <ProviderDashboard />
              </ProviderRoute>
            </PrivateRoute>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
