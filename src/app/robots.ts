import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/admin/:path*',
        '/api',
        '/api/',
        '/api/:path*',
      ],
    },
    sitemap: 'https://fiosa.com.br/sitemap.xml',
  };
}
