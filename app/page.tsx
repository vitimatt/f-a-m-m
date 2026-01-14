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
    name: 'FAMM',
    alternateName: ['FAMM Design Studio', 'f-a-m-m', 'Famm Design'],
    description: 'FAMM, product design collective founded in 2024 working across industrial design and creative fields. Based in Milan, founded by Matteo Bulla, Matteo Corradini, Federico Fanucchi & Andrea Mastroianni.',
    foundingDate: '2024',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://f-a-m-m.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Milan',
      addressCountry: 'IT',
    },
    founder: [
      { '@type': 'Person', name: 'Matteo Bulla' },
      { '@type': 'Person', name: 'Matteo Corradini' },
      { '@type': 'Person', name: 'Federico Fanucchi' },
      { '@type': 'Person', name: 'Andrea Mastroianni' },
    ],
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
          FAMM - Product Design Collective | Industrial Design Milano
        </h1>
        <h2 className="visually-hidden">
          FAMM, product design collective founded in 2024 working across industrial design and creative fields. Based in Milan, founded by Matteo Bulla, Matteo Corradini, Federico Fanucchi & Andrea Mastroianni.
        </h2>
        
        {/* SEO: Subtitle text for search engines (hidden but readable) */}
        <p className="visually-hidden">
          FAMM, product design collective founded in 2024 working across industrial design and creative fields. Based in Milan, founded by Matteo Bulla, Matteo Corradini, Federico Fanucchi & Andrea Mastroianni.
        </p>
        
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

