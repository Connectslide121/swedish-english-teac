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
  
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el, index) => {
    const originalEl = svgElement.querySelectorAll('*')[index];
    if (!originalEl) return;
    
    const computedStyle = window.getComputedStyle(originalEl);
    
    if (computedStyle.fill && computedStyle.fill !== 'none') {
      el.setAttribute('fill', computedStyle.fill);
    }
    
    if (computedStyle.stroke && computedStyle.stroke !== 'none') {
      el.setAttribute('stroke', computedStyle.stroke);
    }
    
    if (computedStyle.strokeWidth) {
      el.setAttribute('stroke-width', computedStyle.strokeWidth);
    }
    
    if (computedStyle.strokeDasharray && computedStyle.strokeDasharray !== 'none') {
      el.setAttribute('stroke-dasharray', computedStyle.strokeDasharray);
    }
    
    if (el.tagName === 'text' || el.tagName.toLowerCase() === 'text') {
      const fontSize = computedStyle.fontSize;
      const fontFamily = computedStyle.fontFamily;
      const fontWeight = computedStyle.fontWeight;
      const textAnchor = computedStyle.textAnchor || (originalEl as SVGTextElement).style.textAnchor;
      
      if (fontSize) {
        el.setAttribute('font-size', fontSize);
      }
      if (fontFamily) {
        el.setAttribute('font-family', fontFamily);
      }
      if (fontWeight && fontWeight !== '400') {
        el.setAttribute('font-weight', fontWeight);
      }
      if (textAnchor) {
        el.setAttribute('text-anchor', textAnchor);
      }
    }
    
    if ((el.tagName === 'rect' || el.tagName.toLowerCase() === 'rect') && el.hasAttribute('rx')) {
      const rx = el.getAttribute('rx');
      if (rx) {
        el.setAttribute('rx', rx);
      }
    }
    
    const opacity = computedStyle.opacity;
    if (opacity && opacity !== '1') {
      el.setAttribute('opacity', opacity);
    }
    
    if (el.tagName === 'line' || el.tagName.toLowerCase() === 'line') {
      if (computedStyle.strokeWidth) {
        el.setAttribute('stroke-width', computedStyle.strokeWidth);
      }
    }
    
    if (el.tagName === 'path' || el.tagName.toLowerCase() === 'path') {
      if (!el.getAttribute('fill')) {
        el.setAttribute('fill', 'none');
      }
    }
    
    if (el.hasAttribute('transform')) {
      const transform = el.getAttribute('transform');
      if (transform) {
        el.setAttribute('transform', transform);
      }
    }
  });
  
  return clone;
}

export async function exportSvgToPng(svgElement: SVGSVGElement, filename: string) {
  const clonedSvg = cloneAndResolveStyles(svgElement);
  
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
  const backgroundColor = bgColor ? `oklch(${bgColor})` : '#ffffff';
  const resolvedBgColor = getComputedStyle(document.body).backgroundColor;
  
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', resolvedBgColor || '#ffffff');
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
