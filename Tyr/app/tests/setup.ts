// JSDOM does not implement these platform APIs. These state-only stubs support
// component lifecycle tests; touch interactions are tested in mobile Chromium.
if (typeof HTMLDialogElement !== 'undefined') {
  Object.defineProperties(HTMLDialogElement.prototype, {
    show: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = true;
      }),
    },
    showModal: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = true;
      }),
    },
    close: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = false;
      }),
    },
  });
}
