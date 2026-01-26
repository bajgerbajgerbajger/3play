import { useMemo } from 'react'

export function SafeEmbed({ code, className }: { code: string; className?: string }) {
  const srcDoc = useMemo(() => {
    if (!code) return ''
    
    // Check if it's just a URL, if so, wrap it in an iframe
    if (code.startsWith('http') && !code.includes('<')) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #000; }
              iframe { border: none; width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <iframe src="${code}" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
          </body>
        </html>
      `
    }

    // It's a complex HTML code (div + script, iframe, etc.)
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
            * { max-width: 100%; }
            iframe { border: none; width: 100% !important; height: 100% !important; position: absolute; top: 0; left: 0; }
            /* Handle Netu/HQQ specific styling if needed */
            div[id] { width: 100% !important; height: 100% !important; }
          </style>
        </head>
        <body>
          ${code}
        </body>
      </html>
    `
  }, [code])

  if (!code) return null

  return (
    <iframe
      srcDoc={srcDoc}
      className={className}
      title="Embedded Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{ border: 'none' }}
    />
  )
}
