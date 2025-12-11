import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '../ui/Button';
import { Icons } from '../Icons';

interface AudioPlayerProps {
  url: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  className?: string;
}

const formatTime = (seconds: number) => {
  if (!seconds && seconds !== 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  url,
  height = 48,
  waveColor = '#52525b', // Zinc 600
  progressColor = '#6366f1', // Indigo 500
  cursorColor = 'transparent',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WaveSurfer
    try {
      wavesurfer.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: waveColor,
        progressColor: progressColor,
        cursorColor: cursorColor,
        height: height,
        barWidth: 2,
        barGap: 3,
        barRadius: 3,
        normalize: true,
        backend: 'WebAudio', // Allows for better audio processing
        url: url,
      });

      // Events
      wavesurfer.current.on('ready', (dur) => {
        setIsReady(true);
        setDuration(dur);
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      
      wavesurfer.current.on('timeupdate', (time) => {
        setCurrentTime(time);
      });

      wavesurfer.current.on('finish', () => {
        setIsPlaying(false);
        wavesurfer.current?.setTime(0);
      });

      wavesurfer.current.on('error', (err) => {
          console.error("Wavesurfer error:", err);
          setError("Failed to load audio");
      });

    } catch (e) {
      console.error(e);
      setError("Error initializing player");
    }

    return () => {
      if (wavesurfer.current) {
        try {
          wavesurfer.current.destroy();
        } catch (e) {
          // ignore destroy errors
        }
      }
    };
  }, [url, height, waveColor, progressColor, cursorColor]);

  const togglePlay = useCallback(() => {
    if (wavesurfer.current && isReady) {
      wavesurfer.current.playPause();
    }
  }, [isReady]);

  return (
    <div className={`flex items-center gap-4 bg-secondary/20 border border-border/50 rounded-xl p-3 shadow-sm transition-all hover:border-primary/20 ${className}`}>
      {/* Play/Pause Button */}
      <Button 
        onClick={togglePlay} 
        disabled={!isReady || !!error}
        size="icon"
        variant="primary"
        className="shrink-0 w-10 h-10 rounded-full shadow-md"
      >
        {isReady ? (
            isPlaying ? <Icons.Pause className="w-5 h-5 fill-current" /> : <Icons.Play className="w-5 h-5 ml-0.5 fill-current" />
        ) : (
             <Icons.Loader className="w-5 h-5 animate-spin" />
        )}
      </Button>

      {/* Current Time */}
      <div className="w-10 text-xs font-mono text-muted-foreground text-center shrink-0">
        {formatTime(currentTime)}
      </div>

      {/* Waveform Container */}
      <div className="flex-1 min-w-0 relative group cursor-pointer">
        <div 
            ref={containerRef} 
            className={`w-full transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-50'}`} 
        />
        {error && (
            <div className="absolute inset-0 flex items-center justify-center text-destructive text-xs font-medium bg-background/80">
                {error}
            </div>
        )}
      </div>

      {/* Duration */}
      <div className="w-10 text-xs font-mono text-muted-foreground text-center shrink-0">
        {formatTime(duration)}
      </div>
    </div>
  );
};
