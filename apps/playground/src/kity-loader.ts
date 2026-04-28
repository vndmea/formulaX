import { mountKityEditor as mountRuntimeKityEditor, type KityEditorOptions } from '@formulax/kity-runtime';

export function mountKityEditor(container: HTMLElement, options: KityEditorOptions = {}) {
  return mountRuntimeKityEditor(container, {
    assetBase: '/kity',
    ...options,
  });
}
