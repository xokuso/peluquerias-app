// Complete template data for the templates page with filtering system
export interface SalonTemplate {
  id: string
  name: string
  tagline: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  category: 'elegant' | 'modern' | 'beauty' | 'barber' | 'classic' | 'trendy'

  // New fields for filtering system
  style: 'elegante' | 'moderno' | 'femenino' | 'masculino' | 'clasico' | 'vanguardista'
  color: 'dorado' | 'naranja' | 'negro' | 'rosado' | 'verde' | 'multicolor'
  functionality: ('reservas' | 'galeria' | 'blog' | 'ecommerce')[]

  // Enhanced features and metadata
  features: string[]
  buttonText: string
  badges?: ('popular' | 'new' | 'recommended' | 'trending')[]
  usedBy?: string
  popular?: boolean
  image: string
  demoUrl?: string

  // SEO and additional info
  shortDescription: string
  keywords: string[]
}

export const salonTemplates: SalonTemplate[] = [
  {
    id: 'elegance-salon',
    name: 'Elegance Salon',
    tagline: 'Elegancia en cada detalle',
    description: 'Diseño minimalista con colores dorados y blancos, perfecto para salones de alta gama',
    shortDescription: 'Para peluquerías de alta gama que buscan sofisticación',
    colors: {
      primary: '#D4AF37', // Dorado
      secondary: '#FFFFFF', // Blanco
      accent: '#F8F8F8', // Gris muy claro
      background: '#FFFFFF',
      text: '#2C2C2C'
    },
    category: 'elegant',
    style: 'elegante',
    color: 'dorado',
    functionality: ['galeria'],
    features: ['Booking online', 'Galería premium', 'Contacto directo', 'Experiencia VIP'],
    buttonText: 'Elegir Elegance',
    badges: ['popular', 'recommended'],
    usedBy: '12+ salones elegantes',
    popular: true,
    image: '/images/templates/elegance-salon-preview.jpg',
    demoUrl: 'https://demo.elegance-salon.com',
    keywords: ['elegante', 'lujo', 'dorado', 'galeria', 'premium']
  },
  {
    id: 'modern-cut',
    name: 'Modern Cut',
    tagline: 'Tecnología y estilo',
    description: 'Diseño moderno con colores negros y naranjas, incluye booking online y portfolio',
    shortDescription: 'Diseño urbano perfecto para clientela joven',
    colors: {
      primary: '#1A1A1A', // Negro
      secondary: '#FF6B35', // Naranja
      accent: '#2D2D2D', // Gris oscuro
      background: '#1A1A1A',
      text: '#FFFFFF'
    },
    category: 'modern',
    style: 'moderno',
    color: 'naranja',
    functionality: ['reservas'],
    features: ['Booking avanzado', 'Portfolio trabajos', 'App móvil', 'Analytics'],
    buttonText: 'Elegir Modern',
    badges: ['trending', 'new'],
    usedBy: '25+ salones modernos',
    popular: false,
    image: '/images/templates/modern-cut-preview.jpg',
    demoUrl: 'https://demo.modern-cut.com',
    keywords: ['moderno', 'urbano', 'naranja', 'reservas', 'tecnologia']
  },
  {
    id: 'beauty-studio',
    name: 'Beauty Studio',
    tagline: 'Belleza sin límites',
    description: 'Estilo femenino con rosados y dorados, enfocado en tratamientos de belleza',
    shortDescription: 'Especializada en tratamientos de belleza y estética',
    colors: {
      primary: '#E91E63', // Rosa
      secondary: '#FFD700', // Dorado
      accent: '#FCE4EC', // Rosa muy claro
      background: '#FCE4EC',
      text: '#2C2C2C'
    },
    category: 'beauty',
    style: 'femenino',
    color: 'rosado',
    functionality: ['blog', 'galeria'],
    features: ['Galería destacada', 'Tratamientos', 'Antes/después', 'Citas online'],
    buttonText: 'Elegir Beauty',
    badges: ['popular'],
    usedBy: '18+ estudios de belleza',
    popular: false,
    image: '/images/templates/beauty-studio-preview.jpg',
    demoUrl: 'https://demo.beauty-studio.com',
    keywords: ['femenino', 'belleza', 'rosado', 'blog', 'tratamientos']
  },
  {
    id: 'urban-barber',
    name: 'Urban Barber',
    tagline: 'Cortes urbanos auténticos',
    description: 'Diseño masculino con colores oscuros y verdes, especializado en barbería',
    shortDescription: 'Para barberías modernas con estilo tradicional',
    colors: {
      primary: '#1B3B36', // Verde oscuro
      secondary: '#2E7D32', // Verde
      accent: '#263238', // Gris azulado oscuro
      background: '#263238',
      text: '#FFFFFF'
    },
    category: 'barber',
    style: 'masculino',
    color: 'verde',
    functionality: ['reservas', 'ecommerce'],
    features: ['Servicios barbería', 'Cortes masculinos', 'Reservas', 'Club membresía'],
    buttonText: 'Elegir Urban',
    badges: ['recommended'],
    usedBy: '15+ barberías urbanas',
    popular: false,
    image: '/images/templates/urban-barber-preview.jpg',
    demoUrl: 'https://demo.urban-barber.com',
    keywords: ['masculino', 'barberia', 'verde', 'reservas', 'urbano']
  },
  {
    id: 'classic-hair',
    name: 'Classic Hair',
    tagline: 'Tradición y elegancia',
    description: 'Diseño clásico con beiges y marrones, tradición y elegancia atemporal',
    shortDescription: 'Elegancia atemporal para peluquerías familiares',
    colors: {
      primary: '#8D6E63', // Marrón
      secondary: '#D7CCC8', // Beige
      accent: '#A1887F', // Marrón claro
      background: '#D7CCC8',
      text: '#3E2723'
    },
    category: 'classic',
    style: 'clasico',
    color: 'multicolor',
    functionality: ['galeria'],
    features: ['Historia salón', 'Servicios tradicionales', 'Equipo experto', 'Herencia familiar'],
    buttonText: 'Elegir Classic',
    usedBy: '10+ salones tradicionales',
    popular: false,
    image: '/images/templates/classic-hair-preview.jpg',
    demoUrl: 'https://demo.classic-hair.com',
    keywords: ['clasico', 'tradicional', 'familia', 'galeria', 'herencia']
  },
  {
    id: 'trendy-style',
    name: 'Trendy Style',
    tagline: 'Vanguardia y creatividad',
    description: 'Diseño vanguardista con colores vibrantes y animaciones creativas',
    shortDescription: 'Para estilistas creativos y experimentales',
    colors: {
      primary: '#9C27B0', // Púrpura
      secondary: '#00BCD4', // Cian
      accent: '#FFC107', // Amarillo
      background: '#F3E5F5',
      text: '#2C2C2C'
    },
    category: 'trendy',
    style: 'vanguardista',
    color: 'multicolor',
    functionality: ['reservas', 'galeria', 'blog', 'ecommerce'],
    features: ['Landing creativo', 'Tendencias actuales', 'Social media', 'AR virtual'],
    buttonText: 'Elegir Trendy',
    badges: ['new', 'trending'],
    usedBy: '8+ salones vanguardistas',
    popular: false,
    image: '/images/templates/trendy-style-preview.jpg',
    demoUrl: 'https://demo.trendy-style.com',
    keywords: ['vanguardista', 'creativo', 'multicolor', 'tendencias', 'experimental']
  }
]