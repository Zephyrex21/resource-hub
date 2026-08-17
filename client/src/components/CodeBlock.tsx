import { useRef, useState, type ReactNode } from 'react'

interface CodeBlockProps {
  children?: ReactNode
  className?: string
}

// Overrides react-markdown's default <pre> rendering to add a hover-reveal
// copy button. Reads via a ref rather than trying to reconstruct the text
// from children, so it stays correct regardless of how deeply
// rehype-highlight nests its syntax-highlighting <span> elements.
export function CodeBlock({ children, className }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = preRef.current?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — button just won't confirm.
    }
  }

  return (
    <div className="group relative">
      <pre ref={preRef} className={className}>
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute right-2 top-2 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
