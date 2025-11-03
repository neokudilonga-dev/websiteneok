import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ENDPOINT = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);
const R2_BUCKET = process.env.R2_BUCKET;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL;

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : url + "/";
}

function isR2Url(imageUrl: string): boolean {
  if (!imageUrl) return false;
  try {
    if (R2_PUBLIC_BASE_URL && imageUrl.startsWith(ensureTrailingSlash(R2_PUBLIC_BASE_URL))) {
      return true;
    }
    const u = new URL(imageUrl);
    if (u.hostname.includes("r2.cloudflarestorage.com")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function extractKeyFromUrl(imageUrl: string): string | null {
  try {
    if (R2_PUBLIC_BASE_URL && imageUrl.startsWith(ensureTrailingSlash(R2_PUBLIC_BASE_URL))) {
      const prefix = ensureTrailingSlash(R2_PUBLIC_BASE_URL);
      return imageUrl.slice(prefix.length).replace(/^\/+/, "");
    }
    const u = new URL(imageUrl);
    if (u.hostname.includes("r2.cloudflarestorage.com")) {
      // Expected path: /<bucket>/<key>
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        // parts[0] is bucket, parts[1..] is key
        return parts.slice(1).join("/");
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  try {
    if (!isR2Url(imageUrl)) return;

    const key = extractKeyFromUrl(imageUrl);
    if (!key) return;

    if (!R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      console.warn("R2 deletion skipped: missing R2 envs");
      return;
    }

    const client = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
  } catch (err) {
    console.warn("Failed to delete R2 object", err);
  }
}