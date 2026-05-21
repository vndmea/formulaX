export const FORMULAX_DEFAULT_ICON_NAME = 'formulax-formula';

export const FORMULAX_DEFAULT_FORMULA_ICON_SVG = `
<svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <path d="M464.948 487.343l-192.44-243.819h195.183s68.708-5.487 93.451 30.133 32.988 90.41 32.988 90.41h24.744l-10.987-167.126H137.826v24.657l241.89 295.877-241.89 282.183v27.401h481.048l30.244-186.309-24.744-5.475s-8.244 41.096-41.231 79.447C550.155 753.087 420.947 747.6 420.947 747.6h-173.17l217.17-260.256z m316.789 25.41l-8.034-21.171c-5.87-14.955-9.06-23.05-9.578-24.262l-12.422-27.611c-8.812-19.776-17.266-29.688-25.387-29.688-12.273 0-21.938 11.457-29.008 34.335-5.19-1.891-7.786-4.647-7.786-8.269 0-10.654 6.217-22.877 18.601-36.634 12.434-13.768 23.582-20.64 33.42-20.64 19.294 0 39.267 27.698 60.006 83.106l5.29 13.657 5.97-9.53c36.782-58.151 67.768-87.233 92.97-87.233 6.562 0 14.25 1.89 23.062 5.673l-31.369 32.778c-4.152-1.2-7.094-1.805-8.824-1.805-18.985 0-41.652 21.778-67.904 65.308l-7.502 12.545 5.92 15.845c22.717 62.478 41.38 93.71 56.162 93.71 13.546 0 23.866-9.652 30.986-28.908 4.832 3.102 7.242 6.278 7.242 9.554 0 8.614-6.896 18.935-20.714 30.973-13.818 12.038-25.708 18.082-35.744 18.082-20.035 0-40.49-28.143-61.378-84.404l-7.255-19.12-7.503 13.188c-35.225 60.228-68.905 90.336-101.027 90.336-12.076 0-22.346-3.003-30.813-8.96l30.034-29.256c5.191 5.166 11.235 7.737 18.144 7.737 19.491 0 41.454-19.676 65.778-59.03l13.472-21.727 5.191-8.578z"/>
</svg>
`.trim();

export interface FormulaXIconOptions {
  /**
   * Developer-supplied SVG used by host editor toolbar buttons.
   * This is UI-only configuration and is never persisted into document content.
   */
  formulaIcon?: string;

  /**
   * Host editor icon registry name.
   */
  formulaIconName?: string;
}

export function normalizeFormulaXIconSvg(svg: string): string {
  return svg.trim();
}

export function resolveFormulaXFormulaIcon(options?: FormulaXIconOptions): string {
  const icon = options?.formulaIcon;
  return typeof icon === 'string' && icon.trim()
    ? normalizeFormulaXIconSvg(icon)
    : FORMULAX_DEFAULT_FORMULA_ICON_SVG;
}

export function resolveFormulaXFormulaIconName(options?: FormulaXIconOptions): string {
  const iconName = options?.formulaIconName;
  return typeof iconName === 'string' && iconName.trim()
    ? iconName.trim()
    : FORMULAX_DEFAULT_ICON_NAME;
}
