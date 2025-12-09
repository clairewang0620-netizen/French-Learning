
import React from 'react';
import { getItemsDueForReview, getProgress } from '../services/storageService';
import { AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { SAMPLE_WORDS, SAMPLE_SENTENCES, SAMPLE_QUIZ } from '../constants';

const WrongQuestionsView: React.FC = () => {
    const dueItems = getItemsDueForReview();
    const allMistakes = getProgress().mistakes;
    const totalMistakes = Object.keys(allMistakes).length;

    // Helper to find the original content based on ID
    const findContent = (id: string, type: string) => {
        if (type === 'word') return SAMPLE_WORDS.find(w => w.id === id)?.french || id;
        if (type === 'sentence') return SAMPLE_SENTENCES.find(s => s.id === id)?.french || id;
        if (type === 'quiz') return SAMPLE_QUIZ.find(q => q.id === id)?.question || id;
        return id;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" />
                    错题集 & 复习
                </h2>
                <div className="text-right">
                    <p className="text-sm text-slate-500">待复习 / 总错题</p>
                    <p className="text-xl font-bold text-slate-800">{dueItems.length} / {totalMistakes}</p>
                </div>
            </div>

            {dueItems.length > 0 ? (
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg mb-8">
                    <h3 className="text-2xl font-bold mb-2">今日复习计划</h3>
                    <p className="mb-6 opacity-90">你有 {dueItems.length} 个知识点需要根据艾宾浩斯曲线进行复习。</p>
                    <button className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-red-50 transition-colors">
                        开始专项复习
                    </button>
                </div>
            ) : (
                 <div className="bg-green-50 rounded-2xl p-8 text-green-800 shadow-sm border border-green-100 flex items-center gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                        <CheckCircle size={32} className="text-green-500"/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">太棒了！</h3>
                        <p className="opacity-80">今日暂无待复习内容，去学习新知识吧。</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-medium text-slate-500 flex justify-between">
                    <span>错题列表</span>
                    <span>上次错误时间</span>
                </div>
                {totalMistakes === 0 ? (
                     <div className="p-12 text-center text-slate-400">
                        暂无错题记录
                     </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {Object.values(allMistakes).sort((a,b) => new Date(b.lastWrongDate).getTime() - new Date(a.lastWrongDate).getTime()).map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                            item.type === 'word' ? 'bg-blue-100 text-blue-700' :
                                            item.type === 'quiz' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{item.type}</span>
                                        <span className="font-medium text-slate-800">{findContent(item.id, item.type)}</span>
                                    </div>
                                    <div className="flex gap-4 text-xs text-slate-400">
                                        <span>错误次数: {item.wrongCount}</span>
                                        <span>掌握度: {item.masteryLevel}/5</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 flex items-center gap-1 justify-end">
                                        <Calendar size={12}/> {item.lastWrongDate.split('T')[0]}
                                    </p>
                                    <span className={`text-xs ${
                                        new Date(item.nextReviewDate) <= new Date() ? 'text-red-500 font-bold' : 'text-green-500'
                                    }`}>
                                        {new Date(item.nextReviewDate) <= new Date() ? '需立即复习' : '复习: ' + item.nextReviewDate.split('T')[0]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WrongQuestionsView;
