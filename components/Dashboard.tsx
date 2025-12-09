import React from 'react';
import { UserProgress } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, Clock, Flame, Target } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
}

const Dashboard: React.FC<DashboardProps> = ({ progress }) => {
  const categoryData = Object.entries(progress.categoryProgress).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                <Flame size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm">连续打卡</p>
                <p className="text-2xl font-bold text-slate-800">{progress.dailyStreak} 天</p>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <Trophy size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm">已掌握单词</p>
                <p className="text-2xl font-bold text-slate-800">{progress.wordsMastered}</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Clock size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm">学习时长</p>
                <p className="text-2xl font-bold text-slate-800">{progress.totalStudyTimeMinutes} 分钟</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Target size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm">今日目标</p>
                <p className="text-2xl font-bold text-slate-800">80%</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vocabulary Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">各等级掌握度</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Quiz History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">测试成绩趋势</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progress.quizScores}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(str) => str.slice(5)} />
                        <YAxis domain={[0, 100]} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;