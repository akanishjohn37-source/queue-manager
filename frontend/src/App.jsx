import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Facebook, Linkedin, Youtube } from "lucide-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationPage from "./pages/NotificationPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import LandingPage from "./pages/LandingPage";
import { Button } from "./components/QtracComponents";

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const NavLink = ({ to, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`font-bold text-sm tracking-wider cursor-pointer transition-colors ${isActive ? 'text-yellow-500' : 'text-gray-800 hover:text-yellow-500'}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-1">
            <Link to="/" className="flex items-center gap-1 no-underline">
              <span className="text-3xl font-extrabold text-yellow-400 tracking-tighter">Q</span>
              <span className="text-2xl font-bold text-gray-800">ueueManager</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 ml-0.5"></div>
            </Link>
          </div>
          <button onClick={toggleMenu} className="p-1 focus:outline-none md:hidden">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
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
                <button
                  onClick={handleLogout}
                  className="font-bold text-sm tracking-wider cursor-pointer text-gray-600 hover:text-red-500 transition-colors"
                >
                  LOGOUT ({username})
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">LOGIN</NavLink>
                <Link to="/register">
                  <Button variant="secondary" className="py-2 px-4 text-sm">REGISTER</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out pt-24 px-6 overflow-y-auto ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="flex flex-col gap-6">
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
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="text-left font-bold text-sm tracking-wider cursor-pointer text-gray-600 hover:text-red-500 transition-colors"
              >
                LOGOUT ({username})
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>LOGIN</NavLink>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button variant="secondary" className="w-full">REGISTER</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto text-center md:text-left">
        <div>
          <h4 className="text-white font-bold mb-4">HOSPITAL QUEUE SYSTEM</h4>
          <p className="text-sm leading-relaxed">
            Efficiently manage patient flow, reduce waiting times, and improve the overall healthcare experience with our advanced token system.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">QUICK LINKS</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-yellow-400">Login</Link></li>
            <li><Link to="/register" className="hover:text-yellow-400">Register</Link></li>
            <li><Link to="/notifications" className="hover:text-yellow-400">Live Status</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">CONTACT</h4>
          <ul className="space-y-2 text-sm">
            <li>support@queuemanager.com</li>
            <li>+1 (555) 123-4567</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto border-t border-gray-800 pt-8">
        <div className="flex gap-4">
          <Facebook className="text-yellow-400 hover:text-yellow-300 cursor-pointer" />
          <Linkedin className="text-yellow-400 hover:text-yellow-300 cursor-pointer" />
          <Youtube className="text-yellow-400 hover:text-yellow-300 cursor-pointer" />
        </div>

        <div className="text-xs space-y-2 text-center md:text-right">
          <p>© {new Date().getFullYear()} Queue Manager System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <NavBar />
      <main className="flex-grow">
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
  // Admins can also see provider view if they want, or strictly providers
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
