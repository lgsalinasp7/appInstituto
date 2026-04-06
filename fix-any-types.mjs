/**
 * Script to fix `any` types across the codebase
 * Handles: context: any, error: any, error.message patterns
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = 'src';
let totalChanges = 0;
let filesChanged = 0;

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      files.push(...walkDir(fullPath));
    } else if (['.ts', '.tsx'].includes(extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;
  let changes = 0;

  // === Pattern 1: `context: any` in API route handlers ===
  // Replace `context: any` with `context` (type is inferred from handler wrapper)
  const contextAnyRegex = /,\s*context:\s*any\s*\)/g;
  if (contextAnyRegex.test(content)) {
    content = content.replace(/,\s*context:\s*any\s*\)/g, ', context)');
    changes++;
  }

  // === Pattern 2: `context?: any` in API route handlers ===
  const contextOptAnyRegex = /,\s*context\?:\s*any\s*\)/g;
  if (contextOptAnyRegex.test(content)) {
    content = content.replace(/,\s*context\?:\s*any\s*\)/g, ', context)');
    changes++;
  }

  // === Pattern 3: `catch (error: any)` => `catch (error: unknown)` ===
  if (content.includes('catch (error: any)')) {
    content = content.replace(/catch\s*\(\s*error:\s*any\s*\)/g, 'catch (error: unknown)');
    changes++;
  }

  // === Pattern 4: `catch (err: any)` => `catch (err: unknown)` ===
  if (content.includes('catch (err: any)')) {
    content = content.replace(/catch\s*\(\s*err:\s*any\s*\)/g, 'catch (err: unknown)');
    changes++;
  }

  // === Pattern 5: `error.message || 'fallback'` after catch (error: unknown) ===
  // This needs to become `error instanceof Error ? error.message : 'fallback'`
  // Match pattern: `error: error.message || 'some string'`
  // But ONLY in files where we changed catch blocks
  if (content.includes('catch (error: unknown)')) {
    // Pattern: error.message || 'string'  (in object property context)
    const errorMsgRegex = /error:\s*error\.message\s*\|\|\s*'([^']+)'/g;
    if (errorMsgRegex.test(content)) {
      content = content.replace(
        /error:\s*error\.message\s*\|\|\s*'([^']+)'/g,
        "error: error instanceof Error ? error.message : '$1'"
      );
      changes++;
    }
    // Same but with double quotes
    const errorMsgRegex2 = /error:\s*error\.message\s*\|\|\s*"([^"]+)"/g;
    if (errorMsgRegex2.test(content)) {
      content = content.replace(
        /error:\s*error\.message\s*\|\|\s*"([^"]+)"/g,
        'error: error instanceof Error ? error.message : "$1"'
      );
      changes++;
    }
    // Pattern: error.message || `template literal`
    const errorMsgRegex3 = /error:\s*error\.message\s*\|\|\s*`([^`]+)`/g;
    if (errorMsgRegex3.test(content)) {
      content = content.replace(
        /error:\s*error\.message\s*\|\|\s*`([^`]+)`/g,
        'error: error instanceof Error ? error.message : `$1`'
      );
      changes++;
    }
  }

  // === Pattern 6: Same for `err` variable ===
  if (content.includes('catch (err: unknown)')) {
    const errMsgRegex = /err\.message\s*\|\|\s*'([^']+)'/g;
    if (errMsgRegex.test(content)) {
      content = content.replace(
        /err\.message\s*\|\|\s*'([^']+)'/g,
        "err instanceof Error ? err.message : '$1'"
      );
      changes++;
    }
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    totalChanges += changes;
    filesChanged++;
    console.log(`  Fixed ${filePath} (${changes} pattern groups)`);
  }
}

console.log('Scanning files...');
const files = walkDir(SRC_DIR);
console.log(`Found ${files.length} .ts/.tsx files`);

for (const file of files) {
  fixFile(file);
}

console.log(`\nDone! Changed ${filesChanged} files with ${totalChanges} pattern groups fixed.`);
