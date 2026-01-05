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
    Shield,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        const checkAdmin = async () => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            const adminEmails = ['dannywchen3@gmail.com'];
            if (user?.email && adminEmails.includes(user.email)) {
                setIsAdmin(true);
            }
        };
        checkAdmin();
    }, []);

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
        ...(isAdmin ? [{
            name: 'Admin',
            href: '/admin',
            icon: Shield,
        }] : []),
    ];

    return (
        <div
            className={cn(
                'flex h-screen w-64 flex-col border-r border-white/5 bg-black p-6',
                className
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center px-4 mb-8">
                <Link href="/" className="flex items-center gap-1.5 grayscale opacity-80 hover:opacity-100 transition-opacity">
                    <img
                        src="/White Logo 512x174.png"
                        alt="Ultra"
                        className="h-5 w-auto object-contain"
                    />
                    <span className="text-[10px] font-medium text-zinc-600 tracking-tighter mt-1">(eval)</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-200',
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
            <div className="mt-auto pt-6 border-t border-white/5 font-semibold">
                <button
                    className="flex w-full items-center gap-3 rounded-full px-5 py-3 text-[13px] text-zinc-500 transition-all duration-200 hover:bg-white/5 hover:text-white"
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
