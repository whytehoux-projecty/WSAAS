'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'; // Ensure this path is correct based on list_dir
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

export function NotificationCenter({ onClick }: { onClick?: () => void }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const hasNetworkError = useRef(false);

    const fetchNotifications = async () => {
        if (hasNetworkError.current) {
            return;
        }
        try {
            const res = await api.notifications.getAll();
            if (res.data) {
                // Simple logic: if new data comes in, we assume it's unread if we haven't seen it?
                // For now, let's just count all recent ones as "Activity"
                setUnreadCount(res.data.length);
            }
        } catch (error) {
            hasNetworkError.current = true;
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            if (!hasNetworkError.current) {
                fetchNotifications();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Button
            variant="ghost"
            size="small"
            onClick={onClick}
            className="text-[#1E4B35] hover:bg-[#1E4B35]/10 hover:text-[#1E4B35] relative transition-colors"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF7A] rounded-full border-2 border-transparent"></span>
            )}
        </Button>
    );
}
