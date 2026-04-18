export const editorStyles = `
.fx-editor {
  border: 1px solid #d1d5db;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  padding: 16px;
  font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
}
.fx-editor-surface {
  min-height: 64px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: #0f172a;
}
.fx-node {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
}
.fx-frac,
.fx-sqrt,
.fx-fenced,
.fx-supsub {
  background: rgba(226, 232, 240, 0.55);
}
.fx-frac {
  flex-direction: column;
  min-width: 40px;
}
.fx-frac-line {
  width: 100%;
  border-top: 2px solid #0f172a;
}
.fx-supsub-stack {
  display: inline-flex;
  flex-direction: column;
  font-size: 0.75em;
}
.fx-sqrt-symbol {
  font-size: 1.25em;
}
.fx-slot {
  width: 10px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  cursor: text;
}
.fx-slot.is-active {
  background: #2563eb;
}
`;
