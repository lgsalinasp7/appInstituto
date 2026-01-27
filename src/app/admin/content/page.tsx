"use client";

import { useState } from "react";
import { ContentManager } from "@/modules/content/components/ContentManager";
import { ContentDeliveryManager } from "@/modules/content/components/ContentDeliveryManager";
import { BookOpen, Package, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminContentPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-primary tracking-tight">
                    Gestión de Módulos y Entregas
                </h1>
                <p className="text-gray-500 font-medium">
                    Controla el material educativo y el flujo de entrega a los estudiantes.
                </p>
            </div>

            <Tabs defaultValue="management" className="w-full">
                <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-14 w-full md:w-auto">
                    <TabsTrigger
                        value="management"
                        className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2"
                    >
                        <Layers size={18} />
                        Estructura Académica
                    </TabsTrigger>
                    <TabsTrigger
                        value="delivery"
                        className="rounded-xl px-8 h-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-bold transition-all gap-2"
                    >
                        <Package size={18} />
                        Control de Entregas
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="management" className="focus-visible:outline-none focus-visible:ring-0">
                        <ContentManager />
                    </TabsContent>
                    <TabsContent value="delivery" className="focus-visible:outline-none focus-visible:ring-0">
                        <ContentDeliveryManager />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
