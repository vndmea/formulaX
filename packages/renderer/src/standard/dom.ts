export function createHiddenRenderHost(doc: Document = document): HTMLElement {
  const host = doc.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.width = '1px';
  host.style.height = '1px';
  host.style.opacity = '0';
  host.style.pointerEvents = 'none';
  host.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(host);
  return host;
}
