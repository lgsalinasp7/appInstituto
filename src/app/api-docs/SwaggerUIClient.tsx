'use client';

import { useEffect, useRef } from 'react';

const SWAGGER_UI_VERSION = '5.31.0';

export default function SwaggerUIClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const loadSwaggerUI = async () => {
      // Load Swagger UI CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css`;
      document.head.appendChild(link);

      // Load Swagger UI JS
      const script = document.createElement('script');
      script.src = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js`;
      script.async = true;
      script.onload = () => {
        const SwaggerUIBundle = (window as unknown as { SwaggerUIBundle: { (config: object): void; presets: { apis: unknown }; plugins?: { DownloadUrl: unknown } }; SwaggerUIStandalonePreset: unknown }).SwaggerUIBundle;
        const SwaggerUIStandalonePreset = (window as unknown as { SwaggerUIStandalonePreset: unknown }).SwaggerUIStandalonePreset;
        if (SwaggerUIBundle && SwaggerUIStandalonePreset) {
          SwaggerUIBundle({
            url: '/api/openapi',
            dom_id: '#swagger-ui-container',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset,
            ],
            layout: 'StandaloneLayout',
          });
        }
      };
      document.body.appendChild(script);
    };

    loadSwaggerUI();

    return () => {
      const existingScript = document.querySelector(`script[src*="swagger-ui-dist"]`);
      const existingLink = document.querySelector(`link[href*="swagger-ui-dist"]`);
      if (existingScript) existingScript.remove();
      if (existingLink) existingLink.remove();
    };
  }, []);

  return (
    <div style={{ height: '100vh', backgroundColor: '#fff' }}>
      <div id="swagger-ui-container" ref={containerRef} />
    </div>
  );
}
