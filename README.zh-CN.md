# dsh-maoniang-pet

为 DeepSeek Harness 增加一个**可拖拽、可点击互动的二次元猫娘（萝莉）宠物形象**。它是一个可通过 `dsh plugin` 安装的 Web 插件 Bundle，不修改 DeepSeek Harness 安装目录。

默认形象是内联 SVG（无二进制资源、无网络、无后端），也支持用你自己的 GIF / PNG 图片 URL 替换。

## 功能特性

- **常驻展示**：注册在整壳 `shell.overlay`，有会话、无会话时都显示。
- **智能初始定位**：默认位于主对话区左侧（初始 1/6 处、垂直居中），跟随侧边栏折叠/展开与拖拽实时重算。
- **自由拖拽**：按住形象即可拖到任意位置；拖过一次后不再被布局自动吸附。
- **点击互动**：轻点触发蹦跳 + 气泡台词 + 飘爱心。
- **可换图 / 反应图**：支持通过配置切换形象；点击时还可临时切到「反应图」3 秒后自动切回。
- **零依赖资产**：默认 SVG 自带；图片自定义走 URL，不把大体积二进制打进 npm 包。

## 安装

### 从本地仓库安装

```powershell
pnpm install
dsh plugin --profile web add .
```

`pnpm install` 会触发 `prepare` 构建，生成 `lib/client.js` 浏览器 Bundle。

### 从 npm / GitHub 安装（发布后）

```powershell
dsh plugin --profile web add dsh-maoniang-pet
# 或
dsh plugin --profile web add github:5527sy/dsh-maoniang-pet#v0.1.0
```

## 自定义形象

浏览器侧可通过 `localStorage` 覆盖（在开发者工具控制台设置）：

| Key | 含义 |
|---|---|
| `s2s.mascot.src` | 默认形象 URL（`http(s)://` 或 `data:`；留空 = 内置 SVG） |
| `s2s.mascot.reaction` | 点击时的反应图 URL（留空 = 不切换图片，只做蹦跳/气泡/爱心） |
| `s2s.mascot.width` | 图片宽度（默认 `150`） |

也可以在控制台实时调用：

```js
window.__dshMaoniangPetSetMascot('https://example.com/idle.gif')
window.__dshMaoniangPetSetReaction('https://example.com/react.gif')
// 恢复内置 SVG / 关闭反应图
window.__dshMaoniangPetSetMascot('')
window.__dshMaoniangPetSetReaction('')
```

## 开发与检查

```powershell
pnpm install
pnpm run check
```

`pnpm run check` 依次执行类型检查、tsdown 构建、`scripts/verify-package.mjs` 发布清单校验。CI（GitHub Actions，Ubuntu）执行同样的检查。

## 目录结构

- `dsh-plugin/src/index.ts` —— Node 半侧（留空）。
- `dsh-plugin/src/client/index.ts` —— 注册 `shell.overlay` 形象入口。
- `dsh-plugin/src/client/Mascot.tsx` —— 形象渲染、拖拽、点击互动与定位。
- `cordis.patch.yml` —— 安装器 profile overlay 条目。
- `scripts/` —— 清理与构建后校验脚本。
- `types/deepseek-harness.d.ts` —— 本地类型桩（仅用于 `tsc --noEmit`）。

## 许可证

Apache License 2.0，详见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)。