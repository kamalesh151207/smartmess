import React from 'react';
import {
  UtensilsCrossed,
  ArrowRight,
  TrendingUp,
  Cpu,
  Recycle,
  ShieldCheck,
  Zap,
  BarChart2,
  ChevronRight,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  Sparkles,
  Leaf
} from 'lucide-react';

interface LandingPageProps {
  onGoToDashboard: () => void;
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToDashboard, onGoToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-white/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900/20 via-cyan-500/20 to-slate-800/20 border border-slate-300/30 flex items-center justify-center text-slate-900">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-wider text-base">SMART MESS</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-slate-900 border border-blue-200/60">
                SIH Hackathon
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#pipeline" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#problem-solution" className="hover:text-slate-900 transition-colors">Impact & Architecture</a>
            <a href="#future" className="hover:text-slate-900 transition-colors">Future Roadmap</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-slate-900 to-indigo-500 hover:from-slate-800 hover:to-indigo-400 text-slate-900 flex items-center gap-2 shadow-lg shadow-slate-800/20 transition-all cursor-pointer"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/60 border border-blue-200/60 text-slate-900 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Immersion & Smart India Hackathon Project</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Predict. Prepare. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-700 bg-clip-text text-transparent">
              Zero Waste. Zero Shortages.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed">
            Predict hostel meal demand before food is cooked. Empowers university mess administrators with Random Forest regression, student turnout analytics, and inventory safeguards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-xl shadow-slate-800/25 transition-all cursor-pointer"
            >
              Open Smart Dashboard <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#pipeline"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-base bg-slate-50/80 hover:bg-slate-100 border border-slate-300/80 text-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              Explore How It Works
            </a>
          </div>

