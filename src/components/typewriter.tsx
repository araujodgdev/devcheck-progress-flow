import { useState, useEffect } from 'react';

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export function Typewriter({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1500,
}: TypewriterProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, pauseTime);
      return () => clearTimeout(pauseTimeout);
    }

    if (isTyping) {
      if (displayText === currentFullText) {
        setIsPaused(true);
        return;
      }

      const typingTimeout = setTimeout(() => {
        setDisplayText(currentFullText.substring(0, displayText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(typingTimeout);
    } else {
      if (displayText === '') {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setIsTyping(true);
        return;
      }

      const deletingTimeout = setTimeout(() => {
        setDisplayText(displayText.substring(0, displayText.length - 1));
      }, deletingSpeed);
      return () => clearTimeout(deletingTimeout);
    }
  }, [currentTextIndex, displayText, isTyping, isPaused, texts, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <div className="h-8 md:h-10">
      <span className="inline-block">{displayText}</span>
      <span className="inline-block w-[2px] h-6 md:h-8 bg-primary ml-1 animate-pulse" />
    </div>
  );
}