export const editorStyles = `
@keyframes fx-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.fx-editor {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
  padding: 20px;
  font-family: 'Times New Roman', serif;
  font-size: 24px;
  line-height: 1.6;
  min-height: 80px;
  position: relative;
}
.fx-editor:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}
.fx-editor-surface {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px;
  cursor: text;
}
.fx-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.1s;
}
.fx-node:hover {
  background: rgba(59, 130, 246, 0.08);
}
.fx-text {
  color: #1e293b;
}
.fx-group {
  background: rgba(148, 163, 184, 0.1);
  border: 1px dashed #94a3b8;
}
.fx-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  padding: 0 6px;
}
.fx-frac-num, .fx-frac-den {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 4px 8px;
  min-width: 24px;
  min-height: 28px;
  border-radius: 6px;
  transition: all 0.15s;
}
.fx-frac-num {
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 6px;
}
.fx-frac-den {
  border-top: 2px solid #3b82f6;
  padding-top: 6px;
}
.fx-frac-num:hover, .fx-frac-den:hover {
  background: rgba(59, 130, 246, 0.08);
}
.fx-frac-num.is-active, .fx-frac-den.is-active {
  background: rgba(59, 130, 246, 0.12);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
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
  margin-left: 1px;
}
.fx-sup, .fx-sub {
  display: flex;
  align-items: center;
  min-width: 16px;
  min-height: 20px;
  padding: 0 4px;
  border-radius: 4px;
  transition: all 0.15s;
}
.fx-sup {
  vertical-align: super;
}
.fx-sub {
  vertical-align: sub;
}
.fx-sup:hover, .fx-sub:hover {
  background: rgba(59, 130, 246, 0.08);
}
.fx-sup.is-active, .fx-sub.is-active {
  background: rgba(59, 130, 246, 0.12);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}
.fx-sqrt {
  display: inline-flex;
  align-items: baseline;
}
.fx-sqrt-symbol {
  font-size: 1.1em;
  color: #3b82f6;
  margin-right: 2px;
}
.fx-sqrt-body {
  display: inline-flex;
  align-items: center;
  border-top: 2px solid #3b82f6;
  padding: 4px 6px 0;
  margin-left: 2px;
}
.fx-sqrt-body:hover {
  background: rgba(59, 130, 246, 0.08);
}
.fx-sqrt-body.is-active {
  background: rgba(59, 130, 246, 0.12);
}
.fx-fenced {
  display: inline-flex;
  align-items: center;
  background: rgba(148, 163, 184, 0.08);
  border-radius: 8px;
  padding: 0 4px;
}
.fx-fence {
  color: #64748b;
  font-size: 1.2em;
  padding: 0 2px;
}
.fx-fenced-body {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
}
.fx-fenced-body:hover {
  background: rgba(59, 130, 246, 0.08);
  border-radius: 4px;
}
.fx-fenced-body.is-active {
  background: rgba(59, 130, 246, 0.12);
  border-radius: 4px;
}
.fx-slot {
  width: 3px;
  height: 1.2em;
  border: none;
  background: #3b82f6;
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
  background: #60a5fa;
}
`;