          {/* Interactive Flow Visualizer (Attendance -> AI Prediction -> Recommended Prep -> Actual -> Waste) */}
          <div className="p-6 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Cpu className="w-4 h-4" /> Live Operational Feedback Pipeline
              </span>
              <span className="text-slate-500">Autonomous Cycle</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-6 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col items-center text-center group hover:border-slate-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-black0/10 border border-slate-200/30 flex items-center justify-center text-slate-500 mb-2">
                  1
                </div>
                <span className="text-xs text-slate-500 font-medium">Hostel Attendance</span>
                <span className="text-lg font-bold text-slate-900 mt-1">1,215</span>
                <span className="text-[11px] text-slate-500 mt-1">Registered Active</span>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50/90 border border-indigo-400/30 flex flex-col items-center text-center group hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-500 mb-2">
                  2
                </div>
                <span className="text-xs text-slate-500 font-medium">AI Demand Forecast</span>
                <span className="text-lg font-bold text-indigo-400 mt-1">1,085</span>
                <span className="text-[11px] text-indigo-500 mt-1">RF Regression (-10.7%)</span>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-300/30 flex flex-col items-center text-center group hover:border-emerald-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-slate-300/30 flex items-center justify-center text-white mb-2">
                  3
                </div>
                <span className="text-xs text-slate-500 font-medium">Recommended Prep</span>
                <span className="text-lg font-bold text-slate-700 mt-1">1,123</span>
                <span className="text-[11px] text-slate-900 mt-1">+3.5% Safety Buffer</span>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col items-center text-center group hover:border-slate-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-600 mb-2">
                  4
                </div>
                <span className="text-xs text-slate-500 font-medium">Actual Consumed</span>
                <span className="text-lg font-bold text-slate-900 mt-1">1,098</span>
                <span className="text-[11px] text-indigo-600 mt-1">Student Turnout</span>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-300/40 bg-blue-100/20 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-slate-300/40 flex items-center justify-center text-white mb-2">
                  5
                </div>
                <span className="text-xs text-slate-700 font-medium">Food Leftover</span>
                <span className="text-lg font-bold text-slate-900 mt-1">25 meals</span>
                <span className="text-[11px] text-slate-700 mt-1">2.2% Minimized Waste</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="text-slate-900 font-semibold">Continuous Loop:</span>
              <span>Predict → Prepare → Measure → Learn → Improve</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section id="problem-solution" className="py-20 border-t border-slate-200/80 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">The Hostel Mess Dilemma</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Why Fixed Preparation Fails</h2>
            <p className="text-slate-500 text-sm mt-3">
              College dining facilities routinely waste 15-30% of cooked food or face sudden shortages due to static preparation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Problem */}
            <div className="p-8 rounded-2xl bg-black border border-blue-200 relative">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">The Conventional Mess</span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 mb-6">Uncertainty Leads to Loss</h3>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">✕</div>
                  <div>
                    <strong className="text-slate-900">Blind Overproduction:</strong> Cooking for 100% capacity on Fridays when 25% of students leave for home.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">✕</div>
                  <div>
                    <strong className="text-slate-900">Unforeseen Shortages:</strong> Sudden surges for favorite dishes (Paneer, Biryani) leave latecomers unfed.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">✕</div>
                  <div>
                    <strong className="text-slate-900">Massive Budget Drain:</strong> Wasted dairy, grain, and LPG inflate semester dining expenses by up to ₹3.8 Lakhs/month.
                  </div>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-2xl bg-blue-100/10 border border-blue-200/40 relative">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">The Smart Mess Platform</span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 mb-6">AI-Calibrated Preparation</h3>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Context-Aware ML Prediction:</strong> Factors in weekday vs weekend, exam schedules, and specific recipe popularity.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Configurable Safety Buffer:</strong> Automatically adds a 2.5% - 5.0% buffer to ensure zero shortages while preventing bulk waste.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Inventory Integration:</strong> Directly connects predicted meal quantities to raw ration requisitions (Rice, Dal, Veggies).
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How AI Works Pipeline */}
      <section id="pipeline" className="py-20 border-t border-slate-200/80 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Under The Hood</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Machine Learning Architecture</h2>
            <p className="text-slate-500 text-sm mt-3">
              Python Random Forest Regression ensemble trained on attendance signals, academic calendars, and dish preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-50/60 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-black0/10 text-slate-500 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">1. Collect Data</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Biometric/RFID logs, hostel roster, dietary categories, and past 30-day meal consumption baselines.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50/60 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">2. ML Engine</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Multi-factor Random Forest model evaluates day-of-week decay, exam attendance elasticity, and menu preference scores.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50/60 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-white flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">3. Safeguard Buffer</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculates dynamic safety margins ensuring sudden student arrivals are cushioned without excess spoilage.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50/60 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Recycle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">4. Feedback Loop</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Daily leftover audit logs feed directly back into model weights, adjusting hyper-parameters for subsequent services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section id="future" className="py-20 border-t border-slate-200/80 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">SIH Innovation Roadmap</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Scalability & IoT Integration</h2>
            <p className="text-slate-500 text-sm mt-3">
              Designed from day one to connect with campus hardware and multi-hostel administrative clusters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200">
              <span className="text-xs font-mono text-slate-900">PHASE 2</span>
              <h4 className="font-bold text-slate-900 mt-1 mb-2">IoT Weight Sensor Bins</h4>
              <p className="text-xs text-slate-500">
                Automated load cells installed at dish-return stations for real-time plate waste telemetry.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200">
              <span className="text-xs font-mono text-indigo-500">PHASE 2</span>
              <h4 className="font-bold text-slate-900 mt-1 mb-2">RFID / QR Turnstiles</h4>
              <p className="text-xs text-slate-500">
                Contactless student meal punching with live head-count counters updated every 30 seconds.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200">
              <span className="text-xs font-mono text-slate-500">PHASE 3</span>
              <h4 className="font-bold text-slate-900 mt-1 mb-2">Multi-Hostel Federation</h4>
              <p className="text-xs text-slate-500">
                Centralized campus portal balancing buffer food transfers between North and South hostel dining complexes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 border-t border-slate-200/80 bg-gradient-to-b from-[#0B0F1A] to-[#080C14] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-slate-300/30 flex items-center justify-center text-slate-900 mx-auto mb-6">
            <Leaf className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Don't prepare more food. Prepare smarter.
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto mb-8">
            Experience the working operational dashboard with live predictions, student attendance, waste analytics, and inventory recommendations.
          </p>
          <button
            onClick={onGoToDashboard}
            className="px-8 py-4 rounded-xl font-bold text-slate-900 bg-black0 hover:bg-slate-200 shadow-xl shadow-slate-800/20 text-base inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            Launch Smart Mess Platform <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
