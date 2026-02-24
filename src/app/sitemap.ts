import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-data';

const baseUrl = 'https://kaledsoft.tech';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        '',
        '/academia',
        '/desarrollo',
        '/vision',
        '/aplicar',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    const blogRoutes = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...blogRoutes];
}
