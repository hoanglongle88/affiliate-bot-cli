import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  History,
  Server,
  Menu,
  X,
  TrendingUp,
  Film,
  Image,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Scripts from './pages/Scripts';
import Captions from './pages/Captions';
import HistoryPage from './pages/HistoryPage';
import ServerStatus from './pages/ServerStatus';
import TrendResearcher from './pages/TrendResearcher';
import ShortCreator from './pages/ShortCreator';
import ImageCreator from './pages/ImageCreator';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/products', icon: Package, label: 'Sản phẩm' },
  { to: '/trend', icon: TrendingUp, label: 'Quét Trend' },
  { to: '/scripts', icon: FileText, label: 'Kịch bản' },
  { to: '/captions', icon: MessageSquare, label: 'Caption' },
  { to: '/short', icon: Film, label: 'Video Veo' },
  { to: '/image', icon: Image, label: 'Brief Ảnh' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/server', icon: Server, label: 'Máy chủ' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-64 transform flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] transition-transform duration-300 lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--border-color)] p-6">
            <div>
              <h1 className="text-xl font-bold text-[var(--accent-cyan)]">
                Affiliate Bot
              </h1>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Bảng điều khiển v2.0
              </p>
            </div>
            <button
              className="text-[var(--text-secondary)] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-cyan)]/10 font-medium text-[var(--accent-cyan)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-[var(--border-color)] p-4">
            <p className="text-xs text-[var(--text-secondary)]">
              © 2026 Affiliate Bot CLI
            </p>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 lg:hidden">
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
              <Route path="/trend" element={<TrendResearcher />} />
              <Route path="/scripts" element={<Scripts />} />
              <Route path="/captions" element={<Captions />} />
              <Route path="/short" element={<ShortCreator />} />
              <Route path="/image" element={<ImageCreator />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/server" element={<ServerStatus />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
