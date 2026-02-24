import React from 'react';

export interface ArticleSchemaProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  category: string;
  slug: string;
}

export function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author,
  category,
  slug
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": [image],
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": "KaledSoft Lab",
      "url": "https://kaledsoft.tech"
    },
    "publisher": {
      "@type": "Organization",
      "name": "KaledSoft Technologies",
      "url": "https://kaledsoft.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kaledsoft.tech/kaledsoft-logo-transparent.webp"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://kaledsoft.tech/blog/${slug}`
    },
    "articleSection": category,
    "inLanguage": "es-CO"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
