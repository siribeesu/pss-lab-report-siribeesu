import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Settings, Upload, Microscope, Menu, X } from "lucide-react";
import { clsx } from "clsx";

const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="flex items-center space-x-3 px-3 py-4 mb-4">
        <div className="w-14 h-14 shrink-0 rounded-full bg-primary-container flex items-center justify-center shadow-lg shadow-primary/10">
           <Microscope className="text-white" size={30} />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <h1 className="text-2xl font-black text-teal-900 tracking-tighter leading-tight pb-1">LabInsight</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-none px-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-semibold",
                isActive
                  ? "bg-white text-primary shadow-[0px_4px_12px_rgba(0,80,80,0.06)]"
                  : "text-slate-500 hover:text-primary hover:bg-white/50"
              )
            }
          >
            <link.icon size={20} className={clsx("transition-transform group-hover:scale-110", "text-slate-400 group-hover:text-primary")} />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-4">
        <NavLink 
          to="/reports/upload" 
          onClick={() => setMobileOpen(false)}
          className="w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold text-xs flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all hover:brightness-110"
        >
          <Upload size={16} />
          <span>Upload Lab Report</span>
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 shrink-0 rounded-full bg-primary-container flex items-center justify-center shadow-md shadow-primary/10">
            <Microscope className="text-white" size={18} />
          </div>
          <span className="text-lg font-black text-teal-900 tracking-tighter font-headline">LabInsight</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-2 rounded-lg hover:bg-white/50 text-slate-600 transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-out Sidebar */}
      <aside className={clsx(
        "lg:hidden fixed top-0 right-0 h-full w-72 bg-slate-100 flex flex-col p-4 space-y-2 font-['Manrope'] z-50 transition-transform duration-300 shadow-2xl",
        mobileOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={clsx("hidden lg:flex w-64 bg-slate-100 flex-col p-4 space-y-2 font-['Manrope'] h-screen sticky top-0 shrink-0 z-50", className)}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
