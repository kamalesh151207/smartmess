import React, { useState, useEffect } from 'react';
import { Database, Server, Smartphone, Cpu, ArrowRight, Activity, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

export const DataFlowVisualization: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      id: 0,
      title: 'Frontend (React)',
      icon: <Smartphone className="w-6 h-6 text-indigo-500" />,
      desc: 'User inputs expected attendance and meal details.',
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      id: 1,
      title: 'Backend (Node.js)',
      icon: <Server className="w-6 h-6 text-teal-500" />,
      desc: 'Retrieves true attendance and historical meals from DB.',
      color: 'bg-teal-50 border-teal-200'
    },
    {
      id: 2,
      title: 'ML Engine (Python)',
      icon: <Cpu className="w-6 h-6 text-rose-500" />,
      desc: 'RandomForest trains on historical data to predict demand.',
      color: 'bg-rose-50 border-rose-200'
    },
    {
      id: 3,
      title: 'Supabase DB',
      icon: <Database className="w-6 h-6 text-emerald-500" />,
      desc: 'Prediction saved & returned to frontend.',
      color: 'bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-xl overflow-hidden relative">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-indigo-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Live Architecture Data Flow</h3>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 w-full relative">
        {/* Connection Lines (Desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
        
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ 
                scale: activeStep === step.id ? 1.05 : 1,
                opacity: activeStep === step.id ? 1 : 0.6,
                y: activeStep === step.id ? -5 : 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex-1 w-full md:w-auto min-w-[140px] flex flex-col items-center text-center p-4 rounded-xl border ${step.color} transition-colors duration-500`}
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                {step.icon}
              </div>
              <h4 className="font-bold text-slate-800 text-xs mb-1">{step.title}</h4>
              <p className="text-[10px] text-slate-500 leading-tight">{step.desc}</p>
            </motion.div>
            
            {index < steps.length - 1 && (
              <div className="md:hidden py-1 text-slate-300">
                <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
              </div>
            )}
            
            {index < steps.length - 1 && (
              <motion.div 
                className="hidden md:block text-slate-300"
                animate={{ 
                  color: activeStep === index ? '#6366f1' : '#cbd5e1',
                  x: activeStep === index ? [0, 5, 0] : 0 
                }}
                transition={{ duration: 1, repeat: activeStep === index ? Infinity : 0 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
