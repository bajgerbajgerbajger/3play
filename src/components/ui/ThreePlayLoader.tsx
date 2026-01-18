import * as React from 'react'

export function ThreePlayLoader({
  size = 120,
  label = 'Loading…',
  showMark = true,
  theme = 'dark',
  className,
}: {
  size?: number
  label?: string
  showMark?: boolean
  theme?: 'dark' | 'light'
  className?: string
}) {
  const vars =
    theme === 'light'
      ? {
          fg: '#111111',
          ring: 'rgba(0,0,0,.18)',
        }
      : {
          fg: '#ffffff',
          ring: 'rgba(255,255,255,.22)',
        }

  type CSSVar = `--${string}`

  const style = {
    width: size,
    height: size,
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    filter: 'drop-shadow(0 12px 30px rgba(0,0,0,.45))',
    '--3p-accent': '#E50914',
    '--3p-ring': vars.ring,
    '--3p-fg': vars.fg,
  } satisfies React.CSSProperties & Record<CSSVar, string>

  return (
    <div role="status" aria-label={label} style={style} className={className}>
      <style>{css}</style>

      <div className="tp-orbit" />

      <svg viewBox="0 0 120 120" className="tp-svg" aria-hidden="true">
        <g className="tp-ring">
          <circle cx="60" cy="60" r="46" fill="none" stroke="var(--3p-ring)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="var(--3p-accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="70 220"
          />
        </g>
      </svg>

      <svg viewBox="0 0 100 100" className="tp-play" aria-hidden="true">
        <g className="tp-tri">
          <polygon points="34,20 34,80 82,50" fill="var(--3p-accent)" />
        </g>
      </svg>

      {showMark ? (
        <div className="tp-mark" style={{ color: 'var(--3p-fg)' }}>
          3
        </div>
      ) : null}
    </div>
  )
}

const css = `
.tp-svg{width:100%;height:100%;}
.tp-ring{transform-origin:50% 50%;animation:tp-ring-rotate 1.15s linear infinite;}
@keyframes tp-ring-rotate{to{transform:rotate(360deg)}}

.tp-orbit{position:absolute;inset:10px;transform-origin:50% 50%;animation:tp-orbit 0.95s cubic-bezier(.35,.01,.2,1) infinite;}
.tp-orbit::after{content:"";position:absolute;left:50%;top:0;width:10px;height:10px;border-radius:999px;transform:translateX(-50%);background:var(--3p-accent);box-shadow:0 0 0 6px rgba(255,0,0,.18);}
@keyframes tp-orbit{to{transform:rotate(360deg)}}

.tp-play{width:56px;height:56px;transform-origin:50% 50%;animation:tp-play-pulse 0.9s ease-in-out infinite alternate;}
.tp-tri{transform-origin:50% 50%;animation:tp-play-counter 1.15s linear infinite;}
@keyframes tp-play-pulse{to{transform:scale(1.06)}}
@keyframes tp-play-counter{to{transform:rotate(-360deg)}}

.tp-mark{position:absolute;left:12px;top:22px;font-size:12px;letter-spacing:.02em;opacity:.75;user-select:none;}
`
