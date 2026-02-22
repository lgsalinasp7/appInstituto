'use client';

/**
 * MasterclassCountdown - Cuenta regresiva para masterclass
 * Muestra días:horas:minutos:segundos hasta la fecha programada
 */

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface MasterclassCountdownProps {
  scheduledAt: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function MasterclassCountdown({ scheduledAt }: MasterclassCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(scheduledAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Calcular inmediatamente
    setTimeLeft(calculateTimeLeft());

    // Actualizar cada segundo
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledAt]);

  if (!timeLeft) {
    return null;
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-cyan-400" />
        <h3 className="text-2xl font-bold text-white">Masterclass en vivo</h3>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-4xl font-bold text-cyan-400">{days}</div>
          <div className="text-sm text-white/70 mt-1">Días</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-4xl font-bold text-cyan-400">{hours}</div>
          <div className="text-sm text-white/70 mt-1">Horas</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-4xl font-bold text-cyan-400">{minutes}</div>
          <div className="text-sm text-white/70 mt-1">Min</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-4xl font-bold text-cyan-400">{seconds}</div>
          <div className="text-sm text-white/70 mt-1">Seg</div>
        </div>
      </div>

      <p className="text-center text-white/80 mt-6">
        {new Date(scheduledAt).toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}
