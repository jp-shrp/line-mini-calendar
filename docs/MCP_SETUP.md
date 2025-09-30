# MCP (Model Context Protocol) セットアップガイド

## 概要

このプロジェクトではModel Context Protocol (MCP)を使用してClaude Codeとの連携を行っています。

## 現在の設定

### 設定ファイル

- `~/.claude.json` - Claude MCP用の設定（主要設定）
- `.claude_code_config.json` - 空の設定ファイル

### 利用可能なMCPサーバー

#### Serena MCP Server

- **機能**: IDE統合アシスタント機能
- **ステータス**: ✓ 接続済み
- **コマンド**: `uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project /Users/mitu/projects/eiko-direct`
- **スコープ**: ローカル設定（このプロジェクト専用）

## 設定の確認

```bash
# MCPサーバー一覧確認
claude mcp list

# Serenaサーバーの詳細確認
claude mcp get serena
```

## トラブルシューティング

### Serena MCPサーバーが起動しない場合

1. uvxとPythonの確認：

```bash
which uvx
python --version
```

2. Serenaサーバーの再インストール：

```bash
uvx --from git+https://github.com/oraios/serena serena-mcp-server --help
```

## MCP管理コマンド

### Serena MCPサーバー管理

```bash
# サーバー削除（必要に応じて）
claude mcp remove "serena" -s local

# 再追加
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project $(pwd)
```

## 更新履歴

- 2025-09-17: Serena MCPサーバー設定完了、不要なレガシーサーバー削除
