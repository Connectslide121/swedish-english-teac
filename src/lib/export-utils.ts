function resolveCSSVariable(value: string): string {
  if (!value || !value.includes('var(')) return value;
  
  const varMatch = value.match(/var\((--[^)]+)\)/);
  if (varMatch) {
    const computedValue = getComputedStyle(document.documentElement).getPropertyValue(varMatch[1]);
    return computedValue.trim() || value;
  }
  
  return value;
}

function cloneAndResolveStyles(svgElement: SVGSVGElement): SVGSVGElement {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
  const elementsWithFill = clone.querySelectorAll('[fill]');
  elementsWithFill.forEach((el) => {
    const fillValue = el.getAttribute('fill');
    if (fillValue) {
      const resolvedFill = resolveCSSVariable(fillValue);
      el.setAttribute('fill', resolvedFill);
    }
  });
  
  const elementsWithStroke = clone.querySelectorAll('[stroke]');
  elementsWithStroke.forEach((el) => {
    const strokeValue = el.getAttribute('stroke');
    if (strokeValue) {
      const resolvedStroke = resolveCSSVariable(strokeValue);
      el.setAttribute('stroke', resolvedStroke);
    }
  });
  
  const textElements = clone.querySelectorAll('text');
  textElements.forEach((text) => {
    const style = window.getComputedStyle(svgElement.querySelector(`text:nth-of-type(${Array.from(svgElement.querySelectorAll('text')).indexOf(svgElement.querySelectorAll('text')[Array.from(clone.querySelectorAll('text')).indexOf(text)]) + 1})`) || text);
    const fill = style.fill;
    const fontSize = style.fontSize;
    const fontFamily = style.fontFamily;
    
    if (fill && fill !== 'rgb(0, 0, 0)') {
      text.setAttribute('fill', fill);
    }
    if (fontSize) {
      text.setAttribute('font-size', fontSize);
    }
    if (fontFamily) {
      text.setAttribute('font-family', fontFamily);
    }
  });
  
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el, index) => {
    const originalEl = svgElement.querySelectorAll('*')[index];
    if (originalEl) {
      const computedStyle = window.getComputedStyle(originalEl);
      
      if (computedStyle.fill && computedStyle.fill.includes('rgb')) {
        el.setAttribute('fill', computedStyle.fill);
      }
      if (computedStyle.stroke && computedStyle.stroke.includes('rgb')) {
        el.setAttribute('stroke', computedStyle.stroke);
      }
    }
  });
  
  return clone;
}

export async function exportSvgToPng(svgElement: SVGSVGElement, filename: string) {
  const clonedSvg = cloneAndResolveStyles(svgElement);
  
  const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff';
  
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', backgroundColor);
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
  
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const svgSize = svgElement.getBoundingClientRect();
  const scale = 2;
  canvas.width = svgSize.width * scale;
  canvas.height = svgSize.height * scale;

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, svgSize.width, svgSize.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }
        resolve();
      }, 'image/png');
      
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };
    
    img.src = url;
  });
}

export function getChartFilename(prefix: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${prefix}_${timestamp}.png`;
}
