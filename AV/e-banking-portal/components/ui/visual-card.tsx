import { cn } from "@/lib/utils"
import { Wifi, Aperture } from 'lucide-react'

interface VisualCardProps {
    name: string;
    number: string;
    expiry: string;
    cvc: string;
    type: 'gold' | 'platinum' | 'metal' | 'standard';
    className?: string;
}

export function VisualCard({ name, number, expiry, cvc, type, className }: VisualCardProps) {

    const getBackground = (type: string) => {
        switch (type) {
            case 'gold': return 'bg-gradient-to-br from-[#D4AF7A] via-[#E5C596] to-[#B8941F] border-[#F9F7F4]/20';
            case 'platinum': return 'bg-gradient-to-br from-[#E5E4E2] via-[#F4F4F4] to-[#B0B0B0] border-white/30';
            case 'metal': return 'bg-gradient-to-br from-[#2C2C2C] via-[#4A4A4A] to-[#1A1A1A] border-white/10 text-white';
            case 'standard': return 'bg-gradient-to-br from-vintage-green to-vintage-green-dark border-white/20 text-white';
            default: return 'bg-gray-800';
        }
    }

    const getTextColor = (type: string) => {
        switch (type) {
            case 'gold': return 'text-[#3D3D3D]'; // Dark charcoal for contrast on gold
            case 'platinum': return 'text-[#3D3D3D]';
            default: return 'text-white';
        }
    }

    // Format number to chunks of 4
    const formattedNumber = number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();

    return (
        <div className={cn(
            "relative w-full aspect-[1.586/1] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl flex flex-col justify-between overflow-hidden border",
            getBackground(type),
            getTextColor(type),
            className
        )}>
            {/* Glossy Overlay Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />

            {/* Header: Chip and Contactless */}
            <div className="relative z-10 flex justify-between items-start">
                <div className="w-12 h-9 bg-yellow-200/40 rounded-md border border-yellow-400/30 flex items-center justify-center overflow-hidden">
                    {/* Chip Detail simulation */}
                    <div className="w-full h-[1px] bg-yellow-600/20 absolute top-1/2" />
                    <div className="h-full w-[1px] bg-yellow-600/20 absolute left-1/3" />
                    <div className="h-full w-[1px] bg-yellow-600/20 absolute right-1/3" />
                </div>
                <Wifi className="w-6 h-6 opacity-80 rotate-90" />
            </div>

            {/* Card Number */}
            <div className="relative z-10 mt-4">
                <p className="text-xl md:text-2xl font-mono tracking-widest drop-shadow-sm font-semibold">
                    {formattedNumber}
                </p>
            </div>

            {/* Footer: Details and Logo */}
            <div className="relative z-10 flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex gap-8">
                        <div>
                            <p className="text-[10px] uppercase opacity-75 tracking-wider">Card Holder</p>
                            <p className="font-medium tracking-wide uppercase font-mono text-sm shadow-black/10">{name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase opacity-75 tracking-wider">Expires</p>
                            <p className="font-medium tracking-wide font-mono text-sm">{expiry}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="font-bold italic text-lg opacity-90">VISA</div>
                    <div className="text-[8px] uppercase tracking-widest opacity-60">Infinite</div>
                </div>
            </div>
        </div>
    )
}
