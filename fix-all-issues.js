const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  targetDir: './docs-news/Technology-Weekly',
  backupDir: './backup-before-fix',
  createBackup: true,
  dryRun: false, // 改为 true 只预览不修改
};

// 统计信息
const stats = {
  filesScanned: 0,
  filesModified: 0,
  brokenLinksFixed: 0,
  protocolsAdded: 0,
  fullWidthColonsFixed: 0,
  styleAttrsFixed: 0,
  latexChineseFixed: 0,
  errors: [],
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// 创建备份
function createBackup(filePath) {
  if (!CONFIG.createBackup) return;
  
  const relativePath = path.relative(CONFIG.targetDir, filePath);
  const backupPath = path.join(CONFIG.backupDir, relativePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
}

// 检查文件是否存在
function checkLocalFileExists(baseDir, linkPath) {
  // 处理相对路径
  const fullPath = path.resolve(baseDir, linkPath);
  return fs.existsSync(fullPath);
}

// 修复内容
function fixContent(content, filePath) {
  let modified = false;
  let newContent = content;
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);

  // 1. 修复全角冒号链接（必须最先处理）
  const fullWidthColonRegex = /\]\(：(https?:\/\/[^\)]+)\)/g;
  if (fullWidthColonRegex.test(newContent)) {
    newContent = newContent.replace(fullWidthColonRegex, ']($1)');
    stats.fullWidthColonsFixed++;
    modified = true;
    log(`  ✓ 修复全角冒号链接`, 'green');
  }

  // 2. 修复缺少协议的域名链接
  // 匹配 [xxx](domain.com) 但不匹配已有 http(s):// 或 ./ 或 / 或 # 开头的
  const domainRegex = /\]\(([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)\)/g;
  
  let matches = [...newContent.matchAll(domainRegex)];
  matches.forEach(match => {
    const domain = match[1];
    // 排除本地文件引用（包含 .md 等扩展名）
    if (!domain.match(/\.(md|html|pdf|png|jpg|jpeg|gif|svg)$/i)) {
      const fullLink = `https://${domain}`;
      newContent = newContent.replace(`](${domain})`, `](${fullLink})`);
      stats.protocolsAdded++;
      modified = true;
      log(`  ✓ 添加协议: ${domain} → ${fullLink}`, 'green');
    }
  });

  // 3. 修复本地文件引用（找不到的改为外部链接）
  const localLinkRegex = /\[([^\]]+)\]\((\.\/)?([^)]+\.md)\)/g;
  matches = [...newContent.matchAll(localLinkRegex)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const linkText = match[1];
    const linkPath = match[3];
    
    // 检查文件是否存在
    if (!checkLocalFileExists(fileDir, linkPath)) {
      // 尝试提取期数
      const issueMatch = linkPath.match(/issue-(\d+)\.md/);
      if (issueMatch) {
        const issueNum = issueMatch[1];
        const githubLink = `https://github.com/ruanyf/weekly/blob/master/docs/issue-${issueNum}.md`;
        newContent = newContent.replace(fullMatch, `[${linkText}](${githubLink})`);
        stats.brokenLinksFixed++;
        modified = true;
        log(`  ✓ 修复断链: ${linkPath} → GitHub`, 'green');
      } else {
        // 其他情况：注释掉
        newContent = newContent.replace(fullMatch, `<!-- [${linkText}](${linkPath}) 链接已失效 -->${linkText}`);
        stats.brokenLinksFixed++;
        modified = true;
        log(`  ⚠ 注释断链: ${linkPath}`, 'yellow');
      }
    }
  });

  // 4. 修复 HTML style 属性（字符串改为对象）
  const styleRegex = /<(\w+)\s+style="([^"]+)"([^>]*)>/g;
  matches = [...newContent.matchAll(styleRegex)];
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const tag = match[1];
      const styleStr = match[2];
      const rest = match[3];
      
      // 将 CSS 字符串转为 JSX 对象格式
      const styleObj = styleStr
        .split(';')
        .filter(s => s.trim())
        .map(s => {
          const [key, value] = s.split(':').map(p => p.trim());
          // 转驼峰命名
          const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          return `${camelKey}: '${value}'`;
        })
        .join(', ');
      
      const newTag = `<${tag} style={{${styleObj}}}${rest}>`;
      newContent = newContent.replace(match[0], newTag);
      stats.styleAttrsFixed++;
      modified = true;
    });
    log(`  ✓ 修复 ${matches.length} 个 style 属性`, 'green');
  }

  // 5. 修复 LaTeX 中的中文字符
  const mathRegex = /\$([^\$]+)\$/g;
  matches = [...newContent.matchAll(mathRegex)];
  
  matches.forEach(match => {
    const formula = match[1];
    // 检查是否包含中文
    if (/[\u4e00-\u9fa5]/.test(formula)) {
      // 用 \text{} 包裹中文部分
      const fixed = formula.replace(/([\u4e00-\u9fa5]+)/g, '\\text{$1}');
      newContent = newContent.replace(`$${formula}$`, `$${fixed}$`);
      stats.latexChineseFixed++;
      modified = true;
      log(`  ✓ 修复 LaTeX 中文: $${formula}$ → $${fixed}$`, 'green');
    }
  });

  return { newContent, modified };
}

