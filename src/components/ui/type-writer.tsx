import type React from 'react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TypeWriterProps {
  words: string[],
  className?: string
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  words,
  className,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const word = words[currentWordIndex]
    
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(prev => prev.substring(0, prev.length - 1))
        setTypingSpeed(80)
        
        if (currentText === '') {
          setIsDeleting(false)
          setCurrentWordIndex((currentWordIndex + 1) % words.length)
          setTypingSpeed(150)
        }
      } else {
        setCurrentText(word.substring(0, currentText.length + 1))
        setTypingSpeed(150) 
        
        if (currentText === word) {
          setTypingSpeed(2000)
          setIsDeleting(true)
        }
      }
    }, typingSpeed)
    
    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, typingSpeed, words])

  return (
    <div className={cn("inline-flex", className)}>
      <span>{currentText}</span>
      <span className={cn("ml-1 animate-pulse", "text-purple-500")}>|</span>
    </div>
  )
}

