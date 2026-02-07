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
            <DialogContent className="sm:max-w-[400px] border-none shadow-instituto-lg overflow-hidden p-0 gap-0 rounded-2xl bg-white">
                <div className={cn(
                    "h-2 w-full",
                    variant === "destructive" ? "bg-red-500" : "bg-primary"
                )} />

                <div className="p-6 pt-8">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "p-3 rounded-full shrink-0",
                            variant === "destructive" ? "bg-red-50" : "bg-primary/10"
                        )}>
                            {variant === "destructive" ? (
                                <AlertTriangle className="text-red-600" size={24} />
                            ) : (
                                <Info className="text-primary" size={24} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-[#1e3a5f]">
                                    {title}
                                </DialogTitle>
                            </DialogHeader>
                            <DialogDescription className="text-gray-500 leading-relaxed">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50/50 p-4 sm:p-6 flex-row gap-3 sm:justify-end border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 font-bold h-11"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 sm:flex-none font-bold h-11 shadow-sm transition-all",
                            variant === "default" && "bg-primary hover:bg-primary-light"
                        )}
                    >
                        {isLoading ? "Procesando..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
