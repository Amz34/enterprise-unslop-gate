# 🛡️ Enterprise Zero-Slop Quality Gate (GitHub Action)

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Zero--Slop_Gate-blue.svg)](https://github.com/Amz34/enterprise-unslop-gate)
[![SARIF v2.1.0](https://img.shields.io/badge/SARIF-OASIS_v2.1.0-green.svg)](https://github.com/oasis-tcs/sarif-spec)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Eliminate AI-generated "UI slop" (clichéd purple/indigo gradients, high-radius blur orbs, navigation emojis, and hollow marketing buzzwords) across your frontend codebases before merge.

Generates **OASIS SARIF v2.1.0** diagnostics directly into the **GitHub Security -> Code Scanning alerts** tab alongside in-line PR diff annotations.

---

## 🚀 Quick Usage

Add this step to your GitHub Actions workflow (e.g. `.github/workflows/ui-craft.yml`):

```yaml
name: UI Craft & Anti-Slop Governance

on:
  pull_request:
    paths:
      - '**.html'
      - '**.jsx'
      - '**.tsx'
      - '**.vue'
      - '**.svelte'
      - '**.css'

permissions:
  contents: read
  security-events: write

jobs:
  audit-craft:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node Runtime
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run Zero-Slop Gate
        uses: Amz34/enterprise-unslop-gate@v1
        with:
          target-path: '.'
          fail-on-findings: 'true'
          sarif-output: 'unslop-results.sarif'

      - name: Upload SARIF to GitHub Security Tab
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: unslop-results.sarif
          category: ui-craft-governance
```

---

## 📋 Evaluation Criteria

| Rule ID | Name | Category | Severity | Detection Target |
| :--- | :--- | :--- | :--- | :--- |
| `UNSLOP-001` | PurpleIndigoGradientSlop | Color / Style | `Error` | Clichéd purple-to-indigo/pink gradients |
| `UNSLOP-002` | GratuitousGlowOrBlur | Lighting | `Warning` | Unfocused backdrop glow or high-radius blur orbs |
| `UNSLOP-003` | TropeEmojisInUI | Content / Clutter | `Error` | Cliché AI emojis (`✨, 🚀, ⚡, 🔥`) in UI chrome |
| `UNSLOP-004` | SuperlativeAIBuzzwords | Copywriting | `Warning` | Superlative marketing buzzwords (*"supercharge"*) |
| `UNSLOP-005` | FloatingPillBadgeOverload | Component | `Warning` | Gimmicky floating pill tags with pulse animations |

---

## 🛡️ License & Credit
Licensed under **MIT**. Built and maintained by **[Aamir Zameer (Amz34)](https://github.com/Amz34)**.

---

Part of [my always-on agent stack](https://github.com/Amz34) · [Awesome Agent Infrastructure](https://github.com/Amz34/awesome-agent-infrastructure) (135 live-checked building blocks).
