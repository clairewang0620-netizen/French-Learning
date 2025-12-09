
import React from 'react';
import { GrammarPoint } from '../types';
import { Book, AlertTriangle, Lightbulb } from 'lucide-react';

interface GrammarProps {
    items: GrammarPoint[];
}

const GrammarView: React.FC<GrammarProps> = ({ items }) => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Book className="text-indigo-600" />
        语法指南
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-2xl font-bold text-slate-800">{item.title}</h3>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">{item.level}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.explanation}</p>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Rules */}
                    <div>
                        <h4 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 核心规则
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {item.rules.map((rule, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">
                                    <span className="text-indigo-500 font-bold">•</span> {rule}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Examples */}
                    <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-50">
                        <h4 className="font-semibold text-indigo-900 mb-3 text-sm uppercase">应用示例</h4>
                        <div className="space-y-3">
                            {item.examples.map((ex, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                    <span className="font-medium text-slate-800">{ex.french}</span>
                                    <span className="hidden sm:block text-slate-300">|</span>
                                    <span className="text-slate-500">{ex.chinese}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exceptions & Mistakes */}
                    {(item.exceptions || item.common_mistakes) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {item.exceptions && (
                                <div>
                                    <h4 className="font-semibold text-amber-600 mb-2 flex items-center gap-2 text-sm">
                                        <Lightbulb size={16}/> 例外情况
                                    </h4>
                                    <ul className="space-y-2">
                                        {item.exceptions.map((exc, i) => (
                                            <li key={i} className="text-sm text-slate-600 bg-amber-50 p-2 rounded border border-amber-100">
                                                <span className="font-bold">{exc.case}:</span> {exc.example}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {item.common_mistakes && (
                                <div>
                                    <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2 text-sm">
                                        <AlertTriangle size={16}/> 常见错误
                                    </h4>
                                    <ul className="space-y-2">
                                        {item.common_mistakes.map((mistake, i) => (
                                            <li key={i} className="text-sm text-slate-600 bg-red-50 p-2 rounded border border-red-100">
                                                {mistake}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
);

export default GrammarView;
