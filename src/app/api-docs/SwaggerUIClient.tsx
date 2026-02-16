'use client';

import { useEffect, useRef, useState } from 'react';

const SWAGGER_UI_VERSION = '5.31.0';
const CDN_BASE = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}`;

export default function SwaggerUIClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setIsLoggedIn(true);
          setUserName(data.data.name || data.data.email);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Cargar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${CDN_BASE}/swagger-ui.css`;
    document.head.appendChild(link);

    // Cargar JS
    const script = document.createElement('script');
    script.src = `${CDN_BASE}/swagger-ui-bundle.js`;
    script.onload = () => {
      if (cancelled) return;
      initSwaggerUI();
    };
    script.onerror = () => {
      if (cancelled) return;
      setErrorMsg('No se pudo cargar swagger-ui-bundle desde CDN. Verifica tu conexión a internet.');
      setStatus('error');
    };
    document.head.appendChild(script);

    function initSwaggerUI() {
      const SwaggerUIBundle = (window as any).SwaggerUIBundle;
      if (!SwaggerUIBundle) {
        setErrorMsg('SwaggerUIBundle no disponible después de cargar el script.');
        setStatus('error');
        return;
      }

      try {
        SwaggerUIBundle({
          url: '/api/openapi',
          dom_id: '#swagger-ui-container',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: 'BaseLayout',
          tryItOutEnabled: true,
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
          requestInterceptor: (request: any) => {
            if (request) {
              request.credentials = 'include';
            }
            return request;
          },
          onComplete: () => {
            if (!cancelled) {
              setStatus('ready');
              console.log('Swagger UI cargado correctamente');
            }
          },
          onFailure: (err: any) => {
            if (!cancelled) {
              console.error('Swagger UI falló al cargar:', err);
              setErrorMsg('Error al inicializar Swagger UI. Revisa la consola para más detalles.');
              setStatus('error');
            }
          },
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Error al inicializar SwaggerUIBundle:', err);
          setErrorMsg(`Error al inicializar Swagger UI: ${err instanceof Error ? err.message : 'Error desconocido'}`);
          setStatus('error');
        }
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(true);
        setUserName(data.data?.name || data.data?.email || email);
        setPassword('');
      } else {
        setLoginError(data.error || data.message || 'Error al iniciar sesion');
      }
    } catch {
      setLoginError('Error de conexion. Verifica que el servidor este corriendo.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
    setUserName(null);
    setEmail('');
    setLoginError(null);
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '2rem' }}>
        <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Error al cargar Swagger UI</h1>
        <p style={{ color: '#666', marginBottom: '1rem', textAlign: 'center', maxWidth: '600px' }}>
          {errorMsg}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Recargar pagina
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Login form / session banner */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: isLoggedIn ? '#e8f5e9' : '#f5f5f5',
        borderBottom: '1px solid #e0e0e0',
        fontFamily: 'sans-serif',
      }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#2e7d32', fontSize: '14px' }}>
              <strong>Sesion activa:</strong> {userName} — Las cookies se envian automaticamente con cada peticion &quot;Try it out&quot;.
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.35rem 0.75rem',
                backgroundColor: '#c62828',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Cerrar sesion
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: '#333', fontWeight: 600 }}>Iniciar sesion:</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                padding: '0.4rem 0.6rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                width: '220px',
              }}
            />
            <input
              type="password"
              placeholder="Contrasena"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                padding: '0.4rem 0.6rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                width: '180px',
              }}
            />
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                padding: '0.4rem 1rem',
                backgroundColor: loginLoading ? '#90caf9' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {loginLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
            {loginError && (
              <span style={{ color: '#d32f2f', fontSize: '13px' }}>{loginError}</span>
            )}
          </form>
        )}
      </div>

      {/* Info note */}
      <div style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#f0f7ff',
        borderBottom: '1px solid #e0e0e0',
        fontSize: '13px',
        color: '#1976d2',
      }}>
        <strong>Nota:</strong> {isLoggedIn
          ? 'Ya estas autenticado. Puedes usar "Try it out" directamente en los endpoints protegidos. No necesitas usar el boton Authorize para cookieAuth.'
          : 'Usa el formulario de arriba para iniciar sesion con tu email y contrasena. La cookie de sesion se enviara automaticamente en cada peticion "Try it out".'
        }
      </div>

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
          <p>Cargando Swagger UI...</p>
        </div>
      )}
      <div
        id="swagger-ui-container"
        ref={containerRef}
        style={{ flex: 1, overflow: 'auto' }}
      />
    </div>
  );
}
