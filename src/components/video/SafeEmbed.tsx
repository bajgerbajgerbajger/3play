import { useMemo } from 'react'

export function SafeEmbed({ code, className }: { code: string; className?: string }) {
  // Simple URL detection
  const isUrl = useMemo(() => {
    if (!code) return false
    const trimmed = code.trim()
    return trimmed.startsWith('http') && !trimmed.includes('<') && !trimmed.includes('>')
  }, [code])

  if (!code) return null

  // Case 1: Just a URL -> Render standard iframe
  if (isUrl) {
    return (
      <iframe
        src={code.trim()}
        className={className}
        title="Embedded Video"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        style={{ border: 'none', width: '100%', height: '100%' }}
      />
    )
  }

  // Case 2: HTML Code (iframe tag, scripts, etc.) -> Render RAW HTML
  // This removes all custom wrappers, sandboxes, and srcDoc isolation.
  // We trust the embed code provided by the user/platform.
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: code }} 
      style={{ width: '100%', height: '100%' }}
    />
  )
}
