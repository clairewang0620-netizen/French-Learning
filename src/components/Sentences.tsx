
import React from 'react';
import { Sentence } from '../types';
import { Volume2, MessageSquare } from 'lucide-react';
import { playTTS } from '../utils/tts';

interface SentencesProps {
    sentences: Sentence[];
}

const SentencesView: React.FC<SentencesProps> = ({ sentences }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-indigo-600" />
            日常口语
         </h2>
         <span className="text-slate-500 text-sm">共 {sentences.length} 句</span>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {sentences.map((sent) => (
          <div key={sent.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{sent.category}</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{sent.subcategory}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                    sent.level === 'A1' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{sent.level}</span>
            </div>
            
            <div className="flex items-start gap-4">
                <button 
                    onClick={() => playTTS(sent.french)}
                    className="mt-1 text-indigo-500 hover:text-white hover:bg-indigo-500 bg-indigo-50 p-3 rounded-full transition-colors flex-shrink-0"
                >
                    <Volume2 size={20} />
                </button>
                <div className="flex-1">
                    <p className="text-xl font-medium text-slate-800 mb-1">{sent.french}</p>
                    <p className="text-sm text-slate-400 font-mono mb-2">{sent.ipa}</p>
                    <p className="text-slate-600 text-lg border-l-4 border-indigo-200 pl-3">{sent.chinese}</p>
                    
                    {(sent.alternative || sent.notes) && (
                        <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {sent.notes && (
                                <p className="text-slate-500"><span className="font-semibold text-slate-700">💡 提示:</span> {sent.notes}</p>
                            )}
                            {sent.alternative && (
                                <p className="text-slate-500"><span className="font-semibold text-slate-700">🔄 替换:</span> {sent.alternative.join(', ')}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
);

export default SentencesView;
