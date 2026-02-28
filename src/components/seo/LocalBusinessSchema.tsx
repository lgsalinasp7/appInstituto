import React from 'react';

export function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "KaledSoft Technologies",
        "image": "https://kaledsoft.tech/kaledsoft-logo-transparent.webp",
        "@id": "https://kaledsoft.tech",
        "url": "https://kaledsoft.tech",
        "telephone": "+573337226157",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Calle 30 # 10-09",
            "addressLocality": "Montería",
            "addressRegion": "Córdoba",
            "postalCode": "230001",
            "addressCountry": "CO"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 8.7479,
            "longitude": -75.8814
        },
        "url_google_maps": "https://goo.gl/maps/example",
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
            ],
            "opens": "08:00",
            "closes": "18:00"
        },
        "sameAs": [
            "https://www.facebook.com/profile.php?id=61555670334803",
            "https://www.instagram.com/kaledsoft/",
            "https://linkedin.com/company/kaledsoft"
        ],
        "areaServed": [
            {
                "@type": "State",
                "name": "Córdoba"
            },
            {
                "@type": "State",
                "name": "Bolívar"
            },
            {
                "@type": "State",
                "name": "Atlántico"
            },
            {
                "@type": "Country",
                "name": "Colombia"
            }
        ],
        "priceRange": "$$",
        "email": "contacto@kaledsoft.tech",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "28"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+573337226157",
            "contactType": "customer service",
            "availableLanguage": ["Spanish", "es"]
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Servicios de IA y Desarrollo",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Academia de IA y Desarrollo de SaaS",
                        "description": "Formación intensiva en desarrollo de software con inteligencia artificial y agentes de IA"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Desarrollo de Software B2B",
                        "description": "Desarrollo de soluciones SaaS a medida con integración de agentes de IA"
                    }
                }
            ]
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
