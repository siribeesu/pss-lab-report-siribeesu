import React from "react";
import { useNavigate } from "react-router-dom";
import { Microscope, ArrowRight } from "lucide-react";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-body overflow-hidden selection:bg-primary selection:text-white text-slate-600">
      {/* Immersive Light Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[140px]"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMzMsMzMsMzMsMC4wMykiLz48L3N2Zz4=')] opacity-50 z-0"></div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-10 py-6 flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center shadow-lg shadow-primary/10">
            <Microscope className="text-white" size={30} />
          </div>
          <span className="text-2xl font-black text-teal-900 tracking-tighter font-headline">LabInsight</span>
        </div>
        <div className="hidden md:flex items-center space-x-10 text-sm font-bold text-slate-500">
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Services</a>
          <a href="#" className="hover:text-primary transition-colors">Help</a>
          <a href="/login" className="px-8 py-2.5 rounded-full bg-primary text-white hover:brightness-110 transition-all font-bold shadow-md shadow-primary/20">Sign In</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <h1 className="text-6xl md:text-7xl font-black text-teal-900 leading-[1.05] tracking-tighter font-headline text-balance">
              Patient Lab Report <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-emerald-500">Management System</span>
            </h1>

            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg font-body">
              Manage patients, upload reports, and track abnormal results easily.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0px_20px_40px_rgba(15,118,110,0.2)] hover:shadow-[0px_20px_60px_rgba(15,118,110,0.3)] hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all group"
              >
                Access Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300 xl:translate-x-10 lg:-translate-y-24">
            {/* Holographic Glowing Border Container */}
            <div className="relative z-10 bg-white/60 backdrop-blur-2xl rounded-[3rem] p-4 shadow-[0px_40px_100px_rgba(15,118,110,0.15)] border border-white group">
              <div className="rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 relative shadow-inner aspect-[4/3]">
                <img src="/hero_dashboard_mockup.png" alt="Dashboard Mockup" className="w-full h-full object-cover opacity-95 group-hover:scale-[1.02] group-hover:opacity-100 transition-all duration-700" />
                {/* Floating Analytical Elements Removed */}
              </div>
            </div>

            {/* Glowing Accent Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full border border-primary/5 shadow-[0px_0px_100px_rgba(15,118,110,0.05)] -z-10 animate-[spin_60s_linear_infinite]"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
