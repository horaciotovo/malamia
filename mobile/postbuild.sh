#!/bin/bash
# Fix module type in index.html for Netlify deployment
if [ -f dist/index.html ]; then
  sed -i 's/<script src="\/\/_expo\/static\/js\/web\/<script type="module" src="\/_expo\/static\/js\/web\//g' dist/index.html
  # More reliable approach
  node -e "
    const fs = require('fs');
    const html = fs.readFileSync('dist/index.html', 'utf8');
    const fixed = html.replace(
      /<script src=\"\/_expo\/static\/js\/web\/([^\"]+)\" defer><\/script>/,
      '<script type=\"module\" src=\"/_expo/static/js/web/\$1\" defer></script>'
    );
    fs.writeFileSync('dist/index.html', fixed);
  "
  echo "Fixed index.html module type"
fi
