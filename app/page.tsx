import DraggableMenu from './components/DraggableMenu'
import Articles from './components/Articles'
import TypingText from './components/TypingText'
import { client } from '@/sanity/lib/client'

interface Product {
  _id: string
  title: string
  svgOutline?: {
    asset: {
      url: string
    }
  }
  model3dRed?: {
    asset: {
      url: string
    }
  }
  model3dGrey?: {
    asset: {
      url: string
    }
  }
  model3dGreen?: {
    asset: {
      url: string
    }
  }
  model3dRedUsdz?: {
    asset: {
      url: string
    }
  }
  model3dGreyUsdz?: {
    asset: {
      url: string
    }
  }
  model3dGreenUsdz?: {
    asset: {
      url: string
    }
  }
}

async function getProducts() {
  try {
    const products = await client.fetch<Product[]>(
      `*[_type == "product" && defined(svgOutline)] {
        _id,
        title,
        svgOutline {
          asset-> {
            url
          }
        },
        model3dRed {
          asset-> {
            url
          }
        },
        model3dGrey {
          asset-> {
            url
          }
        },
        model3dGreen {
          asset-> {
            url
          }
        },
        model3dRedUsdz {
          asset-> {
            url
          }
        },
        model3dGreyUsdz {
          asset-> {
            url
          }
        },
        model3dGreenUsdz {
          asset-> {
            url
          }
        }
      }`
    )
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function Home() {
  const products = await getProducts()

  // Structured data for SEO (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FAMM Design Studio',
    alternateName: ['FAMM', 'f-a-m-m', 'Famm Design'],
    description: 'Product design collective and industrial design studio based in Milan, working across industrial and creative fields.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://f-a-m-m.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Milan',
      addressCountry: 'IT',
    },
    sameAs: [
      // Add your social media URLs here when available
      // 'https://www.instagram.com/fammdesign',
      // 'https://www.linkedin.com/company/fammdesign',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Italy',
    },
    knowsAbout: [
      'Industrial Design',
      'Product Design',
      'Design Studio',
      'Manufacturing Design',
      'Creative Design',
    ],
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="white-fade-overlay" />
      <main>
        {/* SEO: Hidden title and subtitle for search engines */}
        <h1 className="visually-hidden">
          FAMM Design Studio - Industrial Design Milano | F-a-m-m
        </h1>
        <h2 className="visually-hidden">
          Famm Design Studio - Product Design Collective and Industrial Design Studio in Milan
        </h2>
        <img 
          src="/logo/logo.svg" 
          alt="FAMM Design Studio Logo - Industrial Design Milano" 
          className="logo"
          width="200"
          height="50"
        />
        <div className="top-right-text">
          <TypingText 
            text="We're a product design collective working across industrial and creative fields. Our work sits at the intersection of innovation and experimentation, to explore how forward-thinking companies can thrive amidst exponential technological change. We combine problem-solving design with future-focused exploration, approaching every challenge with a manufacturing-oriented mindset. Our goal is to not only answer today's questions, but to design what comes next."
            delay={2000}
            speed={15}
          />
        </div>
        <DraggableMenu initialProducts={products} />
        <Articles />
      </main>
    </>
  )
}

