'use client';

interface TechItem {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'ai-tools';
}

interface TechStackSectionProps {
  techStack: TechItem[];
}

const categoryLabels = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Base de Datos',
  'ai-tools': 'Herramientas de IA',
};

const categoryColors = {
  frontend: 'from-blue-500 to-cyan-500',
  backend: 'from-green-500 to-emerald-500',
  database: 'from-purple-500 to-pink-500',
  'ai-tools': 'from-orange-500 to-red-500',
};

export function TechStackSection({ techStack }: TechStackSectionProps) {
  const groupedTech = techStack.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, TechItem[]>);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#1e3a5f] mb-4 font-display">
            Stack Tecnológico
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aprende las tecnologías que buscan las empresas en 2026
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(groupedTech).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]} text-white font-bold text-sm shadow-lg`}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </div>

              <div className="space-y-3">
                {items.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span className="font-semibold text-gray-700">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Destacar herramientas de IA */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <h3 className="text-2xl font-bold text-[#1e3a5f]">
              Ventaja Competitiva: IA
            </h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Dominarás <strong>Cursor AI, Claude Code y Antigravity</strong> para desarrollar 10x más rápido que programadores tradicionales.
            Mientras otros escriben código línea por línea, tú orquestarás IA para construir features completos en minutos.
          </p>
        </div>
      </div>
    </section>
  );
}
