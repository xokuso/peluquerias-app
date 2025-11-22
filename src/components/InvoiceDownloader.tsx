'use client'

import React from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Invoice } from '@/types'

interface InvoiceDownloaderProps {
  invoice: Invoice
  size?: 'sm' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showLabel?: boolean
}

export const InvoiceDownloader: React.FC<InvoiceDownloaderProps> = ({
  invoice,
  size = 'sm',
  variant = 'ghost',
  showLabel = false
}) => {
  const handleDownload = async () => {
    try {
      if (invoice.downloadUrl) {
        // In a real implementation, this would handle the download
        // For now, we'll simulate the download
        const link = document.createElement('a')
        link.href = invoice.downloadUrl
        link.download = `Factura-${invoice.number}.pdf`
        link.click()
      } else {
        // Generate invoice PDF on the fly
        console.log(`Generating invoice ${invoice.number}...`)
        // This would call an API endpoint to generate and download the invoice
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className="gap-2"
      title={`Descargar factura ${invoice.number}`}
    >
      <Download className="w-4 h-4" />
      {showLabel && 'Descargar factura'}
    </Button>
  )
}

export default InvoiceDownloader