const fs = require('fs');
const path = require('path');

function fixCSSIssues() {
  console.log('Starting CSS issue fixes...\n');
  
  // Fix 1: Malformed comment in src/index.css
  const indexCssPath = 'src/index.css';
  if (fs.existsSync(indexCssPath)) {
    console.log('Fixing malformed comment in src/index.css...');
    let content = fs.readFileSync(indexCssPath, 'utf8');
    
    // Find and fix the malformed comment
    const malformedCommentRegex = /\/\*\s*Uncomment and customize if you want dark mode support\s*\n\s*body\s*\{\s*\n\s*background-color:\s*#1a1a1a;\s*\n\s*color:\s*#ffffff;\s*\n\s*\}\s*\n\s*\*\//gm;
    
    if (malformedCommentRegex.test(content)) {
      content = content.replace(
        malformedCommentRegex,
        '/* Uncomment and customize if you want dark mode support\n  body {\n    background-color: #1a1a1a;\n    color: #ffffff;\n  }\n  */'
      );
      
      fs.writeFileSync(indexCssPath, content);
      console.log('✓ Fixed malformed comment in src/index.css');
    } else {
      console.log('? Malformed comment not found in expected format - trying alternative fix...');
      
      // Alternative approach: look for the specific pattern and fix it
      const lines = content.split('\n');
      let fixed = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('/* Uncomment and customize if you want dark mode support')) {
          // Check if this line doesn't end the comment properly
          if (!lines[i].includes('*/')) {
            // Find where the comment should end
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].trim() === '*/') {
                // This is the problematic closing - it should be inside the comment
                lines[j] = '  */';
                fixed = true;
                break;
              }
            }
          }
          break;
        }
      }
      
      if (fixed) {
        content = lines.join('\n');
        fs.writeFileSync(indexCssPath, content);
        console.log('✓ Fixed malformed comment using alternative method');
      } else {
        console.log('✗ Could not fix malformed comment automatically');
      }
    }
  } else {
    console.log('✗ src/index.css not found');
  }
  
  // Fix 2: Data URI in src/components/sections/CTASection.css
  const ctaCssPath = 'src/components/sections/CTASection.css';
  if (fs.existsSync(ctaCssPath)) {
    console.log('\nFixing data URI in src/components/sections/CTASection.css...');
    let content = fs.readFileSync(ctaCssPath, 'utf8');
    
    // Create a proper SVG file instead of using data URI
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="25" cy="25" r="1" fill="white" opacity="0.05"/>
      <circle cx="75" cy="75" r="1" fill="white" opacity="0.05"/>
      <circle cx="50" cy="10" r="0.5" fill="white" opacity="0.03"/>
      <circle cx="20" cy="80" r="0.5" fill="white" opacity="0.03"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#grain)"/>
</svg>`;
    
    // Create assets directory if it doesn't exist
    const assetsDir = 'src/assets';
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Write the SVG file
    const svgPath = path.join(assetsDir, 'grain-pattern.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log('✓ Created grain-pattern.svg in src/assets/');
    
    // Replace the data URI with a reference to the SVG file
    const dataUriRegex = /background:\s*url\("data:image\/svg\+xml;base64,[^"]+"\);?/g;
    
    if (dataUriRegex.test(content)) {
      content = content.replace(
        dataUriRegex,
        'background: url("../../assets/grain-pattern.svg");'
      );
      
      fs.writeFileSync(ctaCssPath, content);
      console.log('✓ Replaced data URI with SVG file reference');
    } else {
      console.log('? Data URI not found in expected format');
    }
  } else {
    console.log('✗ src/components/sections/CTASection.css not found');
  }
  
  console.log('\n=== CSS Issue Fixes Complete ===');
  console.log('You should now be able to run "npm run build" successfully.');
}

// Run the fixes
fixCSSIssues();