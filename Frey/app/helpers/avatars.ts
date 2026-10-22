type AvatarSettings = {
  GULLVEIG_URL_INTERNAL?: string;
  GULLVEIG_URL?: string;
};

export function getGullveigUrl(
  settings: AvatarSettings,
  environment: Record<string, string | undefined> = process.env
) {
  return (
    environment.GULLVEIG_URL_INTERNAL ??
    settings.GULLVEIG_URL_INTERNAL ??
    environment.GULLVEIG_URL ??
    settings.GULLVEIG_URL ??
    'http://gullveig.pantheon.internal'
  );
}

export async function uploadAvatar(url: string, personId: number, avatarData: string) {
  // An ordinary profile edit keeps the previously uploaded file.
  if (!avatarData) return;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: personId, avatar: avatarData }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Avatar upload failed');
  const result = (await response.json()) as { ok?: boolean } | null;
  if (result?.ok !== true) throw new Error('Avatar upload failed');
}
