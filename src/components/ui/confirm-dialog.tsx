"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "default",
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px] overflow-hidden p-0 gap-0">
                <div className={cn(
                    "h-2 w-full",
                    variant === "destructive"
                        ? "bg-gradient-to-r from-red-500 to-rose-500"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600"
                )} />

                <div className="p-6 pt-8">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "p-3 rounded-2xl shrink-0 border",
                            variant === "destructive"
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-cyan-500/10 border-cyan-500/30"
                        )}>
                            {variant === "destructive" ? (
                                <AlertTriangle className="text-red-400" size={24} />
                            ) : (
                                <Info className="text-cyan-400" size={24} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <DialogHeader>
                                <DialogTitle>
                                    {title}
                                </DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 sm:p-6 flex-row gap-3 sm:justify-end border-t border-white/10 bg-slate-950/40">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none h-11 rounded-xl border-white/15 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 sm:flex-none h-11 rounded-xl font-bold transition-all",
                            variant === "default" && "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
                        )}
                    >
                        {isLoading ? "Procesando..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
