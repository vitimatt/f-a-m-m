import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://f-a-m-m.com'

  // Get products for dynamic routes
  let products: Array<{ _id: string; title: string }> = []
  try {
    products = await client.fetch(`
      *[_type == "product" && defined(svgOutline)] {
        _id,
        title
      }
    `)
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Get articles for dynamic routes
  let articles: Array<{ _id: string; publishedAt: string }> = []
  try {
    articles = await client.fetch(`
      *[_type == "article"] {
        _id,
        publishedAt
      }
    `)
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  // Main page
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ]

  // Add product pages if you have individual product pages
  // const productRoutes = products.map((product) => ({
  //   url: `${baseUrl}/products/${product._id}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.8,
  // }))

  // Add article pages if you have individual article pages
  // const articleRoutes = articles.map((article) => ({
  //   url: `${baseUrl}/articles/${article._id}`,
  //   lastModified: new Date(article.publishedAt),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.7,
  // }))

  return [...routes]
}

