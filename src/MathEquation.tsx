import { useEffect, useRef } from 'react'
import katex from 'katex'

interface MathEquationProps {
  equation: string
  displayMode?: boolean
  className?: string
}

export default function MathEquation({ equation, displayMode = true, className = '' }: MathEquationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(equation, containerRef.current, {
          displayMode,
          throwOnError: false,
          output: 'html',
        })
      } catch (e) {
        console.error('KaTeX error:', e)
        containerRef.current.textContent = equation
      }
    }
  }, [equation, displayMode])

  return (
    <div 
      ref={containerRef} 
      className={`overflow-x-auto ${className}`}
    />
  )
}
