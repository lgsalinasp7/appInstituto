'use client';

import { Code2, Sparkles, Users, Briefcase, Rocket, MessageCircle, FolderGit2, Globe, Zap, UserCheck, Award } from 'lucide-react';

const iconMap = {
  Sparkles,
  Code2,
  Users,
  Briefcase,
  Rocket,
  MessageCircle,
  FolderGit2,
  Globe,
  Zap,
  UserCheck,
  Award,
};

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface BenefitsSectionProps {
  benefits: Benefit[];
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#1e3a5f] mb-4 font-display">
            ¿Qué incluye el bootcamp?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todo lo que necesitas para convertirte en desarrollador Full Stack profesional
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon as keyof typeof iconMap] || Code2;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-instituto-md card-hover border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
