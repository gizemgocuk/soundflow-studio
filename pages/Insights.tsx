import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockBackend } from '../services/mockBackend';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/Icons';
import { Track, TrackInsight } from '../types';

const LOADING_STEPS = [
    "Extracting audio features...",
    "Analyzing tempo and rhythm...",
    "Detecting emotional tone...",
    "Matching with industry trends...",
    "Generating final report..."
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_INSIGHTS: TrackInsight = {
    mood: "Energetic, driving, and optimistic with a futuristic cyberpunk undertone.",
    commercialViability: "8/10 - Strong potential for advertising and sports highlights.",
    suggestedPlacements: ["Tech Product Commercials", "Racing Video Games", "Sports Montages", "Action Movie Chase Scenes"],
    summary: "A high-octane electronic track that combines aggressive basslines with uplifting synth melodies.",
    generatedAt: new Date().toISOString()
};

const generateTrackInsights = async (track: Track): Promise<TrackInsight> => {
    const MIN_DELAY = 5000;
    await delay(MIN_DELAY);
    return { ...MOCK_INSIGHTS, generatedAt: new Date().toISOString() };
};

export const Insights = () => {
    const queryClient = useQueryClient();
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const { data: tracks, isLoading: tracksLoading } = useQuery({
        queryKey: ['tracks'],
        queryFn: mockBackend.getTracks
    });

    const selectedTrack = tracks?.find(t => t.id === selectedTrackId);

    const generateMutation = useMutation({
        mutationFn: async (track: Track) => {
            const insights = await generateTrackInsights(track);
            return mockBackend.updateTrackInsights(track.id, insights);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
            setLoadingStep(0);
        }
    });

    // Cycle through loading steps
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (generateMutation.isPending) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [generateMutation.isPending]);

    const handleGenerate = () => {
        if (selectedTrack) {
            generateMutation.mutate(selectedTrack);
        }
    };

    if (tracksLoading) return <div className="flex justify-center p-12"><Icons.Loader className="animate-spin w-8 h-8 text-primary" /></div>;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8">
            {/* Left List */}
            <div className="w-full md:w-80 flex flex-col bg-card border border-border rounded-xl overflow-hidden shrink-0">
                <div className="p-4 border-b border-border bg-secondary/10">
                    <h2 className="text-lg font-bold">Select Track</h2>
                    <p className="text-xs text-muted-foreground">Choose a track to analyze</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {tracks?.map(track => (
                        <button
                            key={track.id}
                            onClick={() => setSelectedTrackId(track.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${selectedTrackId === track.id
                                ? 'bg-primary/10 border-primary shadow-sm'
                                : 'bg-transparent border-transparent hover:bg-muted'
                                }`}
                        >
                            <div className={`font-medium truncate ${selectedTrackId === track.id ? 'text-primary' : ''}`}>
                                {track.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{track.artist}</div>
                            {track.insights && (
                                <div className="mt-1.5 inline-flex items-center text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                    <Icons.Sparkles className="w-2.5 h-2.5 mr-1" /> Insights Ready
                                </div>
                            )}
                        </button>
                    ))}
                    {tracks?.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No tracks found. Upload one first.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Details */}
            <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                {!selectedTrack ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                        <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                            <Icons.Sparkles className="w-10 h-10 opacity-40" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground mb-2">Audio Intelligence</h3>
                        <p className="max-w-md">Select a track from the list to analyze its sonic characteristics, commercial viability, and potential sync placements.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Track Header */}
                        <div className="p-6 md:p-8 border-b border-border bg-secondary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">{selectedTrack.title}</h2>
                                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                    <span className="font-medium text-foreground">{selectedTrack.artist}</span>
                                    <span>•</span>
                                    <span>{selectedTrack.genre}</span>
                                    <span>•</span>
                                    <span>{selectedTrack.bpm} BPM</span>
                                </div>
                            </div>
                            {!selectedTrack.insights && !generateMutation.isPending && (
                                <Button size="lg" onClick={handleGenerate} className="shadow-lg shadow-primary/20">
                                    <Icons.Sparkles className="mr-2 w-4 h-4" /> Generate Insights
                                </Button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            {generateMutation.isPending ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                        <Icons.Loader className="relative w-16 h-16 animate-spin text-primary" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-medium tabular-nums">
                                            {LOADING_STEPS[loadingStep]}
                                        </h3>
                                        <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden mx-auto mt-4">
                                            <div
                                                className="h-full bg-primary transition-all duration-500 ease-out"
                                                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            This usually takes a few seconds...
                                        </p>
                                    </div>
                                </div>
                            ) : selectedTrack.insights ? (
                                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                    {/* Summary Card */}
                                    <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Icons.Sparkles className="w-32 h-32" />
                                        </div>
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center">
                                            <Icons.Sparkles className="w-4 h-4 mr-2" /> Executive Summary
                                        </h3>
                                        <p className="text-xl md:text-2xl font-light italic leading-relaxed text-foreground/90 relative z-10">
                                            "{selectedTrack.insights.summary}"
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Mood Analysis */}
                                        <div className="bg-secondary/10 border border-border p-6 rounded-xl">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                                Mood & Atmosphere
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {selectedTrack.insights.mood}
                                            </p>
                                        </div>

                                        {/* Commercial Score */}
                                        <div className="bg-secondary/10 border border-border p-6 rounded-xl flex flex-col">
                                            <h3 className="text-lg font-semibold mb-4">Commercial Viability</h3>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-3xl font-bold text-primary">
                                                        {selectedTrack.insights.commercialViability.split(' - ')[0]}
                                                    </span>
                                                    <span className="text-muted-foreground">Score</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedTrack.insights.commercialViability.split(' - ')[1]}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Placements */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Suggested Sync Placements</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedTrack.insights.suggestedPlacements.map((tag, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-4 py-2 bg-secondary border border-border rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors cursor-default"
                                                >
                                                    {tag}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Generated on {new Date(selectedTrack.insights.generatedAt).toLocaleDateString()}</span>
                                        <Button variant="ghost" size="sm" onClick={handleGenerate} loading={generateMutation.isPending} className="text-primary hover:text-primary/80">
                                            Regenerate Analysis
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center opacity-50">
                                    <p>Analysis not yet run.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};