import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate';
  badge?: string;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'emerald',
  badge = 'DEMO DATA',
  delay = 0
}) => {
  const colorMap = {
    emerald: {
      border: 'border-slate-700/20 hover:border-slate-700/50',
      iconBg: 'bg-slate-950/10 text-slate-50',
      glow: 'hover:shadow-slate-800/10',
      textGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    },
    cyan: {
      border: 'border-indigo-400/20 hover:border-indigo-400/50',
      iconBg: 'bg-indigo-500/10 text-indigo-500',
      glow: 'hover:shadow-indigo-500/10',
      textGlow: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
    },
    amber: {
      border: 'border-indigo-300 hover:border-indigo-300',
      iconBg: 'bg-indigo-100 text-indigo-600',
      glow: 'hover:shadow-amber-500/10',
      textGlow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
    },
    rose: {
      border: 'border-slate-600 hover:border-slate-600',
      iconBg: 'bg-blue-100 text-slate-50',
      glow: 'hover:shadow-blue-100',
      textGlow: 'drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]'
    },
    slate: {
      border: 'border-slate-700/60 hover:border-slate-500/60',
      iconBg: 'bg-slate-800 text-slate-400',
      glow: 'hover:shadow-slate-500/10',
      textGlow: ''
    }
  };

  const scheme = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`p-5 rounded-2xl glass-panel border transition-colors duration-300 ${scheme.border} shadow-lg ${scheme.glow} relative overflow-hidden group cursor-pointer`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-400 transition-colors">
              {title}
            </span>
            {badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-300">
                {badge}
              </span>
            )}
          </div>
          <motion.div 
            className={`text-2xl lg:text-3xl font-bold text-slate-50 tracking-tight font-heading ${scheme.textGlow} transition-all duration-300`}
          >
            {value}
          </motion.div>
        </div>

        <div className={`p-3 rounded-2xl ${scheme.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60 relative z-10">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trendPositive ? 'text-slate-50' : 'text-indigo-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
