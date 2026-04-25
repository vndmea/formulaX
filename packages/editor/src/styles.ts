export const editorStyles = `
@keyframes fx-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.fx-editor {
  border: 1px solid #d8d4c7;
  border-radius: 2px;
  background: #fffefb;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  padding: 24px 28px;
  font-family: Cambria, 'Times New Roman', serif;
  font-size: 25px;
  line-height: 1.7;
  min-height: 120px;
  position: relative;
}
.fx-editor:focus-within {
  border-color: #7bbb59;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7), 0 0 0 3px rgba(123, 187, 89, 0.18);
}
.fx-editor-surface {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 3px;
  cursor: text;
}
.fx-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 2px 3px;
  border-radius: 2px;
  transition: background 0.12s ease;
}
.fx-node:hover {
  background: rgba(122, 186, 89, 0.12);
}
.fx-text {
  color: #2b2925;
}
.fx-group {
  background: rgba(243, 241, 230, 0.82);
  border: 1px dashed #c8c0a8;
}
.fx-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  padding: 0 5px;
}
.fx-frac-num, .fx-frac-den {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  min-width: 24px;
  min-height: 28px;
  border-radius: 2px;
  transition: all 0.15s ease;
}
.fx-frac-num {
  border-bottom: 2px solid #2e2c29;
  padding-bottom: 6px;
}
.fx-frac-den {
  border-top: 2px solid #2e2c29;
  padding-top: 6px;
}
.fx-frac-num:hover, .fx-frac-den:hover {
  background: rgba(122, 186, 89, 0.1);
}
.fx-frac-num.is-active, .fx-frac-den.is-active {
  background: rgba(122, 186, 89, 0.16);
  box-shadow: inset 0 0 0 1px rgba(83, 184, 86, 0.5);
}
.fx-supsub {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
}
.fx-supsub-base {
  display: inline-flex;
  align-items: center;
  padding: 0 2px;
}
.fx-supsub-stack {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.65em;
  margin-left: 2px;
}
.fx-sup, .fx-sub {
  display: flex;
  align-items: center;
  min-width: 16px;
  min-height: 20px;
  padding: 0 4px;
  border-radius: 2px;
  transition: all 0.15s ease;
}
.fx-sup {
  vertical-align: super;
}
.fx-sub {
  vertical-align: sub;
}
.fx-sup:hover, .fx-sub:hover {
  background: rgba(122, 186, 89, 0.1);
}
.fx-sup.is-active, .fx-sub.is-active {
  background: rgba(122, 186, 89, 0.16);
  box-shadow: inset 0 0 0 1px rgba(83, 184, 86, 0.5);
}
.fx-sqrt {
  display: inline-flex;
  align-items: baseline;
}
.fx-sqrt-symbol {
  font-size: 1.1em;
  color: #2e2c29;
  margin-right: 2px;
}
.fx-sqrt-body {
  display: inline-flex;
  align-items: center;
  border-top: 2px solid #2e2c29;
  padding: 4px 6px 0;
  margin-left: 2px;
}
.fx-sqrt-body:hover {
  background: rgba(122, 186, 89, 0.1);
}
.fx-sqrt-body.is-active {
  background: rgba(122, 186, 89, 0.16);
}
.fx-fenced {
  display: inline-flex;
  align-items: center;
  background: rgba(243, 241, 230, 0.78);
  border-radius: 3px;
  padding: 0 4px;
}
.fx-fence {
  color: #59554d;
  font-size: 1.2em;
  padding: 0 2px;
}
.fx-fenced-body {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
}
.fx-fenced-body:hover {
  background: rgba(122, 186, 89, 0.1);
  border-radius: 2px;
}
.fx-fenced-body.is-active {
  background: rgba(122, 186, 89, 0.16);
  border-radius: 2px;
}
.fx-slot {
  width: 3px;
  height: 1.2em;
  border: none;
  background: #53b856;
  padding: 0;
  margin: 0 1px;
  cursor: text;
  border-radius: 1px;
  vertical-align: middle;
}
.fx-slot.is-active {
  animation: fx-blink 1s infinite;
}
.fx-slot:hover {
  background: #77c75b;
}
`;
