# dsh-maoniang-pet

A **draggable, click-reactive anime cat-girl mascot** for DeepSeek Harness. It is
a Web plugin bundle installable through `dsh plugin`, and it does not modify the
DeepSeek Harness installation.

The default mascot is a self-contained inline SVG (no binary assets, no network,
no backend). You can replace it with your own GIF / PNG image URL.

## Features

- **Always-on**: registered in the shell `shell.overlay`, visible with or without
  a current session.
- **Smart initial placement**: starts on the left side of the conversation panel
  and tracks sidebar collapse/expand and drags until you move it yourself.
- **Free drag**: grab the mascot to place it anywhere.
- **Click interaction**: a quick tap triggers a bounce, a speech bubble, and
  floating hearts.
- **Custom image / reaction image**: swap the idle image, and optionally swap in
  a reaction image for 3 seconds on click before reverting.
- **Zero-asset default**: the built-in SVG keeps the npm package tiny; custom
  images are loaded from URLs instead of being bundled.

## Install

### From a local checkout

```powershell
pnpm install
dsh plugin --profile web add .
```

`pnpm install` triggers the `prepare` build and emits the `lib/client.js` browser
bundle.

### From npm / GitHub (once published)

```powershell
dsh plugin --profile web add dsh-maoniang-pet
# or
dsh plugin --profile web add github:5527sy/dsh-maoniang-pet#v0.1.0
```

## Customization

Browser-side `localStorage` overrides (set them from the devtools console):

| Key | Meaning |
|---|---|
| `s2s.mascot.src` | Idle image URL (`http(s)://` or `data:`; empty = built-in SVG) |
| `s2s.mascot.reaction` | Click reaction image URL (empty = no image swap, only bounce/bubble/hearts) |
| `s2s.mascot.width` | Image width (default `150`) |

Live console hooks are also available:

```js
window.__dshMaoniangPetSetMascot('https://example.com/idle.gif')
window.__dshMaoniangPetSetReaction('https://example.com/react.gif')
// restore the built-in SVG / disable the reaction image
window.__dshMaoniangPetSetMascot('')
window.__dshMaoniangPetSetReaction('')
```

## Development

```powershell
pnpm install
pnpm run check
```

`pnpm run check` runs the TypeScript check, the tsdown build, and
`scripts/verify-package.mjs`. CI (GitHub Actions, Ubuntu) runs the same check.

## Layout

- `dsh-plugin/src/index.ts` — empty node half.
- `dsh-plugin/src/client/index.ts` — registers the `shell.overlay` mascot entry.
- `dsh-plugin/src/client/Mascot.tsx` — rendering, drag, click interaction, and placement.
- `cordis.patch.yml` — installer profile overlay row.
- `scripts/` — clean and package verification scripts.
- `types/deepseek-harness.d.ts` — local type shim used only by `tsc --noEmit`.

## License

Apache License 2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE).