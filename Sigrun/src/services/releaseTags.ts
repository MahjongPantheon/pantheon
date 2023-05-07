export function handleReleaseTag(r: Response) {
  const release = r.headers.get('X-Release');
  const tag = window.localStorage.getItem('__releaseTag');
  if (release && !tag) {
    window.localStorage.setItem('__releaseTag', release);
  }
  if (release && tag && release !== tag) {
    window.localStorage.setItem('__releaseTag', release);
    window.location.reload();
  }
  return r;
}
