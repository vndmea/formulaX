// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { readSvgDisplayMetrics, svgMarkupToPngBlob } from '../src';

const { canvgMock } = vi.hoisted(() => ({
  canvgMock: vi.fn(),
}));

vi.mock('../../kity-runtime/src/vendor/kity-formula/canvg-runtime', () => ({
  createCanvgRuntime: () => canvgMock,
}));

describe('renderer-image svg metrics', () => {
  const OriginalImage = globalThis.Image;
  const OriginalCreateObjectURL = globalThis.URL.createObjectURL;
  const OriginalRevokeObjectURL = globalThis.URL.revokeObjectURL;
  const OriginalFetch = globalThis.fetch;

  it('reads width and height attributes', () => {
    expect(readSvgDisplayMetrics('<svg width="24" height="40.5"></svg>')).toEqual({
      width: 24,
      height: 40.5,
      displayStyle: undefined,
    });
  });

  it('reads width and height from viewBox', () => {
    expect(readSvgDisplayMetrics('<svg viewBox="0 0 24 40.5" style="font-size:inherit;width:0.75em;height:1.25em"></svg>')).toEqual({
      width: 24,
      height: 40.5,
      displayStyle: 'width:0.75em; height:1.25em',
    });
  });

  it('throws when no svg size is available', () => {
    expect(() => readSvgDisplayMetrics('<svg></svg>')).toThrow('Unable to determine formula SVG size.');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    canvgMock.mockReset();
    document.head.innerHTML = '';
    globalThis.Image = OriginalImage;
    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: OriginalCreateObjectURL,
    });
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: OriginalRevokeObjectURL,
    });
    globalThis.fetch = OriginalFetch;
  });

  it('embeds matching font-face rules before rasterizing svg', async () => {
    document.head.innerHTML = '<base href="https://example.com/assets/">';

    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: "KF Main";
        src: url("./fonts/kf-main.woff2") format("woff2");
      }
    `;
    document.head.appendChild(style);
    globalThis.fetch = vi.fn(async () => new Response('font-bytes', {
      status: 200,
      headers: {
        'content-type': 'font/woff2',
      },
    })) as typeof fetch;

    let capturedSvgBlob: Blob | undefined;
    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn((obj: Blob | MediaSource) => {
        if (obj instanceof Blob) {
          capturedSvgBlob = obj;
        }
        return 'blob:test-formula';
      }),
    });
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    class MockImage {
      decoding = 'async';
      src = '';

      decode(): Promise<void> {
        return Promise.resolve();
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['png']));
    });

    await svgMarkupToPngBlob(`
      <svg width="24" height="40" style="width:0.75em;height:1.25em">
        <text font-family="KF Main">x</text>
      </svg>
    `);

    const normalizedSvg = capturedSvgBlob ? await readBlobText(capturedSvgBlob) : undefined;
    expect(normalizedSvg).toContain('@font-face');
    expect(normalizedSvg).toContain('font-family: "KF Main"');
    expect(normalizedSvg).toContain('data:font/woff2;base64,Zm9udC1ieXRlcw==');
    expect(canvgMock).toHaveBeenCalledOnce();
    expect(canvgMock).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), expect.stringContaining('data:font/woff2;base64,Zm9udC1ieXRlcw=='), expect.objectContaining({
      ignoreAnimation: true,
      ignoreMouse: true,
      ignoreDimensions: true,
      ignoreClear: true,
    }));
  });
});

function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob text.'));
    reader.readAsText(blob);
  });
}
