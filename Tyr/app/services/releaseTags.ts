export function handleReleaseTag(tag: string | null) {
  return (r: Response) => {
    const release = r.headers.get('X-Release');
    if (release && !tag) {
      window.localStorage.setItem('__releaseTag', release);
    }
    if (release && tag && release !== tag) {
      window.localStorage.setItem('__releaseTag', release);
      window.location.reload();
    }
    return r;
  };
}

export function getReleaseTag() {
  return window.localStorage.getItem('__releaseTag');
}
