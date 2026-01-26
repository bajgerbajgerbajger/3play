import { useMemo, useEffect, useRef } from 'react'

export function SafeEmbed({ code, className }: { code: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. Check if it is a simple IFRAME tag
  const directIframeSrc = useMemo(() => {
    if (!code) return null
    const trimmed = code.trim()
    // Simple check: starts with <iframe, has src
    if (trimmed.toLowerCase().startsWith('<iframe') && !trimmed.toLowerCase().includes('<script')) {
       const match = trimmed.match(/src=["']([^"']+)["']/)
       return match ? match[1] : null
    }
    // Direct URL support for players (HQQ, Netu, etc.)
    // If it starts with http and has no HTML tags, treat as direct iframe source
    if (trimmed.startsWith('http') && !trimmed.includes('<')) {
        return trimmed
    }
    return null
  }, [code])

  // 2. Prepare srcDoc for complex embeds (scripts, divs, etc.)
  const srcDoc = useMemo(() => {
    if (!code || directIframeSrc) return ''
    
    // Check if it's just a URL
    if (code.startsWith('http') && !code.includes('<')) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>body,html{margin:0;padding:0;height:100%;width:100%;overflow:hidden;background:#000;}iframe{border:none;width:100%;height:100%;}</style>
          </head>
          <body>
            <iframe src="${code}" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
          </body>
        </html>
      `
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="referrer" content="no-referrer" />
          <style>
            body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
            * { max-width: 100%; }
            iframe { border: none; width: 100% !important; height: 100% !important; position: absolute; top: 0; left: 0; }
            div[id] { width: 100% !important; height: 100% !important; }
          </style>
        </head>
        <body>
          <div style="width: 100%; height: 100%;">
            ${code}
          </div>
          <script>
            // Auto-fix iframes inside srcdoc
            window.onload = function() {
              var iframes = document.getElementsByTagName('iframe');
              for (var i = 0; i < iframes.length; i++) {
                iframes[i].setAttribute('allowfullscreen', 'true');
                iframes[i].setAttribute('webkitallowfullscreen', 'true');
                iframes[i].setAttribute('mozallowfullscreen', 'true');
                iframes[i].setAttribute('referrerpolicy', 'no-referrer');
              }
            };
          </script>
        </body>
      </html>
    `
  }, [code, directIframeSrc])

  if (!code) return null

  // CASE A: Direct Iframe (HQQ, YouTube, etc.) - Render directly to avoid "Client blocked"
  if (directIframeSrc) {
    return (
      <iframe
        src={directIframeSrc}
        className={className}
        title="Embedded Video"
        // Permissive allow string for all player features including protected content
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; display-capture"
        allowFullScreen
        // Using "no-referrer" is critical for HQQ/Netu/protected servers to bypass domain blocks
        referrerPolicy="no-referrer"
        // Add sandbox with all permissions to ensure scripts work while maintaining isolation
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
        style={{ border: 'none', width: '100%', height: '100%' }}
      />
    )
  }

  // CASE B: Complex Script/Div Embed - Use SrcDoc isolation
  return (
    <iframe
      srcDoc={srcDoc}
      className={className}
      title="Embedded Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; display-capture"
      allowFullScreen
      sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
      style={{ border: 'none' }}
    />
  )
}
