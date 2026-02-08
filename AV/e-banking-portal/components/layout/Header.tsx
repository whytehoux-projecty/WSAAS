"use client";

import Link from 'next/link';
import { User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { NotificationCenter } from '@/components/NotificationCenter';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#6B8569] bg-[#7D9B7B] shadow-sm">
            <div className="flex h-[70px] items-center px-4 md:px-6 justify-between">

                {/* Left Side: Logo */}
                <Link href="/dashboard" className="flex items-center gap-3 h-full">

                    {/* Brand Text: e-VAULT */}
                    <div className="hidden sm:flex items-center gap-0.5 select-none">
                        <span className="font-playfair italic font-semibold text-4xl text-[#FAF9F6] drop-shadow-sm leading-none pt-1">e-</span>
                        <span className="font-playfair font-bold text-4xl text-[#D4AF7A] drop-shadow-md tracking-wide leading-none">VAULT</span>
                    </div>
                </Link>

                {/* Right Side: Notifications & User Profile */}
                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="mr-1">
                        <Select defaultValue="en">
                            <SelectTrigger className="w-auto gap-2 bg-transparent border-none text-[#FAF9F6] hover:bg-[#6B8569]/50 focus:ring-0 focus:ring-offset-0 px-2 h-8 rounded-md transition-colors">
                                <Globe className="h-4 w-4" />
                                <SelectValue placeholder="EN" />
                            </SelectTrigger>
                            <SelectContent align="end" className="bg-[#FAF9F6] border-[#6B8569]/20">
                                <SelectItem value="en">English (EN)</SelectItem>
                                <SelectItem value="fr">Français (FR)</SelectItem>
                                <SelectItem value="de">Deutsch (DE)</SelectItem>
                                <SelectItem value="es">Español (ES)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notifications */}
                    <NotificationCenter />

                    {/* User Profile */}
                    <Button
                        variant="ghost"
                        size="small"
                        className="text-[#FAF9F6] hover:bg-[#6B8569]/50 hover:text-white transition-colors"
                    >
                        <User className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
