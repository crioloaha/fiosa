import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://fiosa.com.br';

  // Static/institutional routes
  const staticRoutes = [
    '',
    '/artesaos',
    '/produtos',
    '/experiencias',
    '/visite-resende-costa',
    '/contato',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic routes: Active Artisans
  let artisanRoutes: MetadataRoute.Sitemap = [];
  try {
    const artisans = await prisma.artesao.findMany({
      where: { perfilAtivo: true },
      select: { slug: true, updatedAt: true },
    });
    artisanRoutes = artisans.map((artisan) => ({
      url: `${baseUrl}/artesao/${artisan.slug}`,
      lastModified: artisan.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('Error generating artisan routes for sitemap:', err);
  }

  // Dynamic routes: Published Products of Active Artisans
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.produto.findMany({
      where: {
        status: 'PUBLICADO',
        artesao: { perfilAtivo: true },
      },
      select: { slug: true, updatedAt: true },
    });
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/produto/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('Error generating product routes for sitemap:', err);
  }

  return [...staticRoutes, ...artisanRoutes, ...productRoutes];
}
