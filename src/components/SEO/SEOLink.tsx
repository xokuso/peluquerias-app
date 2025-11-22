import Link from 'next/link'
import { ReactNode } from 'react'

interface SEOLinkProps {
  href: string
  children: ReactNode
  title?: string
  className?: string
  target?: '_blank' | '_self'
  rel?: string
  keywords?: string[]
  isInternal?: boolean
  trackingEvent?: string
}

/**
 * SEO-optimized link component that handles internal/external links properly
 * and includes appropriate rel attributes for link building
 */
export default function SEOLink({
  href,
  children,
  title,
  className = '',
  target,
  rel,
  keywords = [],
  isInternal = true,
  trackingEvent
}: SEOLinkProps) {
  // Determine if link is external
  const isExternalLink = href.startsWith('http') || href.startsWith('//') || !isInternal

  // Set appropriate rel attributes for external links
  const linkRel = isExternalLink
    ? rel || 'noopener noreferrer'
    : rel

  const linkTarget = isExternalLink ? target || '_blank' : target

  // Common props for both internal and external links
  const commonProps = {
    title: title,
    className: className,
    target: linkTarget,
    rel: linkRel,
    'data-keywords': keywords.length > 0 ? keywords.join(',') : undefined,
    'data-tracking': trackingEvent,
    'data-link-type': isExternalLink ? 'external' : 'internal'
  }

  // Handle external links with regular <a> tag
  if (isExternalLink) {
    return (
      <a
        href={href}
        {...commonProps}
        onClick={() => {
          if (trackingEvent && typeof window !== 'undefined') {
            // Add tracking logic here if needed
            console.log(`Link clicked: ${trackingEvent}`)
          }
        }}
      >
        {children}
      </a>
    )
  }

  // Handle internal links with Next.js Link component
  return (
    <Link
      href={href}
      {...commonProps}
      onClick={() => {
        if (trackingEvent && typeof window !== 'undefined') {
          // Add tracking logic here if needed
          console.log(`Internal link clicked: ${trackingEvent}`)
        }
      }}
    >
      {children}
    </Link>
  )
}