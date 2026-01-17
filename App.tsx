
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Participant, MatchingResult, Pair, Gender } from './types';
import ParticipantList from './components/ParticipantList';
import AmidakujiBoard from './components/AmidakujiBoard';
import { generateValidMatching, generateMatches } from './utils/matchingLogic';
import { Play, RotateCcw, History, Sparkles, Heart, Trash2, UserPlus, Swords, LayoutGrid, X, Coffee } from 'lucide-react';

const App: React.FC = () => {
  const [females, setFemales] = useState<Participant[]>([]);
  const [males, setMales] = useState<Participant[]>([]);
  const [history, setHistory] = useState<MatchingResult[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentResult, setCurrentResult] = useState<MatchingResult | null>(null);
  const [viewMode, setViewMode] = useState<'pairs' | 'matches'>('pairs');

  useEffect(() => {
    const saved = localStorage.getItem('amida_pair_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFemales(parsed.females || []);
        setMales(parsed.males || []);
        setHistory(parsed.history || []);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('amida_pair_data', JSON.stringify({ females, males, history }));
  }, [females, males, history]);

  const addParticipant = useCallback((name: string, gender: Gender) => {
    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      gender
    };
    if (gender === 'female') {
      setFemales(prev => [...prev, newParticipant]);
    } else {
      setMales(prev => [...prev, newParticipant]);
    }
  }, []);

  const bulkAddParticipants = useCallback((names: string[], gender: Gender) => {
    const newParticipants = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      gender
    }));
    if (gender === 'female') {
      setFemales(prev => [...prev, ...newParticipants]);
    } else {
      setMales(prev => [...prev, ...newParticipants]);
    }
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setFemales(prev => prev.filter(p => p.id !== id));
    setMales(prev => prev.filter(p => p.id !== id));
  }, []);

  const resetAll = useCallback(() => {
    if (confirm('名簿と履歴をすべて削除しますか？')) {
      setFemales([]);
      setMales([]);
      setHistory([]);
      setCurrentResult(null);
      setIsGameActive(false);
    }
  }, []);

  const resetHistory = useCallback(() => {
    if (confirm('これまでの履歴をリセットしますか？名簿は残ります。')) {
      setHistory([]);
      setCurrentResult(null);
      setIsGameActive(false);
    }
  }, []);

  const boardSetup = useMemo(() => {
    const totalLines = Math.max(females.length, males.length);
    const topLabels: (Participant | null)[] = [...females];
    const bottomLabels: (Participant | null)[] = [...males];
    while (topLabels.length < totalLines) topLabels.push(null);
    while (bottomLabels.length < totalLines) bottomLabels.push(null);
    return { topLabels, bottomLabels };
  }, [females, males]);

  const startAmidakuji = () => {
    if (females.length + males.length < 2) {
      alert('最低2人の参加者が必要です');
      return;
    }
    setCurrentResult(null);
    setIsGameActive(true);
    setIsAnimating(true);
  };

  const onAmidakujiFinish = useCallback((_visualPairs: Pair[]) => {
    const result = generateValidMatching(females, males, history);
    
    if (result) {
      const { pairs, bye } = result;
      const validMatches = generateMatches(pairs, history);
      const newResult: MatchingResult = {
        round: history.length + 1,
        pairs: pairs,
        matches: validMatches,
        bye: bye,
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, newResult]);
      setCurrentResult(newResult);
    }
    setIsAnimating(false);
  }, [females, males, history]);

  const currentRound = history.length + 1;

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-sm text-indigo-900 font-bold text-xs mb-4 border border-white/50 shadow-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Anti-Repeat Logic Round {Math.min(currentRound, 99)}
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-3 tracking-tight drop-shadow-xl">
            Amida<span className="text-indigo-600">Pair</span>
          </h1>
          <p className="text-gray-800 font-bold text-lg bg-white/30 backdrop-blur-sm inline-block px-6 py-2 rounded-full border border-white/40 shadow-sm">
            ペアリング & 対戦組み合わせ管理
          </p>
        </header>

        {!isGameActive ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ParticipantList
                gender="female"
                participants={females}
                history={history}
                onAdd={addParticipant}
                onBulkAdd={bulkAddParticipants}
                onRemove={removeParticipant}
              />
              <ParticipantList
                gender="male"
                participants={males}
                history={history}
                onAdd={addParticipant}
                onBulkAdd={bulkAddParticipants}
                onRemove={removeParticipant}
              />
            </div>

            <div className="flex flex-col items-center gap-6 bg-white/70 backdrop-blur-lg p-10 rounded-[2.5rem] shadow-2xl border border-white/50">
              <div className="flex gap-16 text-center">
                <div className="flex flex-col">
                  <span className="text-rose-600 font-black text-4xl">{females.length}</span>
                  <span className="text-gray-600 font-bold text-sm uppercase">Female</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sky-600 font-black text-4xl">{males.length}</span>
                  <span className="text-gray-600 font-bold text-sm uppercase">Male</span>
                </div>
              </div>

              <button
                disabled={females.length + males.length < 2}
                onClick={startAmidakuji}
                className="group relative px-16 py-6 bg-indigo-600 text-white rounded-2xl font-black text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-300 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <Play className="w-6 h-6 fill-current" />
                  あみだくじを開始する
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>

              <div className="flex gap-6">
                <button onClick={resetHistory} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors bg-white/50 rounded-full border border-white/60 shadow-sm hover:shadow-md active:scale-95">
                  <RotateCcw className="w-4 h-4" /> 履歴をリセット
                </button>
                <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-rose-600 transition-colors bg-white/50 rounded-full border border-white/60 shadow-sm hover:shadow-md active:scale-95">
                  <Trash2 className="w-4 h-4" /> 名簿をリセット
                </button>
              </div>
            </div>
            
            {history.length > 0 && (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">
                <div className="flex items-center gap-2 mb-6 border-b border-white/40 pb-4">
                  <History className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-gray-800">ペア & 対戦 履歴</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.slice().reverse().map((res) => (
                    <div key={res.timestamp} className="p-4 bg-white/40 border border-white/60 rounded-2xl shadow-sm hover:bg-white/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Round {res.round}</span>
                        <span className="text-[10px] text-gray-500">{new Date(res.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {res.matches.map((m, i) => (
                          <span key={i} className="px-2 py-1 bg-white/80 border border-indigo-100 rounded text-[9px] font-bold text-gray-700 shadow-sm">
                            {m.pair1.p1.name}/{m.pair1.p2.name} vs {m.pair2.p1.name}/{m.pair2.p2.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/60 p-8 md:p-12 min-h-[700px] flex flex-col items-center animate-in zoom-in-95 duration-500 relative">
             <button 
                onClick={() => setIsGameActive(false)} 
                className="absolute top-8 right-8 p-3 bg-white/80 text-gray-500 border border-white/60 rounded-2xl hover:text-rose-500 transition-all shadow-sm z-50 active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>

            <div className="w-full flex items-center justify-between mb-8 border-b border-white/40 pb-6 pr-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-800">
                  {isAnimating ? 'あみだくじ実行中...' : 'ペア & 対戦組み合わせ'}
                </h3>
              </div>
              {!isAnimating && (
                <div className="flex items-center gap-3">
                   <div className="flex bg-gray-200/50 p-1 rounded-xl">
                    <button 
                      onClick={() => setViewMode('pairs')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'pairs' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500'}`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" /> ペア
                    </button>
                    <button 
                      onClick={() => setViewMode('matches')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'matches' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500'}`}
                    >
                      <Swords className="w-3.5 h-3.5" /> 対戦
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex justify-center py-4">
              <AmidakujiBoard
                topParticipants={boardSetup.topLabels}
                bottomParticipants={boardSetup.bottomLabels}
                isAnimating={isAnimating}
                onFinish={onAmidakujiFinish}
              />
            </div>

            {!isAnimating && currentResult && (
              <div className="mt-12 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                {viewMode === 'pairs' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentResult.pairs.map((pair, idx) => (
                      <div key={idx} className="bg-white/90 backdrop-blur-sm border border-white/80 p-6 rounded-[2rem] flex items-center justify-between shadow-lg group hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        {pair.p1.gender === pair.p2.gender && (
                          <div className="absolute top-0 right-0 bg-gray-100 text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase text-gray-400">Same Gender</div>
                        )}
                        <div className="flex flex-col items-start flex-1 overflow-hidden">
                           <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${pair.p1.gender === 'female' ? 'text-rose-500' : 'text-sky-500'}`}>{pair.p1.gender}</span>
                           <span className="font-black text-gray-800 text-xl truncate w-full">{pair.p1.name}</span>
                        </div>
                        <div className="px-4 flex flex-col items-center">
                          <Heart className={`w-6 h-6 transition-all duration-700 ${pair.p1.gender === pair.p2.gender ? 'text-gray-200 fill-gray-50' : 'text-rose-200 fill-rose-100 group-hover:text-rose-500 group-hover:fill-rose-500'}`} />
                        </div>
                        <div className="flex flex-col items-end flex-1 overflow-hidden text-right">
                           <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${pair.p2.gender === 'female' ? 'text-rose-500' : 'text-sky-500'}`}>{pair.p2.gender}</span>
                           <span className="font-black text-gray-800 text-xl truncate w-full">{pair.p2.name}</span>
                        </div>
                      </div>
                    ))}
                    
                    {currentResult.bye && (
                      <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 p-6 rounded-[2rem] flex items-center justify-between shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-amber-200 text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase text-amber-700">Resting</div>
                        <div className="flex flex-col items-start flex-1 overflow-hidden">
                           <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${currentResult.bye.gender === 'female' ? 'text-rose-500' : 'text-sky-500'}`}>{currentResult.bye.gender}</span>
                           <span className="font-black text-amber-900 text-xl truncate w-full">{currentResult.bye.name}</span>
                        </div>
                        <div className="px-4 flex flex-col items-center">
                          <Coffee className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1 text-right">
                           <span className="text-[10px] font-bold text-amber-600 uppercase">お休み</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentResult.matches.map((match, idx) => (
                      <div key={match.id} className="bg-white/90 backdrop-blur-sm border border-indigo-100 p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-center gap-8 relative overflow-hidden group hover:border-indigo-300 transition-all">
                        <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-br-2xl shadow-md">COURT {idx + 1}</div>
                        
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-2xl text-gray-800 drop-shadow-sm">{match.pair1.p1.name}</span>
                            <span className="text-gray-300 font-light">&</span>
                            <span className="font-black text-2xl text-gray-800 drop-shadow-sm">{match.pair1.p2.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team A</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg italic group-hover:scale-110 transition-transform shadow-lg border-2 border-white">VS</div>
                        </div>

                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-2xl text-gray-800 drop-shadow-sm">{match.pair2.p1.name}</span>
                            <span className="text-gray-300 font-light">&</span>
                            <span className="font-black text-2xl text-gray-800 drop-shadow-sm">{match.pair2.p2.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team B</span>
                        </div>
                      </div>
                    ))}
                    
                    {currentResult.pairs.length % 2 !== 0 && (
                      <div className="bg-white/90 backdrop-blur-sm border border-amber-200 p-6 rounded-[2rem] text-center shadow-md">
                        <p className="text-amber-800 font-bold italic">奇数のペア数により、1ペアが今回の対戦はお休み（Bye）です。</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <footer className="mt-20 text-center text-gray-800/60 text-xs font-black tracking-[0.2em] uppercase drop-shadow-lg">
          &copy; 2024 AmidaPair System v2.3
        </footer>
      </div>
    </div>
  );
};

export default App;
