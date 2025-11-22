'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Quote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí tu texto...",
  className,
  maxLength = 2000,
  minHeight = '200px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [charCount, setCharCount] = useState(0)

  // Update character count when content changes
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText
      setCharCount(text.length)
    }
  }, [value])

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value, isEditing])

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      const text = editorRef.current.innerText

      // Check character limit
      if (text.length <= maxLength) {
        onChange(content)
      } else {
        // Truncate if over limit
        const truncated = text.substring(0, maxLength)
        editorRef.current.innerText = truncated
        onChange(editorRef.current.innerHTML)
      }
    }
  }

  const handleFocus = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || undefined)
    editorRef.current?.focus()
    handleInput()
  }

  // Format button helper - currently not used but available for future implementation
  // const formatButton = (command: string, icon: React.ReactNode, title: string) => (
  //   <Button
  //     type="button"
  //     variant="ghost"
  //     size="sm"
  //     title={title}
  //     onMouseDown={(e) => e.preventDefault()}
  //     onClick={() => execCommand(command)}
  //     className="h-8 w-8 p-0"
  //   >
  //     {icon}
  //   </Button>
  // )

  const isCommandActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }

  return (
    <div className={cn("border border-neutral-200 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-neutral-50 border-b border-neutral-200">
        {/* Text formatting */}
        <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Negrita"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('bold')}
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('bold') && "bg-neutral-200"
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Cursiva"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('italic')}
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('italic') && "bg-neutral-200"
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Lista con viñetas"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('insertUnorderedList')}
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('insertUnorderedList') && "bg-neutral-200"
            )}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Lista numerada"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('insertOrderedList')}
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('insertOrderedList') && "bg-neutral-200"
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Text alignment */}
        <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Alinear izquierda"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('justifyLeft')}
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('justifyLeft') && "bg-neutral-200"
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Alinear centro"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('justifyCenter')}
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('justifyCenter') && "bg-neutral-200"
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Alinear derecha"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('justifyRight')}
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('justifyRight') && "bg-neutral-200"
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quote */}
        <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Cita"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('formatBlock', 'blockquote')}
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Deshacer"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('undo')}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Rehacer"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('redo')}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="p-4 outline-none prose prose-sm max-w-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      {/* Character count */}
      <div className="flex justify-between items-center px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600">
        <span className="text-neutral-500">
          Usa el editor para dar formato a tu texto
        </span>
        <span className={cn(
          charCount > maxLength * 0.9 && charCount <= maxLength && "text-amber-600",
          charCount > maxLength && "text-red-600"
        )}>
          {charCount}/{maxLength}
        </span>
      </div>

      {/* Custom styles for the editor */}
      <style jsx>{`
        [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }

        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .prose ul, .prose ol {
          padding-left: 1.5rem;
        }

        .prose li {
          margin: 0.25rem 0;
        }

        .prose p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  )
}