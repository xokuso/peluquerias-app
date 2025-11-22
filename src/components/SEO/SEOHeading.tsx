import { ReactNode } from 'react'

interface SEOHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
  className?: string
  id?: string
  keywords?: string[]
}

/**
 * SEO-optimized heading component that ensures proper heading hierarchy
 * and includes optional keyword integration for better search visibility
 */
export default function SEOHeading({
  level,
  children,
  className = '',
  id,
  keywords = []
}: SEOHeadingProps) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  // Generate structured microdata if this is an H1
  const microdata = level === 1 ? {
    itemProp: 'headline',
    itemScope: true,
    itemType: 'https://schema.org/WebPageElement'
  } : {}

  return (
    <HeadingTag
      id={id}
      className={className}
      {...microdata}
      // Add data attributes for SEO tools
      data-seo-heading={level}
      data-keywords={keywords.length > 0 ? keywords.join(',') : undefined}
    >
      {children}
    </HeadingTag>
  )
}