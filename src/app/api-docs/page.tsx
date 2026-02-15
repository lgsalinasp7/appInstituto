'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const SwaggerUIClient = dynamic(() => import('./SwaggerUIClient'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Cargando documentacion de la API...</p>
    </div>
  ),
});

export default function ApiDocsPage() {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    setIsDevMode(process.env.NODE_ENV === 'development');
  }, []);

  if (!isDevMode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Esta pagina solo esta disponible en modo desarrollo.</p>
      </div>
    );
  }

  return <SwaggerUIClient />;
}
