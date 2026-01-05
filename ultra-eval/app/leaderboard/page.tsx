'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    Trophy,
    Search,
    ChevronUp,
    ChevronDown,
    Crown,
    Star,
    Sparkles,
    Loader2,
    School
} from 'lucide-react';
import { getSupabase, Student, LeaderboardEntry } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{
        key: 'elo' | 'name' | 'school';
        direction: 'asc' | 'desc';
    }>({ key: 'elo', direction: 'desc' });

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('elo', { ascending: false });

            if (error) throw error;

            // Add ranks manually
            const rankedData = (data || []).map((student: any, index: number) => ({
                ...student,
                rank: index + 1,
            }));

            setLeaderboard(rankedData);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: 'elo' | 'name' | 'school') => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const filteredLeaderboard = leaderboard.filter((entry) => {
        const query = searchQuery.toLowerCase();
        return (
            entry.name?.toLowerCase().includes(query) ||
            entry.school?.toLowerCase().includes(query)
        );
    }).sort((a, b) => {
        const { key, direction } = sortConfig;
        if (a[key]! < b[key]!) return direction === 'asc' ? -1 : 1;
        if (a[key]! > b[key]!) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center bg-black">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black text-white p-6 md:p-12 bg-mesh overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-[0.2em] text-xs">
                                <Sparkles className="h-4 w-4" /> Global Competition
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black tracking-tighter">Leaderboard</h1>
                        </motion.div>

                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or school..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900 border-none rounded-full py-5 pl-14 pr-6 text-sm font-bold placeholder:text-zinc-600 focus:ring-2 focus:ring-white/10 outline-none transition-all shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Top 3 Podiums */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredLeaderboard.slice(0, 3).map((entry, i) => {
                            const isGold = i === 0;
                            const isSilver = i === 1;
                            const isBronze = i === 2;
                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        "glass-card p-10 relative flex flex-col items-center text-center group transition-all",
                                        isGold ? "border-yellow-500/20 bg-yellow-500/5" : "",
                                        isSilver ? "border-zinc-400/20" : "",
                                        isBronze ? "border-orange-500/20 bg-orange-500/5" : ""
                                    )}
                                >
                                    <div className="absolute top-6 left-6 text-zinc-700 font-black text-4xl">#{i + 1}</div>

                                    <div className="relative mb-6">
                                        <div className={cn(
                                            "h-24 w-24 rounded-full flex items-center justify-center font-black text-3xl border-4",
                                            isGold ? "border-yellow-500 text-yellow-500" : "border-zinc-800 text-zinc-300"
                                        )}>
                                            {entry.name?.[0]}
                                        </div>
                                        {isGold && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-10 w-10 text-yellow-500 fill-yellow-500" />}
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tight mb-1">{entry.name}</h3>
                                    <p className="text-zinc-500 font-bold text-sm mb-6 flex items-center justify-center gap-1">
                                        <School className="h-3 w-3" /> {entry.school || 'Unlisted School'}
                                    </p>

                                    <div className="bg-white text-black px-6 py-2 rounded-full font-black text-xl tracking-tighter">
                                        {entry.elo} <span className="text-[10px] uppercase ml-1 opacity-60">ELO</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Full List */}
                    <div className="glass-card overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 border-b border-white/5 p-8 text-xs font-black uppercase tracking-widest text-zinc-500">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-5 cursor-pointer hover:text-white transition-colors flex items-center gap-1" onClick={() => handleSort('name')}>
                                Student {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                            </div>
                            <div className="col-span-4 cursor-pointer hover:text-white transition-colors flex items-center gap-1" onClick={() => handleSort('school')}>
                                School {sortConfig.key === 'school' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                            </div>
                            <div className="col-span-2 text-right cursor-pointer hover:text-white transition-colors flex items-center gap-1 justify-end" onClick={() => handleSort('elo')}>
                                ELO {sortConfig.key === 'elo' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                            </div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {filteredLeaderboard.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-12 gap-4 p-8 items-center group hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="col-span-1 font-black text-xl text-zinc-600">#{entry.rank}</div>
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-sm border border-white/5">
                                            {entry.name?.[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg tracking-tight group-hover:text-white transition-colors">{entry.name}</span>
                                            {entry.highlight && <span className="text-xs text-zinc-500 font-medium italic">{entry.highlight}</span>}
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-zinc-500 font-bold text-sm">
                                        {entry.school || '--'}
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <div className="inline-flex items-center gap-1 bg-white/5 px-4 py-2 rounded-full font-black text-lg">
                                            {entry.elo} <Star className="h-3 w-3 text-white fill-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
