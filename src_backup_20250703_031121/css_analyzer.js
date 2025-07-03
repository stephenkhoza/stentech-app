const fs = require('fs');
const path = require('path');

function findCSSFiles(dir) {
  const files = [];
  
  function searchDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (item.endsWith('.css')) {
        files.push(fullPath);
      }
    }
  }
  
  searchDir(dir);
  return files;
}

function analyzeCSSFile(filePath) {
  console.log(`Analyzing ${filePath} for build-breaking patterns...`);
  
  const css = fs.readFileSync(filePath, 'utf8');
  const lines = css.split('\n');
  
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    const problems = [];
    
    // Check for unescaped forward slashes in content properties
    if (trimmed.includes('content:')) {
      const contentMatch = trimmed.match(/content\s*:\s*["']([^"']*)["']/);
      if (contentMatch && contentMatch[1].includes('/') && !contentMatch[1].includes('\\/')) {
        problems.push('CONTENT: Unescaped forward slash in content property');
      }
    }
    
    // Check for malformed comments
    if (trimmed.includes('/*') && !trimmed.includes('*/') && !trimmed.endsWith('*/')) {
      problems.push('COMMENT: Potentially malformed comment');
    }
    
    // Check for suspicious patterns in URLs or data URIs
    if (trimmed.includes('url(') && trimmed.includes('data:')) {
      const dataUriMatch = trimmed.match(/url\(["']?(data:[^)]+)["']?\)/);
      if (dataUriMatch && dataUriMatch[1].includes('/') && !dataUriMatch[1].includes('%2F')) {
        problems.push('DATA_URI: Potentially problematic data URI');
      }
    }
    
    // Check for division in calc without spaces
    if (trimmed.includes('calc(') && /calc\([^)]*\/[^)]*\)/.test(trimmed)) {
      const calcMatch = trimmed.match(/calc\(([^)]*)\)/);
      if (calcMatch && calcMatch[1].includes('/') && !/\s\/\s/.test(calcMatch[1])) {
        problems.push('CALC: Division in calc() without proper spacing');
      }
    }
    
    // Check for other suspicious forward slash patterns
    if (trimmed.includes('/') && 
        !trimmed.includes('//') && 
        !trimmed.includes('/*') && 
        !trimmed.includes('*/') && 
        !trimmed.includes('url(') && 
        !trimmed.includes('http')) {
      problems.push('SUSPICIOUS: Forward slash in unusual context');
    }
    
    // Report problems
    problems.forEach(problem => {
      console.log(`${problem}`);
      console.log(`  File: ${filePath}`);
      console.log(`  Line ${i + 1}: ${trimmed}`);
      console.log('');
    });
  });
}

// Main execution
const srcDir = './src';
const cssFiles = findCSSFiles(srcDir);

cssFiles.forEach(file => {
  analyzeCSSFile(file);
});

console.log('Analysis complete.');