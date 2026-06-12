import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#00f3ff', '#bc13fe', '#ff00ff', '#3b82f6', '#10b981'];

export const AccuracyChart = ({ data }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #ffffff10', borderRadius: '12px' }}
          itemStyle={{ color: '#00f3ff' }}
        />
        <Area
          type="monotone"
          dataKey="accuracy"
          stroke="#00f3ff"
          fillOpacity={1}
          fill="url(#colorAcc)"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const SubjectRadar = ({ data }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#ffffff10" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Performance"
          dataKey="score"
          stroke="#bc13fe"
          fill="#bc13fe"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

export const FocusBarChart = ({ data }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis
          dataKey="day"
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip
          cursor={{ fill: '#ffffff05' }}
          contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #ffffff10', borderRadius: '12px' }}
        />
        <Bar
          dataKey="hours"
          fill="#00f3ff"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const AIUsagePie = ({ data }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #ffffff10', borderRadius: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const StudyHeatmap = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];
  // Generate pseudo-random consistent data
  const data = Array.from({ length: 56 }, (_, i) => (i % 3 === 0 ? Math.floor(Math.random() * 5) : 0));

  const getColor = (val) => {
    if (val === 0) return 'bg-gray-900';
    if (val === 1) return 'bg-cyan-900/40';
    if (val === 2) return 'bg-cyan-700/60';
    if (val === 3) return 'bg-cyan-500/80';
    return 'bg-cyan-400';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
        {weeks.map(w => (
          <div key={w} className="flex flex-col gap-1.5 shrink-0">
            {days.map((d, i) => {
              const val = data[(w-1)*7 + i];
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-[2px] ${getColor(val)} transition-all hover:scale-125 cursor-help border border-white/5`}
                  title={`${val} sessions`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold px-1">
        <span>Less Activity</span>
        <div className="flex gap-1 items-center">
          {[0, 1, 2, 3, 4].map(v => (
            <div key={v} className={`w-2.5 h-2.5 rounded-[1px] ${getColor(v)}`} />
          ))}
        </div>
        <span>More Activity</span>
      </div>
    </div>
  );
};
