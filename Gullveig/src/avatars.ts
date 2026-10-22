import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const MAX_AVATAR_SIZE = 512 * 1024;

export class InvalidAvatar extends Error {}

export async function uploadAvatar(payload: unknown, storagePath: string): Promise<void> {
  if (!payload || typeof payload !== 'object' || !('userId' in payload) || !('avatar' in payload)) {
    throw new InvalidAvatar('Invalid upload data');
  }
  const { userId, avatar } = payload;
  const id = typeof userId === 'string' && /^\d+$/.test(userId) ? Number(userId) : userId;
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) {
    throw new InvalidAvatar('Invalid user ID');
  }
  if (typeof avatar !== 'string') {
    throw new InvalidAvatar('Invalid image format');
  }
  const match = /^data:image\/(jpeg|png|gif);base64,([A-Za-z0-9+/]+={0,2})$/.exec(avatar);
  if (!match) {
    throw new InvalidAvatar('Invalid file type or image data');
  }
  const contents = Buffer.from(match[2], 'base64');
  if (contents.length > MAX_AVATAR_SIZE) {
    throw new InvalidAvatar('Max file size is 512KB');
  }

  let image: Buffer;
  try {
    // GD used the first frame, cropped to a square and rendered transparency on black.
    const source = sharp(contents, { limitInputPixels: 16 * 1024 * 1024 });
    const metadata = await source.metadata();
    if (!['jpeg', 'png', 'gif'].includes(metadata.format ?? '')) {
      throw new InvalidAvatar('Invalid image format');
    }
    image = await source
      .resize(128, 128, { fit: 'cover', position: 'centre' })
      .flatten({ background: '#000000' })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    throw new InvalidAvatar('Invalid image format');
  }

  const directory = join(storagePath, 'files', 'avatars');
  await mkdir(directory, { recursive: true });
  // Readers always see a complete JPEG, including during concurrent uploads.
  const temporary = join(directory, `.user_${id}_${randomUUID()}.jpg`);
  try {
    await writeFile(temporary, image, { mode: 0o644 });
    await rename(temporary, join(directory, `user_${id}.jpg`));
  } finally {
    await rm(temporary, { force: true });
  }
}
