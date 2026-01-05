'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Trophy,
    User,
    LogOut,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface SidebarProps {
    className?: string;
}

const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Leaderboard',
        href: '/leaderboard',
        icon: Trophy,
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: User,
    },
];

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div
            className={cn(
                'flex h-screen w-64 flex-col border-r border-white/5 bg-black p-6',
                className
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center px-4 mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="text-2xl font-bold tracking-tighter text-white">
                        Ultra<span className="text-[10px] ml-1 font-bold bg-white text-black px-2 py-0.5 rounded-full uppercase">eval</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold transition-all duration-200',
                                isActive
                                    ? 'bg-white text-black'
                                    : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            <item.icon className={cn("h-4 w-4", isActive ? "text-black" : "text-zinc-500")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="mt-auto pt-6 border-t border-white/5 font-bold">
                <button
                    className="flex w-full items-center gap-3 rounded-full px-5 py-3 text-sm text-zinc-500 transition-all duration-200 hover:bg-white/5 hover:text-white"
                    onClick={async () => {
                        const supabase = getSupabase();
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
