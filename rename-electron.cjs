const fs = require('fs');
const path = require('path');

const distElectron = path.join(__dirname, 'dist-electron');

if (!fs.existsSync(distElectron)) {
  console.log('dist-electron folder not found');
  process.exit(0);
}

const files = fs.readdirSync(distElectron);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const oldPath = path.join(distElectron, file);
    const newPath = path.join(distElectron, file.replace('.js', '.cjs'));
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${file} -> ${file.replace('.js', '.cjs')}`);
  }
});

console.log('Electron files renamed successfully');
