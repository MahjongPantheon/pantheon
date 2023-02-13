export function clearStorages() {
  // Cookies
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    [
      window.location.hostname,
      '.' + window.location.hostname.split('.').slice(1).join('.'),
    ].forEach((domain) => {
      document.cookie =
        encodeURIComponent(cookie.split(';')[0].split('=')[0]) +
        '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' +
        domain +
        ' ;path=/';
    });
  }

  // Localstorage
  window.localStorage.clear();
}
