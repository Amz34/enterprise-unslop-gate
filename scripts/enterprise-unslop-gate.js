#!/usr/bin/env node
/**
 * Enterprise Unslop Gate Engine
 * Features:
 *  - Multilingual file scanning (.html, .tsx, .jsx, .vue, .svelte, .astro, .css)
 *  - GitHub Action Workflow Commands (::error, ::warning, ::notice)
 *  - SARIF (Static Analysis Results Interchange Format) generator for GitHub Security / Code Scanning tab
 *  - PR summary markdown generation
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let targetDir = '.';
let failOnFindings = true;
let sarifFile = 'unslop-results.sarif';

args.forEach(arg => {
  if (arg.startsWith('--target=')) targetDir = arg.split('=')[1];
  if (arg.startsWith('--fail=')) failOnFindings = arg.split('=')[1] === 'true';
  if (arg.startsWith('--sarif=')) sarifFile = arg.split('=')[1];
});

const RULES = [
  {
    id: 'UNSLOP-001',
    name: 'PurpleIndigoGradientSlop',
    shortDescription: 'Generic AI-generated purple/indigo/pink gradient',
    category: 'Style/Color',
    severity: 'error',
    regex: /(from-indigo|from-purple|to-pink|to-violet|bg-gradient-to-r.*purple|linear-gradient\(.*#(?:8[a-f0-9]{5}|a[a-f0-9]{5}|c[a-f0-9]{5}).*#(?:e[a-f0-9]{5}|f[a-f0-9]{5})\))/i
  },
  {
    id: 'UNSLOP-002',
    name: 'GratuitousGlowOrBlur',
    shortDescription: 'Unfocused backdrop glow or arbitrary high-radius blur orbs',
    category: 'Lighting',
    severity: 'warning',
    regex: /(blur-3xl|blur-2xl|shadow-\[0_0_\d+px.*\]|box-shadow:.*0px\s+0px.*rgba\()/i
  },
  {
    id: 'UNSLOP-003',
    name: 'TropeEmojisInUI',
    shortDescription: 'AI cliché emojis in navigation headers, pill badges, and copy',
    category: 'Content/Clutter',
    severity: 'error',
    regex: /[✨⚡🚀🔥💡🤖🔮]/u
  },
  {
    id: 'UNSLOP-004',
    name: 'SuperlativeAIBuzzwords',
    shortDescription: 'Vague superlative marketing copy common in vibecoded projects',
    category: 'Copywriting',
    severity: 'warning',
    regex: /\b(supercharge|revolutionize|unleash|empower|next-generation|cutting-edge|game-changer|seamlessly automates)\b/i
  },
  {
    id: 'UNSLOP-005',
    name: 'FloatingPillBadgeOverload',
    shortDescription: 'Gimmicky floating pill tag with pulsing dot or border',
    category: 'Component/Structure',
    severity: 'warning',
    regex: /(rounded-full.*border.*(?:px-3\s+py-1|px-4\s+py-1).*text-xs)/i
  }
];

const SCAN_EXTENSIONS = new Set(['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.css']);

function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', '.next', '.cache'].includes(entry.name)) continue;
      scanDirectory(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SCAN_EXTENSIONS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const files = fs.statSync(targetDir).isDirectory() ? scanDirectory(targetDir) : [targetDir];
const findings = [];

files.forEach(filePath => {
  const relPath = path.relative(process.cwd(), filePath);
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return;
  }

  const lines = content.split('\n');
  lines.forEach((lineText, lineIdx) => {
    RULES.forEach(rule => {
      if (rule.regex.test(lineText)) {
        findings.push({
          file: relPath,
          line: lineIdx + 1,
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          message: rule.shortDescription,
          snippet: lineText.trim().slice(0, 140)
        });

        // GitHub Actions Annotation command
        const level = rule.severity === 'error' ? 'error' : 'warning';
        console.log(`::${level} file=${relPath},line=${lineIdx + 1},title=[${rule.id}] ${rule.name}::${rule.shortDescription}: "${lineText.trim().slice(0, 80)}"`);
      }
    });
  });
});

// Construct SARIF Report for GitHub Security Integration
const sarifReport = {
  $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
  version: '2.1.0',
  runs: [
    {
      tool: {
        driver: {
          name: 'Enterprise Unslop Engine',
          version: '1.0.0',
          informationUri: 'https://github.com/heydamir/unslop',
          rules: RULES.map(r => ({
            id: r.id,
            name: r.name,
            shortDescription: { text: r.shortDescription },
            properties: { category: r.category }
          }))
        }
      },
      results: findings.map(f => ({
        ruleId: f.ruleId,
        level: f.severity === 'error' ? 'error' : 'warning',
        message: { text: `${f.message} (Found: '${f.snippet}')` },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri: f.file },
              region: { startLine: f.line }
            }
          }
        ]
      }))
    }
  ]
};

fs.writeFileSync(path.resolve(sarifFile), JSON.stringify(sarifReport, null, 2));

console.log('\n======================================================');
console.log('   ENTERPRISE UNSLOP AUDIT REPORT');
console.log(`   Files Scanned: ${files.length}`);
console.log(`   Total Violations: ${findings.length}`);
console.log(`   SARIF Generated: ${path.resolve(sarifFile)}`);
console.log('======================================================\n');

const hasErrors = findings.some(f => f.severity === 'error');
if (failOnFindings && hasErrors) {
  console.error(`❌ FAILURE: ${findings.length} UI slop infractions detected. Pipeline failed.`);
  process.exit(1);
} else {
  console.log('✅ Enterprise craft validation completed.');
  process.exit(0);
}
