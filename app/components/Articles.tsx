import { client } from '@/sanity/lib/client'
import ImageSlider from './ImageSlider'
import TypingText from './TypingText'

interface Article {
  _id: string
  type: 'product' | 'news'
  layout?: string
  text: string
  images?: Array<{
    asset: {
      url: string
      metadata?: {
        dimensions?: {
          width: number
          height: number
        }
      }
    }
    alt?: string
  }>
  publishedAt: string
}

async function getArticles(): Promise<{ products: Article[], news: Article[] }> {
  try {
    const articles = await client.fetch<Article[]>(
      `*[_type == "article"] | order(publishedAt desc) {
        _id,
        type,
        layout,
        text,
        images[] {
          asset-> {
            url,
            metadata {
              dimensions {
                width,
                height
              }
            }
          },
          alt
        },
        publishedAt
      }`
    )
    
    return {
      products: articles.filter(a => a.type === 'product'),
      news: articles.filter(a => a.type === 'news'),
    }
  } catch (error) {
    console.error('Error fetching articles:', error)
    return { products: [], news: [] }
  }
}

function ProductArticle({ article }: { article: Article }) {
  return (
    <article className="product-article">
      <TypingText text={article.text} className="article-text" delay={2000} speed={15} />
      {article.images && article.images.length > 0 && (
        <>
          <div className="article-spacer" />
          <ImageSlider images={article.images} />
        </>
      )}
    </article>
  )
}

function NewsArticle({ article }: { article: Article }) {
  const layout = article.layout || 'text-left-img-right'
  
  // For text-full-img-above layouts (2 column text layouts)
  if (layout.includes('above')) {
    return (
      <article className={`news-article layout-${layout}`}>
        {article.images && article.images.length > 0 && (
          <div className="article-images-container">
            <ImageSlider images={article.images} />
          </div>
        )}
        <TypingText text={article.text} className="article-text" delay={2000} speed={15} />
      </article>
    )
  }
  
  // For side-by-side layouts (1 column text layouts)
  return (
    <article className={`news-article layout-${layout}`}>
      <div className="article-content-wrapper">
        {layout === 'text-right-img-left' && article.images && article.images.length > 0 && (
          <div className="article-images-side">
            <ImageSlider images={article.images} />
          </div>
        )}
        <TypingText text={article.text} className="article-text" delay={2000} speed={15} />
        {layout === 'text-left-img-right' && article.images && article.images.length > 0 && (
          <div className="article-images-side">
            <ImageSlider images={article.images} />
          </div>
        )}
      </div>
    </article>
  )
}

export default async function Articles() {
  const { products, news } = await getArticles()

  return (
    <div className="articles-layout">
      <div className="articles-column articles-left-center">
        {news.map((article) => (
          <NewsArticle key={article._id} article={article} />
        ))}
      </div>
      <div className="articles-column articles-right">
        {products.map((article) => (
          <ProductArticle key={article._id} article={article} />
        ))}
      </div>
    </div>
  )
}

