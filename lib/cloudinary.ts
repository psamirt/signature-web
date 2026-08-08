'use client';

/**
 * Sube un archivo directo del navegador a Cloudinary (unsigned upload) — la
 * API nunca ve el archivo, solo la URL resultante que se manda al backend.
 * Requiere NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/UPLOAD_PRESET en .env.local.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Falta configurar Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / UPLOAD_PRESET en .env.local).',
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`No se pudo subir la imagen a Cloudinary (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error('Cloudinary no devolvió una URL para la imagen.');
  }
  return data.secure_url;
}
