import React, { useState } from 'react';
import { 
  FolderTree, 
  Image as ImageIcon, 
  BarChart3, 
  GraduationCap, 
  Settings, 
  History, 
  LogIn,
  MoreVertical,
  Layers,
  ExternalLink
} from 'lucide-react';

export default function GlassDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);

  const sidebarIcons = [
    { icon: FolderTree, label: 'Deck Generator' },
    { icon: ImageIcon, label: 'Visual Prompts' },
    { icon: BarChart3, label: 'Assessments' },
    { icon: GraduationCap, label: 'Practice Mode' },
    { icon: History, label: 'History' },
    { icon: Settings, label: 'Export Studio' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center p-8 gap-8 font-sans antialiased text-slate-900">
      
      {/* Tightened, Accessible Sidebar */}
      <aside className="w-20 py-8 px-3 bg-white border border-slate-200 rounded-2xl shadow-sm h-[85vh] flex flex-col justify-between items-center transition-all">
        
        {/* Brand / Logo Indicator */}
        <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm mb-6">
          <Layers className="w-5 h-5" />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-3 w-full items-center">
          {sidebarIcons.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeIndex;

            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={item.label}
                className={`relative p-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.25 : 2} />
                
                {/* Floating Tooltip */}
                <span className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Action Icon (Sign In) */}
        <button 
          aria-label="Sign In"
          className="relative p-3.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 group mt-auto"
        >
          <LogIn className="w-6 h-6" strokeWidth={2} />
          <span className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
            Sign In
          </span>
        </button>
      </aside>

      {/* Main Canvas & Studio Area */}
      <main className="flex-1 h-[85vh] bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between overflow-hidden">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              SlideCraft Studio
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {sidebarIcons[activeIndex].label} Workspace
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Context Breadcrumb / URL Pill */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>slidecraft.ai / {sidebarIcons[activeIndex].label.toLowerCase().replace(/\s+/g, '-')}</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>

            {/* Consolidated Secondary Action Menu */}
            <button 
              aria-label="More options"
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Canvas Workspace Container */}
        <section className="flex-1 min-h-[420px] bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-300">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-orange-600 mb-4">
            {React.createElement(sidebarIcons[activeIndex].icon, { className: 'w-8 h-8', strokeWidth: 1.75 })}
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
            {sidebarIcons[activeIndex].label} Active Canvas
          </h2>
          <p className="text-sm text-slate-600 max-w-md">
            Interactive deck generator workspace loaded with full breathing room and contrast-optimized controls.
          </p>
        </section>

      </main>
    </div>
  );
}
