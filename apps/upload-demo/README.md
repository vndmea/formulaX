# @formulaxjs/upload-demo

Local upload server for FormulaX image-mode development.

## Endpoints

- `GET /health`
- `POST /api/formula-image/upload`
- `GET /f/:filename`

## Run

```bash
pnpm dev:upload
```

Default address: `http://localhost:3109`

## Example request

```bash
curl -X POST http://localhost:3109/api/formula-image/upload ^
  -F "file=@./formula.png" ^
  -F "latex=\\frac{a}{b}"
```

Example response:

```json
{
  "ok": true,
  "url": "http://localhost:3109/f/48231.png",
  "location": "http://localhost:3109/f/48231.png",
  "filename": "48231.png"
}
```
