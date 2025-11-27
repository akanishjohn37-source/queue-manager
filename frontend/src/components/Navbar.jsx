// frontend/src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const linkClass = (path) =>
    `px-3 py-1 rounded-full text-sm ${
      location.pathname === path
        ? "bg-white text-slate-900 font-semibold"
        : "text-slate-200 hover:bg-slate-700"
    }`;

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="font-bold text-lg">
        Smart Queue<span className="text-blue-400">.io</span>
      </div>
      <div className="flex gap-2">
        <Link to="/user" className={linkClass("/user")}>
          User View
        </Link>
        {user?.is_staff && (
          <Link to="/admin" className={linkClass("/admin")}>
            Admin View
          </Link>
        )}
        <Link to="/services" className={linkClass("/services")}>
          Services
        </Link>
        {user?.is_staff && (
          <Link to="/add-service" className={linkClass("/add-service")}>
            Add Service
          </Link>
        )}
      </div>
    </nav>
  );
}
