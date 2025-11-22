'use client'

import { SalonTemplate } from '@/data/salon-templates'
import TemplateCard from './TemplateCard'

interface TemplateGridProps {
  templates: SalonTemplate[]
}

export default function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {templates.map((template, index) => (
        <TemplateCard
          key={template.id}
          template={template}
          priority={index < 6} // Load first 6 images with priority
        />
      ))}
    </div>
  )
}