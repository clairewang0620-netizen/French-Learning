
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { ChevronRight, CheckCircle, Trophy, RefreshCcw } from 'lucide-react';
import { markItemResult } from '../services/storageService';

interface QuizProps {
    questions: QuizQuestion[];
}

const QuizView: React.FC<QuizProps> = ({ questions }) => {
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);

    const handleAnswer = (idx: number) => {
        if (answered) return;
        setSelected(idx);
        setAnswered(true);
        const isCorrect = idx === questions[current].correctAnswer;
        
        // Track Result
        markItemResult(questions[current].id, 'quiz', isCorrect);

        if (isCorrect) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (current < questions.length - 1) {
            setCurrent(c => c + 1);
            setSelected(null);
            setAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center max-w-lg mx-auto mt-10">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-600 shadow-inner">
                    <Trophy size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">测试完成!</h2>
                <p className="text-slate-500 mb-8">本次练习得分</p>
                <div className="text-7xl font-bold text-indigo-600 mb-8 tracking-tighter">
                    {Math.round((score / questions.length) * 100)}%
                </div>
                <div className="w-full flex gap-4">
                     <button 
                        onClick={() => {
                            setShowResult(false);
                            setCurrent(0);
                            setScore(0);
                            setSelected(null);
                            setAnswered(false);
                        }}
                        className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={18} /> 重试
                    </button>
                    <button 
                        onClick={() => alert("成绩已保存至统计面板")} // Placeholder for routing
                        className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700"
                    >
                        完成
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[current];

    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="mb-6 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Question</span>
                    <span className="text-2xl font-bold text-slate-800">{current + 1} <span className="text-slate-300 text-lg">/ {questions.length}</span></span>
                </div>
                <div className="flex flex-col items-end">
                     <span className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Score</span>
                     <span className="text-2xl font-bold text-indigo-600">{score}</span>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${((current) / questions.length) * 100}%` }}></div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <span className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-wider ${
                    q.type === 'vocab' ? 'bg-blue-50 text-blue-600' : 
                    q.type === 'grammar' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                }`}>
                    {q.type} • {q.level}
                </span>

                <h3 className="text-xl font-bold text-slate-800 mb-8 mt-4 leading-relaxed">{q.question}</h3>
                
                <div className="space-y-3">
                    {q.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={answered}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center group relative overflow-hidden ${
                                answered
                                    ? idx === q.correctAnswer
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : idx === selected
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-slate-100 text-slate-400 opacity-50'
                                    : 'border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 text-slate-700'
                            }`}
                        >
                            <span className="font-medium relative z-10">{opt}</span>
                            {answered && idx === q.correctAnswer && <CheckCircle size={20} className="text-green-600"/>}
                        </button>
                    ))}
                </div>

                {answered && (
                    <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-slate-50 p-4 rounded-xl mb-6">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">解析</span>
                            <p className="text-slate-700 text-sm">{q.explanation}</p>
                        </div>
                        <button 
                            onClick={nextQuestion}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            下一题 <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizView;
