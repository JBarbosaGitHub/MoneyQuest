const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

// Read all component files
fs.readdirSync(componentsDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all instances of /html/assets/ with /assets/
    content = content.replace(/\/html\/assets\//g, '/assets/');
    
    // Write the file back
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});