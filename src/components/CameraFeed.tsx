import React from 'react';
import Webcam from 'react-webcam';

interface CameraFeedProps {
    webcamRef: React.RefObject<Webcam | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isLoaded: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ webcamRef, canvasRef, isLoaded }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
            {/* Loading State */}
            {!isLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-950">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                    <div className="text-cyan-400 font-mono-tech animate-pulse tracking-widest text-sm">
                        INITIALIZING NEURAL NET...
                    </div>
                </div>
            )}

            <Webcam
                ref={webcamRef}
                muted={true}
                className="absolute w-full h-full object-cover opacity-90"
                videoConstraints={{
                    facingMode: "user"
                }}
            />

            <canvas
                ref={canvasRef}
                className="absolute w-full h-full object-cover z-10"
            />

            {/* HUD Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none z-20">
                {/* Crosshairs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] border border-cyan-500/20 opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-cyan-500/10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-cyan-500/10"></div>
            </div>

            {/* System Status Badge */}
            <div className="absolute top-6 left-6 z-30">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30">
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${isLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {isLoaded && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-cyan-500/70 font-mono-tech leading-none mb-1">STATUS</span>
                        <span className="text-xs text-white tracking-widest font-mono-tech font-bold">
                            {isLoaded ? 'SYSTEM ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Camera Info */}
            <div className="absolute top-6 right-6 z-30">
                <div className="text-right text-[10px] text-cyan-500/50 font-mono-tech leading-tight">
                    <p>CAM_01: ACTIVE</p>
                    <p>RES: 1080p</p>
                    <p>FPS: 60</p>
                </div>
            </div>
        </div>
    );
};

export default CameraFeed;
