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

export async function waitForDocumentFonts(doc: Document): Promise<void> {
  if (!doc.fonts?.ready) return;

  try {
    await doc.fonts.ready;
  } catch {
    // Ignore font readiness failures and fall back to frame-based settling.
  }
}

export function waitForAnimationFrame(view: Window): Promise<void> {
  return new Promise((resolve) => {
    view.requestAnimationFrame(() => resolve());
  });
}
