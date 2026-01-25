# GamePulse Frontend

技术栈: React + shadcn/ui + React Bits

## MCP 配置

项目使用仓库级 `.mcp.json` 配置 Apifox API 文档服务，通过环境变量引用 token。

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
