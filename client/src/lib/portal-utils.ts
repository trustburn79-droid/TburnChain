export function getPortalContainer(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  
  const radixRoot = document.getElementById('radix-portal-root');
  if (radixRoot) return radixRoot;
  
  if (document.body) return document.body;
  
  return null;
}

export function ensurePortalContainer(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('Document is not available');
  }
  
  let container = document.getElementById('radix-portal-root');
  if (container) return container;
  
  if (document.body) {
    container = document.createElement('div');
    container.id = 'radix-portal-root';
    document.body.appendChild(container);
    return container;
  }
  
  return document.documentElement;
}
