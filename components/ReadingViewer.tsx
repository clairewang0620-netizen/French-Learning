
import React, { useState } from 'react';
import { ReadingArticle } from '../types';
import { BookOpen, Clock, HelpCircle } from 'lucide-react';

interface ReadingProps {
    articles: ReadingArticle[];
}

const ReadingView: React.FC<ReadingProps> = ({ articles }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-indigo-600" />
                阅读训练
            </h2>

            {/* List Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                     <div key={article.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedId(article.id === selectedId ? null : article.id)}>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                article.level === 'A1' ? 'bg-green-100 text-green-700' :
                                article.level === 'A2' ? 'bg-emerald-100 text-emerald-700' :
                                article.level === 'B1' ? 'bg-blue-100 text-blue-700' : 
                                'bg-purple-100 text-purple-700'
                            }`}>{article.level}</span>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={12} /> {article.reading_time}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                        <p className="text-slate-500 text-sm line-clamp-3 mb-4">{article.content}</p>
                        <button className="text-indigo-600 text-sm font-medium hover:underline">
                            {selectedId === article.id ? '收起全文' : '开始阅读'}
                        </button>

                        {/* Expanded View */}
                        {selectedId === article.id && (
                            <div className="mt-6 pt-6 border-t border-slate-100 cursor-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="prose prose-indigo max-w-none mb-8">
                                    <p className="text-lg leading-loose text-slate-800 font-serif">{article.content}</p>
                                    <div className="bg-slate-50 p-4 rounded-lg mt-4 text-slate-600 text-sm italic border-l-4 border-slate-300">
                                        {article.translation}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-indigo-50 p-5 rounded-xl">
                                        <h4 className="font-bold text-indigo-900 mb-3 text-sm uppercase">重点词汇</h4>
                                        <div className="flex flex-col gap-2">
                                            {article.vocabulary.map((w, i) => (
                                                <div key={i} className="flex justify-between items-baseline text-sm bg-white p-2 rounded shadow-sm">
                                                    <span className="font-bold text-indigo-700">{w.french}</span>
                                                    <span className="text-slate-500">{w.chinese}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {article.cultural_notes && (
                                         <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                                            <h4 className="font-bold text-amber-900 mb-3 text-sm uppercase">文化背景</h4>
                                            <ul className="list-disc list-inside text-sm text-amber-800 space-y-2">
                                                {article.cultural_notes.map((note, i) => (
                                                    <li key={i}>{note}</li>
                                                ))}
                                            </ul>
                                         </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-4">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <HelpCircle size={18}/> 阅读理解
                                    </h4>
                                    {article.questions.map((q) => (
                                        <div key={q.id} className="bg-white border border-slate-200 p-4 rounded-lg">
                                            <p className="font-medium text-slate-800 mb-3">{q.question}</p>
                                            <div className="space-y-2">
                                                {q.options.map((opt, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`px-3 py-2 rounded text-sm border ${
                                                            (typeof q.correct_answer === 'number' ? idx === q.correct_answer : opt === q.correct_answer)
                                                            ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                                                            : 'bg-slate-50 border-transparent text-slate-600'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                     </div>
                ))}
            </div>
        </div>
    );
};

export default ReadingView;
