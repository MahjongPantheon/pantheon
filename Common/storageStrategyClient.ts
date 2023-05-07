import { StorageStrategy } from "./storage";
const endsWith = (haystack: string, needle: string) =>
  haystack.indexOf(needle, haystack.length - needle.length) !== -1;

export class StorageImplClient implements StorageStrategy {
  constructor(private readonly cookieDomain: string | null) {
    if (
      this.cookieDomain &&
      !endsWith(window.location.hostname, this.cookieDomain)
    ) {
      console.error(
        "Cookie domain does not match current location - saving cookies is not possible. Please check your environment settings."
      );
    }
  }

  public get(key: string, type: "int" | "string"): any | null {
    const result = new RegExp(
      "(?:^|; )" + encodeURIComponent(key) + "=([^;]*)"
    ).exec(document.cookie);

    try {
      return result
        ? type === "int"
          ? parseInt(result[1], 10)
          : result[1].toString()
        : null;
    } catch (e) {
      return null;
    }
  }

  public set(key: string, type: "int" | "string", value: any): void {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    const expires = ";expires=" + date.toUTCString();
    const domain = this.cookieDomain ? ";domain=" + this.cookieDomain : "";
    document.cookie = `${key}=${value}${expires}${domain}; path=/`;
  }

  public delete(key: string): void {
    const date = new Date();
    date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000); // time in past
    const expires = ";expires=" + date.toUTCString();
    const domain = this.cookieDomain ? ";domain=" + this.cookieDomain : "";
    document.cookie = key + "=" + expires + domain + "; path=/";
  }

  public clear(): void {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      [
        window.location.hostname,
        "." + window.location.hostname.split(".").slice(1).join("."),
      ].forEach((domain) => {
        document.cookie =
          encodeURIComponent(cookie.split(";")[0].split("=")[0]) +
          "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=" +
          domain +
          " ;path=/";
      });
    }
  }
}
