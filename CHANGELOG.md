# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-07

### Added

- Installable DeepSeek Harness `web` profile bundle (`dsh-maoniang-pet`).
- A draggable, click-reactive anime cat-girl mascot registered in the shell
  `shell.overlay` slot.
- Layout-follow positioning (left of the conversation panel) until the user
  drags the mascot, then free placement.
- Click interaction: bounce, speech bubble, and floating hearts.
- Optional GIF customization through `s2s.mascot.src` /
  `s2s.mascot.reaction` (or the `window.__dshMaoniangPetSetMascot` /
  `window.__dshMaoniangPetSetReaction` hooks).
- Built-in self-contained SVG fallback (no binary assets required).