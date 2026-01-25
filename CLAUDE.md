# GamePulse Frontend

技术栈: React + shadcn/ui + React Bits

## MCP 配置

项目使用仓库级 `.mcp.json` 配置以下 MCP 服务：
- **Apifox API 文档**: 通过环境变量引用 token
- **shadcn MCP**: 用于通过自然语言安装 shadcn/ui 和 React Bits 组件

### 首次设置

复制 `.claude/settings.local.json.example` 为 `.claude/settings.local.json`，填入你的 token：

```json
{
  "env": {
    "APIFOX_ACCESS_TOKEN": "your-actual-token"
  }
}
```

`settings.local.json` 已在 `.gitignore` 中，不会被提交。

## 组件 Registry

项目在 `components.json` 中配置了以下 registry：
- **shadcn/ui**: 默认 registry（无需配置）
- **@react-bits**: `https://reactbits.dev/r/{name}.json`

### 使用示例

通过 shadcn MCP，可以用自然语言安装组件：
- "Show me all available backgrounds from the React Bits registry"
- "Add the Dither background from React Bits to the page"
- "Add a button component from shadcn"
