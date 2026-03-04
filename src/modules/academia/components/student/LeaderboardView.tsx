"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Star, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { LeaderboardResponse } from "@/modules/academia/types";

const RANK_STYLES: Record<number, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  1: {
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-300",
    icon: <Trophy className="w-4 h-4 text-amber-300" />,
    label: "1°",
  },
  2: {
    bg: "bg-slate-400/10 border-slate-400/25",
    text: "text-slate-300",
    icon: <Medal className="w-4 h-4 text-slate-300" />,
    label: "2°",
  },
  3: {
    bg: "bg-orange-700/15 border-orange-600/25",
    text: "text-orange-400",
    icon: <Medal className="w-4 h-4 text-orange-400" />,
    label: "3°",
  },
};

function UserAvatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
    );
  }
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/10">
      {initials}
    </div>
  );
}

export function LeaderboardView() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/student/leaderboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxPoints = data?.entries[0]?.points ?? 1;

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <h1 className="text-2xl font-bold text-white mb-4 font-display tracking-tight">Leaderboard</h1>
        <p className="text-slate-400">Calculando ranking...</p>
      </div>
    );
  }

  const entries = data?.entries ?? [];
  const currentUser = data?.currentUserEntry;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Leaderboard</h1>
        <p className="text-slate-400 mt-1 text-base">Ranking de progreso por lecciones completadas.</p>
      </header>

      {/* Podio top-3 */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {/* 2° puesto */}
          <div className="academy-card-dark flex flex-col items-center gap-2 p-4 pt-5">
            <UserAvatar name={entries[1].name} image={entries[1].image} />
            <div className="flex items-center gap-1">
              <Medal className="w-4 h-4 text-slate-300" />
              <span className="text-xs font-bold text-slate-300">2°</span>
            </div>
            <p className="text-sm font-semibold text-white text-center truncate max-w-full">{entries[1].name.split(" ")[0]}</p>
            <p className="text-xs text-slate-400">{entries[1].points} pts</p>
          </div>

          {/* 1° puesto */}
          <div className="academy-card-dark flex flex-col items-center gap-2 p-4 border-amber-500/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-full p-1.5">
                <Trophy className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div className="mt-2">
              <UserAvatar name={entries[0].name} image={entries[0].image} />
            </div>
            <span className="text-xs font-bold text-amber-300">1°</span>
            <p className="text-sm font-semibold text-white text-center truncate max-w-full">{entries[0].name.split(" ")[0]}</p>
            <p className="text-xs text-amber-300 font-bold">{entries[0].points} pts</p>
          </div>

          {/* 3° puesto */}
          <div className="academy-card-dark flex flex-col items-center gap-2 p-4 pt-5">
            <UserAvatar name={entries[2].name} image={entries[2].image} />
            <div className="flex items-center gap-1">
              <Medal className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-400">3°</span>
            </div>
            <p className="text-sm font-semibold text-white text-center truncate max-w-full">{entries[2].name.split(" ")[0]}</p>
            <p className="text-xs text-slate-400">{entries[2].points} pts</p>
          </div>
        </div>
      )}

      {/* Mi posición */}
      {currentUser && (
        <div className={cn(
          "academy-card-dark p-4 flex items-center gap-4",
          currentUser.rank <= 3 ? RANK_STYLES[currentUser.rank]?.bg ?? "" : "border-cyan-500/20"
        )}>
          <div className="flex items-center gap-2 shrink-0">
            <Star className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mi posición</span>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar name={currentUser.name} image={currentUser.image} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.points} lecciones completadas</p>
            </div>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="text-2xl font-black text-white font-display">#{currentUser.rank}</p>
            <p className="text-xs text-slate-500">de {entries.length}</p>
          </div>
        </div>
      )}

      {/* Tabla completa */}
      <div className="academy-card-dark overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Flame className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white font-display">Ranking Completo</h2>
          <span className="ml-auto text-xs text-slate-500">{entries.length} participantes</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {entries.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              Aún no hay progreso registrado.
            </div>
          )}
          {entries.map((entry) => {
            const rankStyle = RANK_STYLES[entry.rank];
            const isCurrentUser = currentUser?.userId === entry.userId;
            const barWidth = maxPoints > 0 ? (entry.points / maxPoints) * 100 : 0;

            return (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]",
                  isCurrentUser && "bg-cyan-500/[0.05]"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border",
                  rankStyle ? cn(rankStyle.bg, rankStyle.text) : "bg-white/[0.04] text-slate-400 border-white/[0.06]"
                )}>
                  {rankStyle ? rankStyle.icon : entry.rank}
                </div>

                {/* Avatar + nombre */}
                <UserAvatar name={entry.name} image={entry.image} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-semibold truncate", isCurrentUser ? "text-cyan-300" : "text-white")}>
                      {entry.name}
                    </p>
                    {isCurrentUser && (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">
                        Tú
                      </span>
                    )}
                  </div>
                  {/* Barra proporcional */}
                  <div className="h-1.5 rounded-full bg-white/[0.06] mt-1.5 overflow-hidden w-full max-w-[200px]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Puntos */}
                <div className="shrink-0 text-right">
                  <p className={cn("text-sm font-bold", rankStyle ? rankStyle.text : "text-slate-300")}>
                    {entry.points}
                  </p>
                  <p className="text-[10px] text-slate-500">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
