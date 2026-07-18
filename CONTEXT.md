# FormulaX

FormulaX is a formula editing toolkit. This glossary names the user-facing concepts involved in editor startup, toolbar rendering, and formula preview behavior.

## Language

**Formula Surface**:
The editable area where the current formula is shown and manipulated.
_Avoid_: Canvas, editor body

**Runtime Toolbar**:
The standard FormulaX toolbar shown with the Formula Surface for inserting common formula structures and symbols.
_Avoid_: Popup toolbar, standard bar

**Toolbar Preview**:
A rendered formula sample inside the Runtime Toolbar, used for buttons, symbol items, and template items.
_Avoid_: Icon, thumbnail

**Critical Preview**:
A Toolbar Preview that is visible immediately or very likely to be shown on the first interaction, such as top-level toolbar controls and the current symbol strip.
_Avoid_: First-screen icon, eager preview

