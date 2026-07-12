import type { RuntimeToolbarPanel } from './toolbar';

export type RuntimeToolbarPanelsResolver =
  | RuntimeToolbarPanel[]
  | ((defaults: RuntimeToolbarPanel[]) => RuntimeToolbarPanel[]);

export type RuntimeExtension = {
  id: string;
  toolbarPanels?: RuntimeToolbarPanelsResolver;
};

export function createRuntimeExtension(extension: RuntimeExtension): RuntimeExtension {
  return extension;
}

export function resolveRuntimeToolbarPanels(
  defaults: RuntimeToolbarPanel[],
  extensions: RuntimeExtension[] = [],
): RuntimeToolbarPanel[] {
  return extensions.reduce((panels, extension) => {
    if (!extension.toolbarPanels) {
      return panels;
    }
    if (typeof extension.toolbarPanels === 'function') {
      return extension.toolbarPanels(panels);
    }
    return [...panels, ...extension.toolbarPanels];
  }, defaults);
}
