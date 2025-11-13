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

  return (
    <>
      <div className="white-fade-overlay" />
      <main>
        <img 
          src="/logo/logo.svg" 
          alt="Logo" 
          className="logo"
        />
        <div className="top-right-text">
          <TypingText 
            text="Radical, curious, and always ahead of the curve. Kunsthalle Basel is one of the leading institutions for contemporary art in Europe and beyond. It pushes boundaries, gives space to new, bold voices, and always places the artists at the center. Since 1839, the Basler Kunstverein hasn't just shown art; it has continually redefined it. With an unwavering commitment to emerging artists, the Basler Kunstverein initiated the construction of Kunsthalle Basel, which opened its doors to the public in 1872. To this day, Kunsthalle Basel continues to bring groundbreaking artistic positions to the forefront, long before they make it big elsewhere. A space for everyone who wants to not just see art, but question, experience, and debate it. Come and discover the artists of tomorrow — already today! Radical, curious, and always ahead of the curve. Kunsthalle Basel is one of the leading institutions for contemporary art in Europe and beyond. It pushes boundaries, gives space to new, bold voices, and always places the artists at the center."
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

