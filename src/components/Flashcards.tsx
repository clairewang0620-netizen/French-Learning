import React, { useState, useMemo, useEffect } from 'react';
import { Word, Level } from '../types';
import { Volume2, RotateCw, CheckCircle2, XCircle, Tag, Filter, Layers, ArrowLeft, PlayCircle, Settings, Book } from 'lucide-react';
import { markItemResult, getWordStatus } from '../services/storageService';
import { playTTS } from '../utils/tts';

interface FlashcardsProps {
  words: Word[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ words }) => {
  // Mode: 'decks' (selection) or 'study' (active)
  const [mode, setMode] = useState<'decks' | 'study'>('decks');
  
  // Study Session State
  const [studyQueue, setStudyQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  // Compute Decks (Group by Level)
  const decks = useMemo(() => {
    const levels = Object.values(Level) as Level[];
    return levels.map(level => {
        const levelWords = words.filter(w => w.level === level);
        const categories = Array.from(new Set(levelWords.map(w => w.category)));
        return {
            level,
            count: levelWords.length,
            categories: categories.slice(0, 3).join(', ') + (categories.length > 3 ? '...' : ''),
            words: levelWords
        };
    }).filter(d => d.count > 0);
  }, [words]);

  // Start a session
  const startSession = (selectedWords: Word[]) => {
      // Shuffle slightly or keep order? Let's keep order for now but maybe randomize later
      setStudyQueue(selectedWords);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionStats({ correct: 0, wrong: 0 });
      setMode('study');
  };

  const currentWord = studyQueue[currentIndex];

  // Auto-play audio when flipping to front (if enabled)
  useEffect(() => {
      if (mode === 'study' && currentWord && !isFlipped && autoPlay) {
          // Small delay to allow transition
          const timer = setTimeout(() => {
              playTTS(currentWord.french);
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [currentIndex, mode, isFlipped, autoPlay, currentWord]);

  const handleNext = (correct: boolean) => {
    markItemResult(currentWord.id, 'word', correct);

    if (correct) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
    
    setIsFlipped(false);
    
    if (currentIndex < studyQueue.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      // Session Complete
      alert(`🎉 练习完成！\n\n✅ 记住: ${sessionStats.correct + (correct?1:0)}\n❌ 需复习: ${sessionStats.wrong + (correct?0:1)}`);
      setMode('decks');
    }
  };

  // --- DECKS VIEW ---
  if (mode === 'decks') {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2 mb-10">
                <h2 className="text-3xl font-bold text-slate-800">选择单词卡片组</h2>
                <p className="text-slate-500">选择适合你的等级开始学习</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                    <div 
                        key={deck.level}
                        onClick={() => startSession(deck.words)}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${
                             deck.level.startsWith('A') ? 'bg-green-500' : 
                             deck.level.startsWith('B') ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className={`text-xl font-black px-3 py-1 rounded-lg ${
                                deck.level.startsWith('A') ? 'bg-green-100 text-green-700' : 
                                deck.level.startsWith('B') ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                                {deck.level}
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Book size={12} /> {deck.count} 词
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                            {deck.level === 'A1' ? '入门基础' : 
                             deck.level === 'A2' ? '日常交流' :
                             deck.level === 'B1' ? '进阶提升' :
                             deck.level === 'B2' ? '高阶流利' : '精通专家'}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">
                            包含: {deck.categories}
                        </p>

                        <button className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                            <PlayCircle size={20} /> 开始学习
                        </button>
                    </div>
                ))}
            </div>
        </div>
      );
  }

  // --- STUDY VIEW ---
  if (!currentWord) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto h-[calc(100vh-140px)] justify-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6 px-2">
            <button 
                onClick={() => setMode('decks')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors"
            >
                <ArrowLeft size={20} /> <span className="font-medium">退出</span>
            </button>
            
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                        autoPlay ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
                    }`}
                 >
                    <Volume2 size={14} /> 自动发音: {autoPlay ? 'ON' : 'OFF'}
                 </button>
                 <span className="text-slate-300 font-mono text-sm">
                    {currentIndex + 1} / {studyQueue.length}
                </span>
            </div>
        </div>

        {/* The Card */}
        <div className="relative w-full aspect-[4/5] md:aspect-[5/4] max-h-[500px] perspective-1000">
            <div 
                className={`relative w-full h-full transition-transform duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* FRONT */}
                <div className="absolute w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="absolute top-6 left-6 flex gap-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold uppercase tracking-wider">
                            {currentWord.category}
                        </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <h2 className="text-5xl md:text-6xl font-black text-slate-800 text-center mb-6">
                            {currentWord.french}
                        </h2>
                        
                        <div className="flex items-center gap-3">
                             {currentWord.gender && (
                                <span className={`text-sm font-bold px-2 py-1 rounded ${
                                    currentWord.gender === 'm' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                }`}>
                                    {currentWord.gender === 'm' ? 'masc.' : 'fem.'}
                                </span>
                             )}
                             <button 
                                onClick={(e) => { e.stopPropagation(); playTTS(currentWord.french); }}
                                className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                <Volume2 size={24} />
                            </button>
                        </div>
                    </div>

                    <p className="text-slate-400 text-sm font-medium flex items-center gap-2 animate-pulse mt-auto">
                        <RotateCw size={16} /> 点击翻面
                    </p>
                </div>

                {/* BACK */}
                <div 
                    className="absolute w-full h-full bg-slate-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden text-white rotate-y-180" 
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="text-center space-y-6">
                        <div>
                            <p className="text-indigo-400 font-mono text-xl mb-2">{currentWord.ipa}</p>
                            <h3 className="text-4xl font-bold">{currentWord.chinese}</h3>
                        </div>

                        <div className="w-16 h-1 bg-indigo-500 rounded-full mx-auto opacity-50"></div>

                        <div className="bg-white/10 p-5 rounded-xl text-left backdrop-blur-sm">
                            <p className="text-lg italic text-indigo-50 mb-2 leading-relaxed">"{currentWord.example}"</p>
                            <p className="text-sm text-slate-400">{currentWord.example_chinese}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                            {currentWord.tags?.map(tag => (
                                <span key={tag} className="text-xs text-slate-400 border border-slate-600 px-2 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-8">
            <button 
                onClick={() => handleNext(false)}
                className="bg-white border-2 border-red-100 text-red-500 py-4 rounded-2xl font-bold text-lg hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
                <XCircle size={24} /> 模糊
            </button>
            <button 
                onClick={() => handleNext(true)}
                className="bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95"
            >
                <CheckCircle2 size={24} /> 掌握
            </button>
        </div>
    </div>
  );
};

export default Flashcards;