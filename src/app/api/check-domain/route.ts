import { NextRequest, NextResponse } from 'next/server'

// Mock domain check - En producción esto haría una consulta real a un API de dominios
export async function POST(request: NextRequest) {
  try {
    const { domain, extension } = await request.json()

    if (!domain || !extension) {
      return NextResponse.json(
        { error: 'Domain and extension are required' },
        { status: 400 }
      )
    }

    const fullDomain = `${domain}${extension}`

    // Simular verificación de dominio
    // En producción, esto consultaría un servicio real como GoDaddy API, Namecheap API, etc.
    const isAvailable = await simulateDomainCheck(domain, extension)

    if (isAvailable) {
      return NextResponse.json({
        available: true,
        domain: fullDomain,
        message: `${fullDomain} está disponible`
      })
    } else {
      // Si no está disponible, generar sugerencias
      const suggestions = generateDomainSuggestions(domain, extension)

      return NextResponse.json({
        available: false,
        domain: fullDomain,
        message: `${fullDomain} no está disponible`,
        suggestions
      })
    }
  } catch (error) {
    console.error('Error checking domain:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Simular verificación de dominio
async function simulateDomainCheck(domain: string, extension: string): Promise<boolean> {
  // Simular delay de API real
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

  const fullDomain = `${domain}${extension}`

  // Lista de dominios "ocupados" para simular
  const takenDomains = [
    'google.com',
    'facebook.com',
    'amazon.com',
    'microsoft.com',
    'apple.com',
    'peluqueria.es',
    'salon.com',
    'belleza.es',
    'hair.com',
    'style.es',
    'beauty.com'
  ]

  // Si el dominio está en la lista de ocupados, devolver false
  if (takenDomains.includes(fullDomain)) {
    return false
  }

  // Dominios muy cortos o comunes tienen menor disponibilidad
  if (domain.length <= 3) {
    return Math.random() > 0.8
  }

  if (domain.length <= 5) {
    return Math.random() > 0.6
  }

  // Dominios más largos tienen mayor disponibilidad
  return Math.random() > 0.3
}

// Generar sugerencias de dominios alternativos
function generateDomainSuggestions(originalDomain: string, originalExtension: string): string[] {
  const suggestions: string[] = []

  // Variaciones del dominio original
  const variations = [
    `${originalDomain}-salon`,
    `${originalDomain}-peluqueria`,
    `${originalDomain}-hair`,
    `${originalDomain}-beauty`,
    `${originalDomain}-style`,
    `salon-${originalDomain}`,
    `peluqueria-${originalDomain}`,
    `mi-${originalDomain}`,
    `${originalDomain}-pro`,
    `${originalDomain}2024`,
    `${originalDomain}-oficial`
  ]

  // Extensiones alternativas
  const extensions = ['.com', '.es', '.net', '.org']

  // Combinar variaciones con extensiones
  variations.forEach(variation => {
    extensions.forEach(ext => {
      if (suggestions.length < 8) {
        suggestions.push(`${variation}${ext}`)
      }
    })
  })

  // Si es la extensión original, también sugerir la misma palabra con otras extensiones
  extensions.forEach(ext => {
    if (ext !== originalExtension && suggestions.length < 8) {
      suggestions.push(`${originalDomain}${ext}`)
    }
  })

  return suggestions.slice(0, 8)
}