// 处理单个文件
function processFile(filePath) {
  stats.filesScanned++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { newContent, modified } = fixContent(content, filePath);
    
    if (modified) {
      stats.filesModified++;
      log(`\n📝 ${path.relative(CONFIG.targetDir, filePath)}`, 'blue');
      
      if (!CONFIG.dryRun) {
        createBackup(filePath);
        fs.writeFileSync(filePath, newContent, 'utf8');
        log(`  ✅ 已保存修改`, 'green');
      } else {
        log(`  ⚠️  预览模式，未保存`, 'yellow');
      }
    }
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    log(`\n❌ 处理失败: ${filePath}`, 'red');
    log(`   错误: ${error.message}`, 'red');
  }
}

// 递归扫描目录
function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && item.endsWith('.md')) {
      processFile(fullPath);
    }
  });
}

// 主函数
function main() {
  log('\n🚀 开始修复 Technology-Weekly Markdown 文件...\n', 'blue');
  log(`📂 目标目录: ${CONFIG.targetDir}`, 'blue');
  log(`💾 备份目录: ${CONFIG.createBackup ? CONFIG.backupDir : '不创建备份'}`, 'blue');
  log(`🔍 运行模式: ${CONFIG.dryRun ? '预览模式（不修改文件）' : '修改模式'}`, 'blue');
  log('─'.repeat(60), 'blue');

  // 检查目标目录是否存在
  if (!fs.existsSync(CONFIG.targetDir)) {
    log(`\n❌ 错误: 目录不存在 ${CONFIG.targetDir}`, 'red');
    process.exit(1);
  }

  // 创建备份目录
  if (CONFIG.createBackup && !CONFIG.dryRun) {
    if (fs.existsSync(CONFIG.backupDir)) {
      log(`\n⚠️  备份目录已存在，将被覆盖: ${CONFIG.backupDir}`, 'yellow');
    }
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  // 开始扫描
  const startTime = Date.now();
  scanDirectory(CONFIG.targetDir);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // 输出统计
  log('\n' + '='.repeat(60), 'blue');
  log('📊 处理完成！统计信息：\n', 'green');
  log(`✅ 扫描文件数: ${stats.filesScanned}`, 'blue');
  log(`✏️  修改文件数: ${stats.filesModified}`, 'blue');
  log(`🔗 修复断链数: ${stats.brokenLinksFixed}`, 'green');
  log(`🌐 添加协议数: ${stats.protocolsAdded}`, 'green');
  log(`：修复全角冒号: ${stats.fullWidthColonsFixed}`, 'green');
  log(`🎨 修复 style 属性: ${stats.styleAttrsFixed}`, 'green');
  log(`📐 修复 LaTeX 中文: ${stats.latexChineseFixed}`, 'green');
  log(`⏱️  用时: ${duration}s`, 'blue');

  if (stats.errors.length > 0) {
    log(`\n⚠️  遇到 ${stats.errors.length} 个错误：`, 'yellow');
    stats.errors.forEach(({ file, error }) => {
      log(`  - ${file}: ${error}`, 'red');
    });
  }

  log('\n' + '='.repeat(60), 'blue');

  if (CONFIG.dryRun) {
    log('\n💡 提示: 这是预览模式。要真正修改文件，请将脚本中的 dryRun 改为 false', 'yellow');
  } else {
    log('\n✅ 所有修改已保存！', 'green');
    if (CONFIG.createBackup) {
      log(`📦 原始文件已备份到: ${CONFIG.backupDir}`, 'blue');
    }
  }
}

// 运行
main();