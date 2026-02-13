import React from 'react';
import { Mic, Volume2, User, Activity } from 'lucide-react';

interface StatusPanelProps {
    status: 'IDLE' | 'WELCOMING' | 'LISTENING' | 'SPEAKING' | 'THINKING';
    personDetected: boolean;
    personCount: number;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ status, personDetected, personCount }) => {

    const getStatusColor = () => {
        switch (status) {
            case 'IDLE': return 'text-gray-400';
            case 'WELCOMING': return 'text-purple-400';
            case 'LISTENING': return 'text-green-400';
            case 'SPEAKING': return 'text-blue-400';
            case 'THINKING': return 'text-yellow-400';
            default: return 'text-white';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'IDLE': return 'Waiting...';
            case 'WELCOMING': return 'Greeting...';
            case 'LISTENING': return 'Listening...';
            case 'SPEAKING': return 'Speaking...';
            case 'THINKING': return 'Processing...';
            default: return 'Ready';
        }
    };

    return (
        <div className="flex flex-col h-full glass-panel neon-border-cyan rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Activity className="w-96 h-96 text-cyan-500 -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Avatar Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className={`relative w-64 h-64 flex items-center justify-center transition-all duration-500`}>

                    {/* Ripple Effects for Speaking/Listening */}
                    {(status === 'SPEAKING' || status === 'LISTENING') && (
                        <>
                            <div className={`absolute inset-0 rounded-full opacity-30 animate-ping ${status === 'SPEAKING' ? 'bg-cyan-500' : 'bg-green-500'}`}></div>
                            <div className={`absolute inset-4 rounded-full opacity-40 animate-pulse ${status === 'SPEAKING' ? 'bg-cyan-500' : 'bg-green-500'}`}></div>
                        </>
                    )}

                    <div className={`relative w-48 h-48 rounded-full flex items-center justify-center backdrop-blur-sm border-4 transition-all duration-300
                        ${status === 'LISTENING' ? 'border-green-400 bg-green-500/10 shadow-[0_0_50px_rgba(74,222,128,0.3)]' :
                            status === 'SPEAKING' ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_50px_rgba(34,211,238,0.3)]' :
                                'border-slate-700 bg-slate-800/50'}`}>

                        {status === 'LISTENING' && <Mic className="w-20 h-20 text-green-400 animate-bounce" />}
                        {status === 'SPEAKING' && <Volume2 className="w-20 h-20 text-cyan-400" />}
                        {status === 'IDLE' && <Activity className="w-20 h-20 text-slate-500" />}
                        {status === 'WELCOMING' && <User className="w-20 h-20 text-purple-400" />}

                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm font-mono-tech text-cyan-500/60 tracking-widest mb-2">CURRENT STATE</p>
                    <h2 className={`text-3xl font-tech font-bold ${getStatusColor()} text-glow transition-all duration-300`}>
                        {getStatusText()}
                    </h2>
                </div>
            </div>

            {/* Info Stats */}
            <div className="mt-8 space-y-4 z-10">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                        <h3 className="text-[10px] text-gray-400 font-mono-tech uppercase tracking-widest mb-2">DETECTION</h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${personDetected ? 'bg-cyan-400 box-shadow-glow' : 'bg-slate-700'}`}></div>
                            <span className={`font-mono text-lg font-bold ${personDetected ? 'text-white' : 'text-slate-500'}`}>
                                {personDetected ? 'ACTIVE' : 'NONE'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                        <h3 className="text-[10px] text-gray-400 font-mono-tech uppercase tracking-widest mb-2">VISITORS</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-white leading-none">{personCount}</span>
                            <span className="text-xs text-slate-500 mb-1">DETECTED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusPanel;
