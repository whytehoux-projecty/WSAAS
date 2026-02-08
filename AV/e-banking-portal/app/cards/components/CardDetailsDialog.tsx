"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, Copy, Lock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner" // Assuming sonner or generic toast, fallback to alert if needed

interface CardDetailsDialogProps {
    card: any;
}

export function CardDetailsDialog({ card }: CardDetailsDialogProps) {
    const [showPin, setShowPin] = useState(false)
    const [showCvv, setShowCvv] = useState(false)

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        // In a real app, use toast here. For now, just logging or relying on user feedback visually
        alert(`${label} copied to clipboard`);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="small" className="gap-2 bg-white/20 backdrop-blur-md border-white/40 text-white hover:bg-white/30 hover:text-white">
                    <Eye className="w-4 h-4" /> View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Card Details</DialogTitle>
                    <DialogDescription>
                        Securely view your card information and PIN.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label>Card Number</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={card.number} className="font-mono bg-muted" />
                            <Button size="icon" variant="outline" onClick={() => handleCopy(card.number, 'Card Number')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Expiry</Label>
                            <Input readOnly value={card.expiry} className="font-mono bg-muted" />
                        </div>
                        <div className="grid gap-2">
                            <Label>CVV</Label>
                            <div className="relative">
                                <Input readOnly value={showCvv ? card.cvc : '•••'} className="font-mono bg-muted pr-10" />
                                <button
                                    onClick={() => setShowCvv(!showCvv)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showCvv ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2 border-t pt-4 mt-2">
                        <Label className="text-base font-semibold">PIN Code</Label>
                        <div className="flex gap-2 items-center bg-yellow-50/50 p-3 rounded-md border border-yellow-200">
                            <div className="flex-1 font-mono text-xl tracking-widest text-center">
                                {showPin ? '1234' : '••••'}
                            </div>
                            <Button variant="ghost" size="small" onClick={() => setShowPin(!showPin)}>
                                {showPin ? 'Hide' : 'Reveal'}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                            Never share your PIN with anyone, including bank staff.
                        </p>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
