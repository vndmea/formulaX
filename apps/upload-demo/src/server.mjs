import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';

const app = express();
const port = Number(process.env.FORMULAX_UPLOAD_PORT ?? 3109);
const host = process.env.FORMULAX_UPLOAD_HOST ?? '127.0.0.1';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

const uploadDir = path.join(repoRoot, '.local-upload', 'formulas');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use('/f', express.static(uploadDir, {
  etag: true,
  fallthrough: false,
  maxAge: '1h',
}));

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, uploadDir);
  },
  filename(_req, file, callback) {
    const ext = resolveImageExtension(file);
    callback(null, createShortImageFilename(uploadDir, ext));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }

    callback(null, true);
  },
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: '@formulaxjs/upload-demo',
    uploadDir,
  });
});

app.post('/api/formula-image/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({
      error: 'Missing file. Expected multipart field name: file',
    });
    return;
  }

  const publicUrl = `http://localhost:${port}/f/${req.file.filename}`;

  res.json({
    url: publicUrl,
    location: publicUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
});

app.use((error, _req, res, _next) => {
  const statusCode = isPayloadTooLargeError(error) ? 413 : 500;
  res.status(statusCode).json({
    error: error instanceof Error ? error.message : String(error),
  });
});

app.listen(port, host, () => {
  console.log(`FormulaX upload demo listening on http://${host}:${port}`);
  console.log(`Upload endpoint: http://localhost:${port}/api/formula-image/upload`);
  console.log(`Static files:    http://localhost:${port}/f/`);
  console.log(`Saving files to: ${uploadDir}`);
});

function resolveImageExtension(file) {
  const originalExt = path.extname(file.originalname || '').toLowerCase();

  if (originalExt && /^[a-z0-9.]+$/i.test(originalExt)) {
    return originalExt;
  }

  switch (file.mimetype) {
    case 'image/png':
      return '.png';
    case 'image/jpeg':
      return '.jpg';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '.bin';
  }
}

function isPayloadTooLargeError(error) {
  return Boolean(error && typeof error === 'object' && error.code === 'LIMIT_FILE_SIZE');
}

function createShortImageFilename(directory, ext) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const id = crypto.randomInt(10000, 100000);
    const filename = `${id}${ext}`;
    if (!fs.existsSync(path.join(directory, filename))) {
      return filename;
    }
  }

  const fallbackId = `${Date.now()}-${crypto.randomInt(100, 1000)}`;
  return `${fallbackId}${ext}`;
}
