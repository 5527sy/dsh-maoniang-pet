/**
 * dsh-maoniang-pet — browser half.
 *
 * Registers one root-scoped `shell.overlay` occupant: a cute anime mascot
 * pinned to the boundary between the left sidebar and the conversation panel.
 * The overlay is the ui-layout-owned, root-scoped, always-mounted layer, so
 * the mascot stays visible with or without a current session.
 */
import type { Context } from '@deepseek-ai/cordis'
// Type-only: merges the ui-layout `shell.overlay` SlotMap declaration.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
// Type-only: merges the renderer-owned `ctx.slots` service face.
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { Mascot } from './Mascot.tsx'

/** Required services. */
export const inject = ['slots']

export function apply(ctx: Context): void {
  try {
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
      name: 'shell.overlay',
      id: 'maoniang-pet-mascot',
      order: 10,
    }, Mascot))
    console.log('[dsh-maoniang-pet] boot OK')
  } catch (err) {
    const text = err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err)
    console.error('[dsh-maoniang-pet] apply failed:', err)
    try {
      setTimeout(() => {
        const el = document.createElement('div')
        el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#c0392b;color:#fff;' +
          'padding:10px 12px;font:12px/1.5 sans-serif;white-space:pre-wrap;word-break:break-all;'
        el.textContent = '[dsh-maoniang-pet 启动失败] ' + text
        document.body?.appendChild(el)
      }, 1200)
    } catch { /* banner best-effort */ }
  }
}