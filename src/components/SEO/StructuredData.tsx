interface StructuredDataProps {
  data: object | object[]
  id?: string
}

/**
 * Component for injecting structured data (JSON-LD) into pages
 */
export default function StructuredData({ data, id }: StructuredDataProps) {
  const structuredDataArray = Array.isArray(data) ? data : [data]

  return (
    <>
      {structuredDataArray.map((item, index) => (
        <script
          key={id ? `${id}-${index}` : index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, process.env.NODE_ENV === 'development' ? 2 : 0)
          }}
        />
      ))}
    </>
  )
}