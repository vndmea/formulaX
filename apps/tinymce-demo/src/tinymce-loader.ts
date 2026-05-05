export type TinyMceDemoVersion = '5' | '6' | '7' | '8';

export const TINYMCE_VERSION_OPTIONS: Array<{
  label: string;
  value: TinyMceDemoVersion;
  url: string;
}> = [
  {
    label: 'TinyMCE 5',
    value: '5',
    url: 'https://cdn.jsdelivr.net/npm/tinymce@5/tinymce.min.js',
  },
  {
    label: 'TinyMCE 6',
    value: '6',
    url: 'https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js',
  },
  {
    label: 'TinyMCE 7',
    value: '7',
    url: 'https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js',
  },
  {
    label: 'TinyMCE 8',
    value: '8',
    url: 'https://cdn.jsdelivr.net/npm/tinymce@8/tinymce.min.js',
  },
];

declare global {
  interface Window {
    tinymce?: any;
  }
}

const SCRIPT_ID = 'tinymce-runtime-script';

export async function loadTinyMceRuntime(version: TinyMceDemoVersion): Promise<any> {
  const selected = TINYMCE_VERSION_OPTIONS.find((item) => item.value === version);
  if (!selected) throw new Error(`Unsupported TinyMCE version: ${version}`);

  await removeTinyMceRuntime();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = selected.url;
    script.referrerPolicy = 'no-referrer';
    script.onload = () => {
      if (!window.tinymce) {
        reject(new Error('TinyMCE global not found after script load.'));
        return;
      }
      resolve(window.tinymce);
    };
    script.onerror = () => reject(new Error(`Failed to load TinyMCE from ${selected.url}`));
    document.head.appendChild(script);
  });
}

export async function removeTinyMceRuntime(): Promise<void> {
  if (window.tinymce?.remove) {
    try {
      window.tinymce.remove();
    } catch {
      // Ignore demo cleanup failures.
    }
  }

  document.getElementById(SCRIPT_ID)?.remove();
  delete window.tinymce;
}
