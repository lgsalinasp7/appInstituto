/**
 * Shared Footer Component
 * Reusable footer for all pages
 */

export function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} App Instituto. Todos los derechos reservados.
      </div>
    </footer>
  );
}
