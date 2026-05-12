export type TiptapDemoVersion = '2' | '3';

export const TIPTAP_VERSION_OPTIONS: Array<{
  label: string;
  value: TiptapDemoVersion;
  coreUrl: string;
  starterKitUrl: string;
}> = [
  {
    label: 'Tiptap v2',
    value: '2',
    coreUrl: 'https://esm.sh/@tiptap/core@^2.27.2?target=es2022',
    starterKitUrl: 'https://esm.sh/@tiptap/starter-kit@2.27.2?target=es2022',
  },
  {
    label: 'Tiptap v3',
    value: '3',
    coreUrl: 'https://esm.sh/@tiptap/core@^3.23.1?target=es2022',
    starterKitUrl: 'https://esm.sh/@tiptap/starter-kit@3.23.1?target=es2022',
  },
];

export interface LoadedTiptapRuntime {
  Editor: new (options: Record<string, unknown>) => any;
  Node: {
    create: (...args: any[]) => any;
  };
  StarterKit: any;
}

function resolveStarterKit(module: Record<string, unknown>): unknown {
  return module.default ?? module.StarterKit;
}

export async function loadTiptapRuntime(version: TiptapDemoVersion): Promise<LoadedTiptapRuntime> {
  const selected = TIPTAP_VERSION_OPTIONS.find((item) => item.value === version);

  if (!selected) {
    throw new Error(`Unsupported Tiptap version: ${version}`);
  }

  const [coreModule, starterKitModule] = await Promise.all([
    import(/* @vite-ignore */ selected.coreUrl),
    import(/* @vite-ignore */ selected.starterKitUrl),
  ]);

  const StarterKit = resolveStarterKit(starterKitModule);

  if (!coreModule.Editor || !coreModule.Node || !StarterKit) {
    throw new Error(`Failed to resolve the Tiptap runtime for v${version}.`);
  }

  return {
    Editor: coreModule.Editor,
    Node: coreModule.Node,
    StarterKit,
  };
}
