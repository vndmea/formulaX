const FORMULAX_BASE_STYLE_ID = 'fx-formulax-base-styles';

export const formulaXBaseStyles = `
.formulax-math {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  line-height: 1;
  padding: 0 2px;
  margin: 0 1px;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  user-select: none;
}

.formulax-math:hover {
  outline: 1px solid rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.06);
}

.formulax-math__render,
.formulax-math__svg,
.formulax-math__image {
  display: inline-block;
  max-width: 100%;
  pointer-events: none;
}

.formulax-math__render {
  vertical-align: middle;
  font-family: "KF AMS MAIN", "Cambria Math", "Latin Modern Math", "Times New Roman", serif;
}

.formulax-math__svg {
  flex: 0 0 auto;
  vertical-align: -0.35em;
}

.formulax-math__image {
  height: auto;
  vertical-align: middle;
}
`;

export function ensureFormulaXBaseStyles(doc: Document = document): void {
  if (doc.getElementById(FORMULAX_BASE_STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = FORMULAX_BASE_STYLE_ID;
  style.textContent = formulaXBaseStyles;
  doc.head.appendChild(style);
}
