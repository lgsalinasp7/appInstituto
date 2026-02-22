/**
 * Configuración de contenido para las 3 variaciones de landing pages
 * Cada landing tiene un enfoque psicológico diferente
 */

export interface LandingConfig {
  slug: string;
  variant: 'super-programmer' | 'accelerated-learning' | 'professional-freedom';

  // SEO
  title: string;
  description: string;

  // Hero Section
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundGradient: string;
  };

  // Masterclass
  masterclass: {
    title: string;
    subtitle: string;
    duration: string;
  };

  // Beneficios
  benefits: {
    icon: string;
    title: string;
    description: string;
  }[];

  // Stack tecnológico
  techStack: {
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'ai-tools';
  }[];

  // Testimonios específicos por ángulo
  testimonials: {
    name: string;
    role: string;
    quote: string;
    avatar?: string;
  }[];

  // WhatsApp
  whatsapp: {
    message: string;
  };
}

export const landingConfigs: Record<string, LandingConfig> = {
  // Landing 1: Súper Programador (Poder con IA)
  'super-programmer': {
    slug: 'super-programmer',
    variant: 'super-programmer',

    title: 'Cómo programar 10x más rápido usando IA | Bootcamp Full Stack Developer',
    description: 'Descubre las herramientas de IA que usan los desarrolladores de élite para construir proyectos en semanas, no en meses. Bootcamp de 12 meses.',

    hero: {
      headline: 'Cómo programar 10x más rápido usando IA',
      subheadline: 'Descubre las herramientas que usan los desarrolladores de élite para construir proyectos en semanas, no en meses',
      ctaText: 'Quiero aprender con IA',
      backgroundGradient: 'from-blue-900 via-indigo-900 to-purple-900',
    },

    masterclass: {
      title: 'Masterclass Gratuita',
      subtitle: 'Aprende a usar Cursor, Claude Code y Antigravity para desarrollar 10x más rápido',
      duration: '90 minutos',
    },

    benefits: [
      {
        icon: 'Sparkles',
        title: 'Aprenderás con IA',
        description: 'Domina Cursor, Claude Code y Antigravity. Las herramientas que multiplican tu productividad como desarrollador.',
      },
      {
        icon: 'Code2',
        title: 'Proyectos reales desde el primer día',
        description: 'Nada de teoría sin sentido. Construyes aplicaciones reales mientras aprendes.',
      },
      {
        icon: 'Users',
        title: 'Mentoría personalizada',
        description: 'Acompañamiento 1-on-1 con desarrolladores senior que ya trabajan en el mercado internacional.',
      },
      {
        icon: 'Briefcase',
        title: 'Portfolio de proyectos',
        description: 'Terminas con 5+ proyectos reales desplegados que puedes mostrar en entrevistas.',
      },
    ],

    techStack: [
      { name: 'HTML & CSS', category: 'frontend' },
      { name: 'React', category: 'frontend' },
      { name: 'Next.js', category: 'frontend' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Cursor AI', category: 'ai-tools' },
      { name: 'Claude Code', category: 'ai-tools' },
      { name: 'Antigravity', category: 'ai-tools' },
    ],

    testimonials: [
      {
        name: 'Carlos Méndez',
        role: 'Developer en startup USA',
        quote: 'Antes tardaba semanas en features que ahora termino en días. Cursor y Claude Code cambiaron mi forma de programar.',
      },
      {
        name: 'Ana Sofía Rivera',
        role: 'Freelancer Full Stack',
        quote: 'Puedo aceptar más proyectos porque desarrollo mucho más rápido. Mis clientes están felices con los tiempos de entrega.',
      },
      {
        name: 'Miguel Torres',
        role: 'Frontend Developer',
        quote: 'La IA no me quitó el trabajo, me hizo 10x mejor. Ahora compito con seniors que tienen años de experiencia.',
      },
    ],

    whatsapp: {
      message: 'Hola! Vi la masterclass "Cómo programar 10x más rápido usando IA" y quiero más información sobre el bootcamp.',
    },
  },

  // Landing 2: Aprendizaje Acelerado (Anti-Universidad)
  'accelerated-learning': {
    slug: 'accelerated-learning',
    variant: 'accelerated-learning',

    title: 'Aprende a programar al ritmo del mercado tech | Bootcamp Full Stack Developer',
    description: '12 meses de proyectos reales vs 5 años de teoría: tú decides. Bootcamp práctico para convertirte en desarrollador Full Stack.',

    hero: {
      headline: 'Aprende a programar al ritmo del mercado tech, no del salón de clase',
      subheadline: '12 meses de proyectos reales vs 5 años de teoría: tú decides',
      ctaText: 'Quiero empezar ya',
      backgroundGradient: 'from-cyan-900 via-blue-900 to-indigo-900',
    },

    masterclass: {
      title: 'Masterclass Gratuita',
      subtitle: 'Descubre por qué aprender haciendo te llevará más lejos que años de teoría',
      duration: '90 minutos',
    },

    benefits: [
      {
        icon: 'Rocket',
        title: 'Proyectos reales desde el primer día',
        description: 'Olvídate de ejercicios aburridos. Construyes aplicaciones que funcionan desde la primera semana.',
      },
      {
        icon: 'Sparkles',
        title: 'Stack moderno con IA',
        description: 'React, Next.js, PostgreSQL y herramientas de IA como Cursor. Lo que las empresas buscan HOY.',
      },
      {
        icon: 'MessageCircle',
        title: 'Mentoría personalizada',
        description: 'Desarrolladores reales te guían. Sin profesores teóricos que nunca han trabajado en tech.',
      },
      {
        icon: 'FolderGit2',
        title: 'Portfolio profesional',
        description: 'GitHub con proyectos desplegados. Eso vale más que cualquier certificado universitario.',
      },
    ],

    techStack: [
      { name: 'HTML & CSS', category: 'frontend' },
      { name: 'React', category: 'frontend' },
      { name: 'Next.js', category: 'frontend' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Cursor AI', category: 'ai-tools' },
      { name: 'Claude Code', category: 'ai-tools' },
      { name: 'Antigravity', category: 'ai-tools' },
    ],

    testimonials: [
      {
        name: 'David Gómez',
        role: 'Ex-estudiante de Ingeniería',
        quote: 'En 8 meses aprendí más que en 4 años de universidad. Ahora trabajo remoto y gano mejor.',
      },
      {
        name: 'Laura Martínez',
        role: 'Developer en agencia digital',
        quote: 'La universidad me enseñó teoría obsoleta. Aquí aprendí lo que realmente usan las empresas.',
      },
      {
        name: 'Andrés Ruiz',
        role: 'Full Stack Developer',
        quote: 'Me hubiera ahorrado 4 años si hubiera encontrado esto antes. Puro código real, cero relleno.',
      },
    ],

    whatsapp: {
      message: 'Hola! Me interesa el bootcamp "Al ritmo del mercado tech" y quiero saber cómo funciona.',
    },
  },

  // Landing 3: Libertad Profesional (Trabajo Remoto)
  'professional-freedom': {
    slug: 'professional-freedom',
    variant: 'professional-freedom',

    title: 'Tu camino hacia el trabajo remoto en tech | Bootcamp Full Stack Developer',
    description: 'Domina el stack que buscan las empresas que contratan desde cualquier parte del mundo. Bootcamp de 12 meses con garantía de empleabilidad.',

    hero: {
      headline: 'Tu camino hacia el trabajo remoto en tech',
      subheadline: 'Domina el stack que buscan las empresas que contratan desde cualquier parte del mundo',
      ctaText: 'Quiero trabajar remoto',
      backgroundGradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    },

    masterclass: {
      title: 'Masterclass Gratuita',
      subtitle: 'Las habilidades exactas que buscan las empresas remotas y cómo conseguir tu primer trabajo',
      duration: '90 minutos',
    },

    benefits: [
      {
        icon: 'Globe',
        title: 'Stack internacional',
        description: 'React, Next.js y PostgreSQL. Las tecnologías que piden empresas de USA, Europa y Latam.',
      },
      {
        icon: 'Zap',
        title: 'IA como ventaja competitiva',
        description: 'Cursor, Claude Code y Antigravity. Desarrolla más rápido que tu competencia.',
      },
      {
        icon: 'UserCheck',
        title: 'Mentoría personalizada',
        description: 'Mentores que ya trabajan remoto te preparan para entrevistas y proyectos reales.',
      },
      {
        icon: 'Award',
        title: 'Portfolio que vende',
        description: 'Proyectos desplegados en producción. Tu GitHub será tu mejor carta de presentación.',
      },
    ],

    techStack: [
      { name: 'HTML & CSS', category: 'frontend' },
      { name: 'React', category: 'frontend' },
      { name: 'Next.js', category: 'frontend' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Cursor AI', category: 'ai-tools' },
      { name: 'Claude Code', category: 'ai-tools' },
      { name: 'Antigravity', category: 'ai-tools' },
    ],

    testimonials: [
      {
        name: 'Camila Vargas',
        role: 'Frontend Developer (Remoto)',
        quote: 'Trabajo desde casa para una empresa en España. El bootcamp me abrió las puertas al mercado internacional.',
      },
      {
        name: 'Sebastián López',
        role: 'Full Stack Developer (USA)',
        quote: 'Pasé de un trabajo presencial mal pago a remoto en dólares. Cambió mi vida completamente.',
      },
      {
        name: 'María Fernanda Castro',
        role: 'Freelancer Internacional',
        quote: 'Trabajo con clientes de 3 países diferentes. La libertad de horarios es lo mejor que me ha pasado.',
      },
    ],

    whatsapp: {
      message: 'Hola! Quiero información sobre el bootcamp para trabajo remoto en tech.',
    },
  },
};
