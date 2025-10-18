#!/usr/bin/env node

/**
 * PoC Directory Protection Checker
 * 
 * This script checks if any files in the PoC directory have been modified.
 * It's designed to prevent accidental modifications to PoC reference code.
 * 
 * Usage:
 *   node scripts/check-poc-protection.js
 * 
 * Exit codes:
 *   0 - No PoC files modified (safe to continue)
 *   1 - PoC files modified (warning issued)
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { 
      cwd: projectRoot,
      stdio: 'ignore'
    });
    return true;
  } catch (error) {
    return false;
  }
}

function getModifiedPoCFiles() {
  try {
    // Check staged files
    const stagedFiles = execSync('git diff --cached --name-only', {
      cwd: projectRoot,
      encoding: 'utf-8'
    }).trim().split('\n').filter(Boolean);

    // Check unstaged files
    const unstagedFiles = execSync('git diff --name-only', {
      cwd: projectRoot,
      encoding: 'utf-8'
    }).trim().split('\n').filter(Boolean);

    const allModifiedFiles = [...new Set([...stagedFiles, ...unstagedFiles])];
    
    // Filter for PoC directory files
    const pocFiles = allModifiedFiles.filter(file => {
      return file.startsWith('PoC/') && 
             !file.endsWith('PROTECTION.md'); // Allow adding PROTECTION.md
    });

    return pocFiles;
  } catch (error) {
    // If git diff fails, return empty array
    return [];
  }
}

function main() {
  log('\n🔍 Checking PoC Directory Protection...', 'bold');
  
  // Check if we're in a git repository
  if (!checkGitRepository()) {
    log('⚠️  Not a git repository. Skipping check.', 'yellow');
    process.exit(0);
  }

  // Check for modified PoC files
  const modifiedPoCFiles = getModifiedPoCFiles();

  if (modifiedPoCFiles.length === 0) {
    log('✅ No PoC files modified. Safe to proceed.', 'green');
    process.exit(0);
  }

  // PoC files were modified - issue warning
  log('\n⚠️  WARNING: PoC Directory Files Modified!', 'red');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
  log('\n절대 규칙: PoC 경로 파일, 코드, 문서는 절대 훼손하면 안됩니다.', 'red');
  log('ABSOLUTE RULE: PoC path files, code, and documents must NEVER be damaged.\n', 'red');
  
  log('Modified PoC files:', 'yellow');
  modifiedPoCFiles.forEach(file => {
    log(`  - ${file}`, 'yellow');
  });

  log('\n📖 PoC files are for REFERENCE and LEARNING ONLY.', 'yellow');
  log('   Do NOT modify them directly!\n', 'yellow');
  
  log('Instead, you should:', 'green');
  log('  1. Copy PoC files to another location', 'green');
  log('  2. Reference PoC code without modifying it', 'green');
  log('  3. Restore from PoC if needed (see PoC/docs/PoC-restoration-guide.md)', 'green');
  
  log('\n📄 For more information, see:', 'bold');
  log('   - PoC/PROTECTION.md', 'bold');
  log('   - PoC/docs/PoC-restoration-guide.md', 'bold');
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'red');
  
  // Exit with warning code
  log('⚠️  Please revert changes to PoC directory or ensure you have a valid reason.', 'red');
  log('⚠️  If you must proceed, document your changes and create a backup.\n', 'red');
  
  process.exit(1);
}

main();
