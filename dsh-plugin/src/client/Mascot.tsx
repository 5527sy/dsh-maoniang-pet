/**
 * Mascot — a cute anime chibi for the dsh-maoniang-pet web bundle.
 *
 * V2: free drag (pointer capture) + click interaction. The mascot starts at
 * the left 1/6 of the conversation column (tracked from the layout frame's
 * `grid-template-columns`), but once the user drags it, the layout-follow is
 * disabled and it stays where the user left it. A quick tap/click (without a
 * drag) triggers a bounce + speech bubble + floating hearts, and briefly swaps to the reaction GIF for 3s before returning to the idle GIF.
 */
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

const SIDEBAR_DEFAULT = 280

const SRC_KEY = 's2s.mascot.src'
const WIDTH_KEY = 's2s.mascot.width'
const REACTION_KEY = 's2s.mascot.reaction'

function readMascotSrc(): string {
  try {
    const value = localStorage.getItem(SRC_KEY)
    return value !== null ? value.trim() : ''
  } catch {
    return ''
  }
}

function readReactionSrc(): string {
  try {
    const value = localStorage.getItem(REACTION_KEY)
    return value !== null ? value.trim() : ''
  } catch {
    return ''
  }
}

function readMascotWidth(): number {
  try {
    const value = Number(localStorage.getItem(WIDTH_KEY))
    return Number.isFinite(value) && value > 0 ? value : 150
  } catch {
    return 150
  }
}

const PHRASES = ['诶嘿~', '干嘛呀~', '摸摸头~', '最喜欢你啦~', '加油哦~', '在叫我吗~']

const HEART_SPARKS = [
  { emoji: '💗', dx: -26, delay: 0 },
  { emoji: '💕', dx: 22, delay: 0.08 },
  { emoji: '✨', dx: -8, delay: 0.16 },
  { emoji: '💖', dx: 12, delay: 0.24 },
  { emoji: '💕', dx: -18, delay: 0.32 },
  { emoji: '✨', dx: 6, delay: 0.4 },
]

const CSS = `
@keyframes dsh-maoniang-pet-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes dsh-maoniang-pet-bounce {
  0%, 100% { transform: scale(1, 1); }
  30% { transform: scale(1.14, 0.86); }
  60% { transform: scale(0.92, 1.08); }
}
@keyframes dsh-maoniang-pet-bubble {
  0% { opacity: 0; transform: translate(-50%, 6px) scale(0.9); }
  100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
@keyframes dsh-maoniang-pet-heart {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.6); }
  12% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), -72px) scale(1.1); }
}
`

interface Position {
  x: number
  y: number
}

interface DragState {
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  moved: boolean
}

