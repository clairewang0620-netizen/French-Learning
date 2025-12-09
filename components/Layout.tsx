
import React, { useState } from 'react';
import { Menu, X, BookOpen, Layers, GraduationCap, BarChart3, Settings, BookType, MessageCircle, AlertTriangle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: '学习概览', icon: <BarChart3 size={20} /> },
    { id: 'words', label: '单词卡片', icon: <Layers size={20} /> },
    { id: 'sentences', label: '日常口语', icon: <MessageCircle size={20} /> },
    { id: 'grammar', label: '语法指南', icon: <BookType size={20} /> },
    { id: 'reading', label: '阅读训练', icon: <BookOpen size={20} /> },
    { id: 'quiz', label: '测试中心', icon: <GraduationCap size={20} /> },
    { id: 'review', label: '错题复习', icon: <AlertTriangle size={20} /> },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm transition-all duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">F</div>
            <h1 className="text-xl font-bold text-indigo-900 tracking-tight">Français Facile</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={currentPage === item.id ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-100">
            <button className="flex items-center space-x-3 text-slate-500 hover:text-indigo-600 transition-colors px-4 py-2 w-full">
                <Settings size={20} />
                <span>设置</span>
            </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 z-20">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                <span className="font-bold text-indigo-900">Français Facile</span>
            </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full h-[calc(100%-4rem)] bg-white z-10 overflow-y-auto md:hidden p-4 space-y-2 border-b-2 border-slate-100 animate-in slide-in-from-top-4 fade-in duration-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-lg text-lg ${
                    currentPage === item.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-6xl mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
