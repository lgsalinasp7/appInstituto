import React from 'react';

export function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "KaledSoft Technologies",
        "image": "https://kaledsoft.tech/kaledsoft-logo-transparent.png",
        "@id": "https://kaledsoft.tech",
        "url": "https://kaledsoft.tech",
        "telephone": "+573000000000",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Montería, Córdoba",
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
            "https://facebook.com/kaledsoft",
            "https://instagram.com/kaledsoft",
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
        "priceRange": "$$"
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
