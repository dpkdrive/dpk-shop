import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Image upload is not configured on the server.' }, { status: 503 });
    }

    const data = await request.formData();
    const file = data.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image file to upload.' }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Upload a JPEG, PNG, WebP, or AVIF image.' }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image must be 4 MB or smaller.' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'dpk-shop/products';
    const signature = crypto
      .createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');
    const uploadData = new FormData();
    uploadData.append('file', file, file.name);
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp);
    uploadData.append('folder', folder);
    uploadData.append('signature', signature);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: 'POST',
      body: uploadData,
      cache: 'no-store',
    });
    const uploadResult = await uploadResponse.json();
    if (!uploadResponse.ok || !uploadResult.secure_url) {
      console.error('Cloudinary product image upload failed:', uploadResult.error?.message || uploadResponse.status);
      return NextResponse.json({ error: 'Cloudinary could not upload this image. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error('Product image upload failed:', error.message);
    return NextResponse.json({ error: 'Unable to upload the product image. Please try again.' }, { status: 500 });
  }
}
