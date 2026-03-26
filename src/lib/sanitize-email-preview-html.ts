import DOMPurify from "isomorphic-dompurify";

/** Etiquetas habituales en HTML de email + layout. */
const EMAIL_BODY_ALLOWED_TAGS = [
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "caption",
  "center",
  "code",
  "div",
  "em",
  "font",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "s",
  "small",
  "span",
  "strong",
  "style",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
] as const;

const EMAIL_BODY_ALLOWED_ATTR = [
  "align",
  "alt",
  "bgcolor",
  "border",
  "cellpadding",
  "cellspacing",
  "class",
  "colspan",
  "color",
  "face",
  "height",
  "href",
  "id",
  "name",
  "rel",
  "rowspan",
  "size",
  "src",
  "style",
  "target",
  "title",
  "type",
  "target",
  "valign",
  "width",
] as const;

/**
 * Sanitiza HTML de plantillas para vista previa en el admin (reduce XSS).
 * Mantiene estilos inline porque las plantillas de correo los usan de forma intensiva;
 * DOMPurify sanea valores peligrosos dentro de `style`.
 */
export function sanitizeEmailPreviewHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...EMAIL_BODY_ALLOWED_TAGS],
    ALLOWED_ATTR: [...EMAIL_BODY_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Asunto con posible `<mark>` de la vista previa rápida; perfil mínimo.
 */
export function sanitizeEmailPreviewSubject(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["mark"],
    ALLOWED_ATTR: ["style"],
    ALLOW_DATA_ATTR: false,
  });
}
