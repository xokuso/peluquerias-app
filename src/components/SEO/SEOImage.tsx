import Image, { ImageProps } from 'next/image'

interface SEOImageProps extends Omit<ImageProps, 'alt'> {
  alt: string // Make alt required for SEO
  title?: string
  caption?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  seoKeywords?: string[]
}

/**
 * SEO-optimized image component with proper alt text, titles, and structured data
 * Ensures all images contribute to page SEO value
 */
export default function SEOImage({
  alt,
  title,
  caption,
  loading = 'lazy',
  priority = false,
  seoKeywords = [],
  className = '',
  ...props
}: SEOImageProps) {
  const imageElement = (
    <Image
      {...props}
      alt={alt}
      title={title || alt}
      loading={priority ? 'eager' : loading}
      priority={priority}
      className={className}
      // Add structured data attributes
      itemProp="image"
      data-seo-alt={alt}
      data-keywords={seoKeywords.length > 0 ? seoKeywords.join(',') : undefined}
    />
  )

  // If caption is provided, wrap in figure element for better semantics
  if (caption) {
    return (
      <figure className="seo-image-figure" itemScope itemType="https://schema.org/ImageObject">
        {imageElement}
        <figcaption
          className="seo-image-caption"
          itemProp="caption"
        >
          {caption}
        </figcaption>
      </figure>
    )
  }

  return (
    <div itemScope itemType="https://schema.org/ImageObject">
      {imageElement}
    </div>
  )
}