export function Mascot() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState<Position>({ x: SIDEBAR_DEFAULT, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [reaction, setReaction] = useState<{ phrase: string; nonce: number } | null>(null)
  const [bounce, setBounce] = useState(false)
  const [baseSrc, setBaseSrc] = useState<string>(() => readMascotSrc())
  const [src, setSrc] = useState<string>(() => readMascotSrc())
  const [reactionSrc, setReactionSrc] = useState<string>(() => readReactionSrc())
  const [imgWidth] = useState<number>(() => readMascotWidth())
  const baseSrcRef = useRef(baseSrc)
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userMoved = useRef(false)
  const dragRef = useRef<DragState | null>(null)
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Start at the layout-derived position and follow sidebar/details changes
  // until the user drags the mascot somewhere themselves.
  useEffect(() => {
    const root = rootRef.current
    if (root === null) return
    const frame = root.closest<HTMLElement>('[style*="grid-template-columns"]')
    if (frame === null) return

    const read = () => {
      if (userMoved.current) return
      const value = frame.style.gridTemplateColumns
      const tracks = [...value.matchAll(/([\d.]+)px/g)].map(match => Number.parseFloat(match[1]))
      const sidebar = tracks[0] ?? 0
      const details = tracks.length > 1 ? tracks[tracks.length - 1] : 0
      const viewport = frame.clientWidth
      const centerWidth = Math.max(0, viewport - sidebar - details)
      const x = sidebar + centerWidth / 6
      const y = frame.clientHeight / 2
      if (Number.isFinite(x) && Number.isFinite(y)) setPos({ x, y })
    }

    read()
    const observer = new MutationObserver(read)
    observer.observe(frame, { attributes: true, attributeFilter: ['style'] })
    window.addEventListener('resize', read)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', read)
    }
  }, [])

  useEffect(() => {
    baseSrcRef.current = baseSrc
  }, [baseSrc])

  useEffect(() => () => {
    if (reactionTimer.current !== null) clearTimeout(reactionTimer.current)
    if (revertTimer.current !== null) clearTimeout(revertTimer.current)
  }, [])

  // Live swap hook: run `window.__dshMaoniangPetSetMascot('https://.../x.gif')`
  // in the browser console, or set localStorage key `s2s.mascot.src`. An empty
  // string returns to the built-in SVG; remove the key to restore the built-in SVG.
  useEffect(() => {
    const applyBase = (value: string): void => {
      setBaseSrc(value)
      setSrc(value)
      try {
        localStorage.setItem(SRC_KEY, value)
      } catch { /* ignore */ }
    }
    const applyReaction = (value: string): void => {
      setReactionSrc(value)
      try {
        localStorage.setItem(REACTION_KEY, value)
      } catch { /* ignore */ }
    }
    const host = window as unknown as {
      __dshMaoniangPetSetMascot?: (value: string) => void
      __dshMaoniangPetSetReaction?: (value: string) => void
    }
    host.__dshMaoniangPetSetMascot = applyBase
    host.__dshMaoniangPetSetReaction = applyReaction
    return () => {
      if (host.__dshMaoniangPetSetMascot === applyBase) delete host.__dshMaoniangPetSetMascot
      if (host.__dshMaoniangPetSetReaction === applyReaction) delete host.__dshMaoniangPetSetReaction
    }
  }, [])

  const triggerReaction = (): void => {
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
    setReaction({ phrase, nonce: Date.now() })
    setBounce(true)
    if (reactionTimer.current !== null) clearTimeout(reactionTimer.current)
    reactionTimer.current = setTimeout(() => {
      setReaction(null)
      setBounce(false)
    }, 1600)

    const gif = reactionSrc.trim()
    if (gif !== '') {
      setSrc(gif)
      if (revertTimer.current !== null) clearTimeout(revertTimer.current)
      revertTimer.current = setTimeout(() => {
        setSrc(baseSrcRef.current)
      }, 3000)
    }
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: pos.x,
      startY: pos.y,
      moved: false,
    }
    setDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (drag === null) return
    const dx = e.clientX - drag.startClientX
    const dy = e.clientY - drag.startClientY
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true
    if (drag.moved) {
      userMoved.current = true
      setPos({ x: drag.startX + dx, y: drag.startY + dy })
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    dragRef.current = null
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch { /* ignore */ }
    if (drag !== null && !drag.moved) triggerReaction()
  }

  const bobAnimation = bounce
    ? 'dsh-maoniang-pet-float 3.2s ease-in-out infinite, dsh-maoniang-pet-bounce 0.5s ease'
    : 'dsh-maoniang-pet-float 3.2s ease-in-out infinite'

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 21,
        touchAction: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        lineHeight: 0,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <style>{CSS}</style>
      <div
        style={{
          animation: bobAnimation,
          filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18))',
        }}
      >
        {src !== '' ? (
          <img src={src} width={imgWidth} height="auto" draggable={false} alt="mascot" style={{ display: 'block' }} />
        ) : (
        <svg width="150" height="177" viewBox="0 0 220 260" role="img" aria-label="cute anime mascot">
          <defs>
            <linearGradient id="dshcc-hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffc8d9" />
              <stop offset="100%" stopColor="#f47fa8" />
            </linearGradient>
            <linearGradient id="dshcc-eye" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fd0f4" />
              <stop offset="100%" stopColor="#3f7fd6" />
            </linearGradient>
          </defs>

          {/* Back hair */}
          <circle cx="110" cy="96" r="78" fill="url(#dshcc-hair)" />

          {/* Twin tails */}
          <ellipse cx="30" cy="184" rx="26" ry="58" transform="rotate(16 30 184)" fill="url(#dshcc-hair)" />
          <ellipse cx="190" cy="184" rx="26" ry="58" transform="rotate(-16 190 184)" fill="url(#dshcc-hair)" />
          <circle cx="34" cy="132" r="8" fill="#ff6b9d" />
          <circle cx="186" cy="132" r="8" fill="#ff6b9d" />

          {/* Body */}
          <path d="M78,172 Q110,164 142,172 L154,224 L66,224 Z" fill="#ffffff" stroke="#ff9ec4" strokeWidth="2" />
          <path d="M66,224 Q110,236 154,224 L154,232 Q110,244 66,232 Z" fill="#ff9ec4" />
          <rect x="102" y="158" width="16" height="16" rx="6" fill="#ffe3d0" />
          <path d="M82,174 Q64,184 70,202" stroke="#ffe3d0" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M138,174 Q156,184 150,202" stroke="#ffe3d0" strokeWidth="10" strokeLinecap="round" fill="none" />
          <line x1="98" y1="228" x2="96" y2="246" stroke="#ffe3d0" strokeWidth="10" strokeLinecap="round" />
          <line x1="122" y1="228" x2="124" y2="246" stroke="#ffe3d0" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="94" cy="250" rx="12" ry="7" fill="#ff5f6d" />
          <ellipse cx="126" cy="250" rx="12" ry="7" fill="#ff5f6d" />

          {/* Head */}
          <circle cx="110" cy="110" r="54" fill="#ffe3d0" />

          {/* Front bangs */}
          <path
            d="M52,86 C52,42 168,42 168,86 C168,96 152,92 138,86 C132,98 122,98 110,92 C98,98 88,98 82,86 C68,92 52,96 52,86 Z"
            fill="url(#dshcc-hair)"
          />

          {/* Ahoge */}
          <path d="M110,44 C112,32 126,30 128,42 C130,52 116,52 112,44 Z" fill="url(#dshcc-hair)" />

          {/* Hair flower */}
          <g transform="translate(88,62)">
            <circle cx="0" cy="-6" r="6" fill="#ff8fb3" />
            <circle cx="6" cy="0" r="6" fill="#ff8fb3" />
            <circle cx="0" cy="6" r="6" fill="#ff8fb3" />
            <circle cx="-6" cy="0" r="6" fill="#ff8fb3" />
            <circle cx="0" cy="0" r="4" fill="#ffd166" />
          </g>

          {/* Brows */}
          <path d="M72,92 Q86,84 100,90" stroke="#e07a94" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M120,90 Q134,84 148,92" stroke="#e07a94" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Eyes */}
          <ellipse cx="86" cy="116" rx="15" ry="18" fill="url(#dshcc-eye)" />
          <ellipse cx="134" cy="116" rx="15" ry="18" fill="url(#dshcc-eye)" />
          <circle cx="91" cy="110" r="6" fill="#ffffff" />
          <circle cx="139" cy="110" r="6" fill="#ffffff" />
          <circle cx="82" cy="122" r="2.5" fill="#ffffff" />
          <circle cx="130" cy="122" r="2.5" fill="#ffffff" />

          {/* Blush + mouth */}
          <ellipse cx="70" cy="138" rx="10" ry="5" fill="#ffb3c1" opacity="0.85" />
          <ellipse cx="150" cy="138" rx="10" ry="5" fill="#ffb3c1" opacity="0.85" />
          <path d="M102,142 Q110,151 118,142" stroke="#d86c7f" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
        )}
      </div>

      {reaction !== null && (
        <div key={reaction.nonce} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', lineHeight: 1 }}>
          <div
            style={{
              position: 'absolute',
              top: -48,
              left: '50%',
              animation: 'dsh-maoniang-pet-bubble 0.25s ease-out both',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                color: '#d86c7f',
                padding: '6px 10px',
                borderRadius: 12,
                border: '1px solid #ffb3c1',
                fontSize: 14,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
              }}
            >
              {reaction.phrase}
            </div>
          </div>
          {HEART_SPARKS.map((spark, index) => (
            <span
              key={index}
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '36%',
                fontSize: 18,
                animation: `dsh-maoniang-pet-heart 1.3s ease-out ${spark.delay}s both`,
                '--dx': `${spark.dx}px`,
              } as CSSProperties}
            >
              {spark.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}