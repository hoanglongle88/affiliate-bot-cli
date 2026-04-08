import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  History,
  Server,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Scripts from "./pages/Scripts";
import Captions from "./pages/Captions";
import HistoryPage from "./pages/HistoryPage";
import ServerStatus from "./pages/ServerStatus";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/scripts", icon: FileText, label: "Scripts" },
  { to: "/captions", icon: MessageSquare, label: "Captions" },
  { to: "/history", icon: History, label: "History" },
  { to: "/server", icon: Server, label: "Server" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[var(--bg-primary)]">
        {/* Sidebar */}
        <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
          <div className="p-6 border-b border-[var(--border-color)]">
            <h1 className="text-xl font-bold text-[var(--accent-cyan)]">
              Affiliate Bot
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Dashboard v2.0
            </p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-secondary)]">
              © 2026 Affiliate Bot CLI
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/captions" element={<Captions />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/server" element={<ServerStatus />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
