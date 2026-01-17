
import React, { useState } from 'react';
import { Participant, Gender, MatchingResult } from '../types';
import { UserPlus, Trash2, Users, Info } from 'lucide-react';

interface ParticipantListProps {
  gender: Gender;
  participants: Participant[];
  history: MatchingResult[];
  onAdd: (name: string, gender: Gender) => void;
  onBulkAdd: (names: string[], gender: Gender) => void;
  onRemove: (id: string) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  gender,
  participants,
  onAdd,
  onBulkAdd,
  onRemove
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (isBulkMode) {
      const names = inputValue
        .split(/[\n,、]/)
        .map(n => n.trim())
        .filter(n => n !== '');
      onBulkAdd(names, gender);
    } else {
      onAdd(inputValue.trim(), gender);
    }
    setInputValue('');
  };

  const isFemale = gender === 'female';
  const colorClass = isFemale ? 'text-rose-600' : 'text-sky-600';
  const bgClass = isFemale ? 'bg-rose-50' : 'bg-sky-50';
  const borderClass = isFemale ? 'border-rose-100' : 'border-sky-100';
  const buttonClass = isFemale ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-600 hover:bg-sky-700';

  return (
    <div className={`flex flex-col h-full bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border ${borderClass} overflow-hidden`}>
      <div className={`p-6 border-b ${borderClass} flex items-center justify-between bg-gradient-to-r ${isFemale ? 'from-rose-50/50' : 'from-sky-50/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${bgClass} ${colorClass}`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">
              {isFemale ? '女性名簿' : '男性名簿'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total: {participants.length}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsBulkMode(!isBulkMode)}
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
            isBulkMode 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
              : 'bg-white border-gray-200 text-gray-400 hover:border-indigo-400 hover:text-indigo-600'
          }`}
        >
          {isBulkMode ? 'Normal' : 'Bulk Add'}
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="relative group">
          {isBulkMode ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="名前を改行またはカンマ区切りで入力..."
              rows={3}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm font-medium resize-none shadow-inner"
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="参加者名を入力..."
                className="flex-1 px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm font-medium shadow-inner"
              />
              <button
                type="submit"
                className={`p-3.5 ${buttonClass} text-white rounded-2xl transition-all shadow-lg active:scale-95`}
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          )}
          {isBulkMode && (
            <button
              type="submit"
              className={`mt-2 w-full py-3 ${buttonClass} text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2`}
            >
              一括追加 <UserPlus className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          {participants.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50">
              <Info className="w-10 h-10" />
              <p className="text-sm font-bold">メンバーが登録されていません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <span className="font-bold text-gray-700 text-sm pl-2">{p.name}</span>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="p-2 text-gray-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;
