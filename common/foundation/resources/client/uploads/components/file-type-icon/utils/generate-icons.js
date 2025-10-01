/**
 * Utility to generate React icon components from SVG files in public/fileicons
 * Usage: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert SVG content to React component string
 */
function svgToReactComponent(svgContent, componentName) {
  // Remove XML declaration and extract SVG content
  let cleanedSvg = svgContent.replace(/<\?xml[^>]*>/g, '').trim();
  
  // Extract the content inside the SVG tag
  const svgMatch = cleanedSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!svgMatch) {
    throw new Error('Invalid SVG content');
  }
  
  const svgInnerContent = svgMatch[1];
  
  // Convert class attributes to className and handle common SVG attributes
  let reactContent = svgInnerContent
    .replace(/class="([^"]*)"/g, 'className="$1"')
    .replace(/fill="([^"]*)"/g, 'fill="$1"')
    .replace(/stroke="([^"]*)"/g, 'stroke="$1"');
  
  // Generate the React component
  const componentCode = `import { createSvgIcon } from '@ui/icons/create-svg-icon';

export const ${componentName} = createSvgIcon(
  <g>
    ${reactContent}
  </g>
);`;
  
  return componentCode;
}

/**
 * Generate icon components from all SVG files in the fileicons directory
 */
function generateIconComponents() {
  const svgDirectory = path.resolve(__dirname, '../../../../public/fileicons');
  const iconOutputDir = path.resolve(__dirname, '../icons');
  
  console.log('SVG Directory:', svgDirectory);
  console.log('Output Directory:', iconOutputDir);
  
  if (!fs.existsSync(svgDirectory)) {
    console.error('SVG directory not found:', svgDirectory);
    return;
  }
  
  if (!fs.existsSync(iconOutputDir)) {
    fs.mkdirSync(iconOutputDir, { recursive: true });
  }
  
  const svgFiles = fs.readdirSync(svgDirectory).filter(file => file.endsWith('.svg'));
  console.log('Found SVG files:', svgFiles);
  
  svgFiles.forEach(svgFile => {
    const svgPath = path.join(svgDirectory, svgFile);
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Generate component name (e.g., 'archive.svg' -> 'ArchiveIcon')
    const baseName = path.basename(svgFile, '.svg');
    const componentName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + 'Icon';
    
    try {
      const componentCode = svgToReactComponent(svgContent, componentName);
      const outputPath = path.join(iconOutputDir, `${baseName}-icon.jsx`);
      
      fs.writeFileSync(outputPath, componentCode);
      console.log(`Generated: ${outputPath}`);
    } catch (error) {
      console.error(`Error processing ${svgFile}:`, error.message);
    }
  });
}

// Run the generator
if (require.main === module) {
  console.log('Generating icon components from SVG files...');
  generateIconComponents();
  console.log('Icon generation complete!');
}

module.exports = { generateIconComponents, svgToReactComponent };