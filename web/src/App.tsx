import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  History,
  Server,
  Menu,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--accent-cyan)]">
                Affiliate Bot
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Dashboard v2.0
              </p>
            </div>
            <button
              className="lg:hidden text-[var(--text-secondary)]"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] font-medium"
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="lg:hidden bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--text-primary)]"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-bold text-[var(--accent-cyan)]">
              Affiliate Bot
            </h1>
          </header>

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
      </div>
    </BrowserRouter>
  );
}
