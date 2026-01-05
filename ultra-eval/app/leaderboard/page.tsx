'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSupabase, Student } from '@/lib/supabase';

interface LeaderboardUser extends Student {
    rank: number;
}

export default function LeaderboardPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [students, setStudents] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

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

            const rankedData = (data || []).map((s: Student, index: number) => ({
                ...s,
                rank: index + 1
            }));

            setStudents(rankedData);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeaderboard = students
        .filter(
            (entry) =>
                entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (entry.school && entry.school.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (entry.email && entry.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => (sortOrder === 'desc' ? b.elo - a.elo : a.elo - b.elo));

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return null;
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank <= 3) {
            const colors = {
                1: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                2: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
                3: 'bg-amber-600/10 text-amber-600 border-amber-600/20',
            };
            return colors[rank as 1 | 2 | 3];
        }
        return 'bg-secondary text-foreground';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="h-full p-8 bg-black">
                <div className="mx-auto max-w-6xl space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white">Ultra Leaderboard</h1>
                        <p className="mt-3 text-lg text-muted-foreground">
                            Global rankings for the world's most ambitious students.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, school, or highlight..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-zinc-950 border-zinc-800"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                    className="flex items-center gap-2 border-zinc-800"
                                >
                                    {sortOrder === 'desc' ? (
                                        <>
                                            <TrendingDown className="h-4 w-4" />
                                            Sort Ascending
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="h-4 w-4" />
                                            Sort Descending (ELO)
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leaderboard Table */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white">Student Rankings</CardTitle>
                            <CardDescription>
                                Compete with peers by logging accomplishments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {/* Header Row */}
                                <div className="grid grid-cols-[80px_1fr_150px_200px] gap-4 border-b border-zinc-800 pb-3 text-sm font-medium text-muted-foreground px-4">
                                    <div>RANK</div>
                                    <div>NAME</div>
                                    <div>ELO SCORE</div>
                                    <div>SCHOOL</div>
                                </div>

                                {/* Leaderboard Entries */}
                                {filteredLeaderboard.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={cn(
                                            'grid grid-cols-[80px_1fr_150px_200px] gap-4 rounded-lg border border-zinc-800 p-4 transition-colors hover:bg-zinc-800/50 items-center',
                                            entry.rank <= 3 && 'bg-zinc-800/30'
                                        )}
                                    >
                                        {/* Rank */}
                                        <div className="flex items-center">
                                            <Badge
                                                className={cn(
                                                    'flex h-10 w-10 items-center justify-center rounded-full text-md font-bold',
                                                    getRankBadge(entry.rank)
                                                )}
                                            >
                                                {entry.rank}
                                            </Badge>
                                        </div>

                                        {/* Name & Avatar */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-zinc-800">
                                                <AvatarImage src={entry.avatar_url} />
                                                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                                    {entry.name
                                                        ? entry.name.split(' ').map((n) => n[0]).join('')
                                                        : '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-zinc-100">{entry.name || 'Anonymous'}</p>
                                                <p className="text-xs text-muted-foreground">{entry.grade || 'Student'}</p>
                                            </div>
                                        </div>

                                        {/* ELO Score */}
                                        <div className="flex items-center">
                                            <div className="flex items-center gap-2">
                                                {getRankIcon(entry.rank)}
                                                <span className="text-xl font-bold text-white tracking-tight">{entry.elo}</span>
                                            </div>
                                        </div>

                                        {/* School */}
                                        <div className="flex items-center">
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {entry.school || 'Unspecified'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredLeaderboard.length === 0 && (
                                <div className="py-12 text-center text-muted-foreground font-medium">
                                    No students found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
