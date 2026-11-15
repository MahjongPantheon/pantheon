import { env } from '../env';

export async function handleRpcResponse(response: Response, url: string): Promise<Response> {
  if (response.ok) return response;

  let error;
  try {
    // Twirp still needs to read the original response to decode its error.
    error = await response.clone().json();
  } catch {
    // Let Twirp report non-JSON proxy errors using the original response body.
    return response;
  }
  if (error?.code === 'internal' && error.meta?.cause) {
    void fetch(env.urls.hugin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'Sigrun [twirp]',
        error: `From: ${typeof window !== 'undefined' && window.location.href} | To: ${url} | Details: ${error.meta.cause}`,
      }),
    });
    throw new Error(error.meta.cause);
  }
  return response;
}
