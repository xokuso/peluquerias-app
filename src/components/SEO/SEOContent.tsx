import { ReactNode } from 'react'

interface SEOContentProps {
  children: ReactNode
  section?: string
  keywords?: string[]
  schemaType?: string
  className?: string
}

/**
 * SEO content wrapper that adds semantic structure and microdata
 * to improve content understanding by search engines
 */
export default function SEOContent({
  children,
  section,
  keywords = [],
  schemaType = 'WebPageElement',
  className = ''
}: SEOContentProps) {
  const schemaUrl = `https://schema.org/${schemaType}`

  return (
    <section
      className={className}
      itemScope
      itemType={schemaUrl}
      data-seo-section={section}
      data-keywords={keywords.length > 0 ? keywords.join(',') : undefined}
      data-schema-type={schemaType}
    >
      {children}
    </section>
  )
}

/**
 * SEO-optimized text wrapper for content sections
 */
interface SEOTextProps {
  children: ReactNode
  className?: string
  importance?: 'high' | 'medium' | 'low'
  keywords?: string[]
}

export function SEOText({
  children,
  className = '',
  importance = 'medium',
  keywords = []
}: SEOTextProps) {
  return (
    <div
      className={className}
      itemProp="text"
      data-seo-importance={importance}
      data-keywords={keywords.length > 0 ? keywords.join(',') : undefined}
    >
      {children}
    </div>
  )
}

/**
 * SEO-optimized article/blog post wrapper
 */
interface SEOArticleProps {
  children: ReactNode
  title: string
  description?: string
  publishDate?: string
  modifiedDate?: string
  author?: string
  className?: string
  keywords?: string[]
}

export function SEOArticle({
  children,
  title,
  description,
  publishDate,
  modifiedDate,
  author = 'PeluqueríasPRO',
  className = '',
  keywords = []
}: SEOArticleProps) {
  return (
    <article
      className={className}
      itemScope
      itemType="https://schema.org/Article"
      data-keywords={keywords.length > 0 ? keywords.join(',') : undefined}
    >
      <meta itemProp="headline" content={title} />
      {description && <meta itemProp="description" content={description} />}
      {publishDate && <meta itemProp="datePublished" content={publishDate} />}
      {modifiedDate && <meta itemProp="dateModified" content={modifiedDate} />}
      <meta itemProp="author" content={author} />
      {children}
    </article>
  )
}

/**
 * SEO-optimized FAQ section wrapper
 */
interface SEOFAQProps {
  children: ReactNode
  className?: string
}

export function SEOFAQ({ children, className = '' }: SEOFAQProps) {
  return (
    <section
      className={className}
      itemScope
      itemType="https://schema.org/FAQPage"
      data-seo-section="faq"
    >
      {children}
    </section>
  )
}

/**
 * Individual FAQ item component
 */
interface SEOFAQItemProps {
  question: string
  answer: ReactNode
  className?: string
}

export function SEOFAQItem({ question, answer, className = '' }: SEOFAQItemProps) {
  return (
    <div
      className={className}
      itemScope
      itemType="https://schema.org/Question"
      itemProp="mainEntity"
    >
      <h3 itemProp="name">{question}</h3>
      <div
        itemScope
        itemType="https://schema.org/Answer"
        itemProp="acceptedAnswer"
      >
        <div itemProp="text">{answer}</div>
      </div>
    </div>
  )
}