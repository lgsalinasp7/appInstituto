'use client';

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
  return <SwaggerUIClient />;
}
