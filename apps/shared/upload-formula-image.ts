export interface DemoFormulaImageUploadContext {
  blob: Blob;
  filename: string;
  latex: string;
}

export async function uploadFormulaImageForDemo(
  input: DemoFormulaImageUploadContext,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', input.blob, input.filename);
  formData.append('latex', input.latex);

  const response = await fetch('http://localhost:3109/api/formula-image/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Local upload demo failed with status ${response.status}.`);
  }

  const payload = await response.json() as {
    url?: string;
    location?: string;
  };
  const url = payload.url?.trim() || payload.location?.trim();
  if (!url) {
    throw new Error('Local upload demo returned an empty URL.');
  }

  return { url };
}
