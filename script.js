const fs = require('fs');
const path = require('path');
const dir = './src/views';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace fetch('/api/...)
  content = content.replace(/fetch\(\s*\'\/api\//g, 'fetch(import.meta.env.VITE_API_URL + \'/api/');
  content = content.replace(/fetch\(\s*\"\/api\//g, 'fetch(import.meta.env.VITE_API_URL + \"/api/');
  
  // Replace fetch(/api/...)
  content = content.replace(/fetch\(\s*\\/api\//g, 'fetch(${import.meta.env.VITE_API_URL}/api/');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(Updated );
  }
});
