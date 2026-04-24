const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Fix the script tag to include type="module"
  html = html.replace(
    /<script src="(\/_expo\/static\/js\/web\/[^"]+)" defer><\/script>/,
    '<script type="module" src="$1" defer></script>'
  );
  
  fs.writeFileSync(indexPath, html);
  console.log('✓ Fixed index.html - added type="module" to script tag');
} else {
  console.log('index.html not found at:', indexPath);
}
