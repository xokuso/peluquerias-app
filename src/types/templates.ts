// Types for template filtering (moved from templates page)
export type StyleFilter = 'elegante' | 'moderno' | 'femenino' | 'masculino' | 'clasico' | 'vanguardista'
export type ColorFilter = 'dorado' | 'naranja' | 'negro' | 'rosado' | 'verde' | 'multicolor'
export type FunctionalityFilter = 'reservas' | 'galeria' | 'blog' | 'ecommerce'

export interface FilterState {
  styles: StyleFilter[]
  colors: ColorFilter[]
  functionalities: FunctionalityFilter[]
  search: string
}