# Contributing

Thanks for your interest in contributing to `dsh-maoniang-pet`.

## Prerequisites

- Node.js `^22.19.0` or `>=24`
- pnpm `11.7.0`

## Setup

```powershell
pnpm install
pnpm run check
```

`pnpm run check` runs the TypeScript check, the tsdown build, and the package
manifest verification script.

## Conventions

- The Node half (`dsh-plugin/src/index.ts`) is intentionally empty; everything
  lives in the browser half under `dsh-plugin/src/client/`.
- Keep the mascot self-contained by default. Do not commit binary image assets;
  users customize the mascot with their own image URL.
- Update `README.md` / `README.zh-CN.md` and `CHANGELOG.md` in the same change
  as behavior.

## License

By contributing, you agree that your contributions are licensed under the
Apache License 2.0 (see [LICENSE](LICENSE)).