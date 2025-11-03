import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

function getR2Client() {
  const endpoint = process.env.R2_ENDPOINT || `https://${requiredEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
  const accessKeyId = requiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = requiredEnv('R2_SECRET_ACCESS_KEY');

  return new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function buildKey(originalName: string, folder?: string) {
  const now = Date.now().toString();
  const hash = createHash('sha256').update(originalName + now).digest('hex').slice(0, 16);
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const prefix = folder ? folder.replace(/\/+$/,'') + '/' : '';
  return `${prefix}${hash}_${safeName}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder')?.toString();

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    const bucket = requiredEnv('R2_BUCKET');
    const key = buildKey(file.name, folder);

    const client = getR2Client();

    const put = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await client.send(put);

    const publicBase = process.env.R2_PUBLIC_BASE_URL;
    if (!publicBase) {
      // If no public base configured, return the object key and bucket so caller can construct URL
      return NextResponse.json({
        message: 'Uploaded to R2',
        bucket,
        key,
        url: null,
      }, { status: 200 });
    }

    const url = `${publicBase.replace(/\/$/,'')}/${key}`;

    return NextResponse.json({ message: 'Uploaded to R2', url, key }, { status: 200 });
  } catch (err: any) {
    console.error('R2 upload error:', err);
    return NextResponse.json({ message: err?.message || 'Upload failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';