import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Menu, X, User, Shield, Activity, LogOut, LogIn, PlusSquare } from "lucide-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationPage from "./pages/NotificationPage";
import ProviderDashboard from "./pages/ProviderDashboard";

// --- Components ---

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
          ? "bg-blue-700 text-white"
          : "text-blue-100 hover:bg-blue-600 hover:text-white"
          }`}
        onClick={() => setIsOpen(false)}
      >
        {Icon && <Icon size={18} />}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
              <Activity className="h-8 w-8 text-blue-200" />
              <span>QueueManager</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {isLoggedIn ? (
                <>
                  <NavLink to="/user" icon={User}>Book Token</NavLink>
                  <NavLink to="/notifications" icon={Activity}>Live Status</NavLink>
                  <NavLink to="/provider" icon={PlusSquare}>Provider</NavLink>
                  <NavLink to="/admin" icon={Shield}>Admin</NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout ({username})</span>
                  </button>
                </>
              ) : (
                <NavLink to="/login" icon={LogIn}>Login</NavLink>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 pb-3 px-2 pt-2 space-y-1 sm:px-3 shadow-inner">
          {isLoggedIn ? (
            <>
              <NavLink to="/user" icon={User}>Book Token</NavLink>
              <NavLink to="/notifications" icon={Activity}>Live Status</NavLink>
              <NavLink to="/provider" icon={PlusSquare}>Provider</NavLink>
              <NavLink to="/admin" icon={Shield}>Admin</NavLink>
              <div className="border-t border-blue-500 my-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-600 hover:text-white"
                >
                  <LogOut size={18} />
                  <span>Logout ({username})</span>
                </button>
              </div>
            </>
          ) : (
            <NavLink to="/login" icon={LogIn}>Login</NavLink>
          )}
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Queue Manager System. All rights reserved.</p>
      </div>
    </footer>
  );
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
              <ProviderDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
