// Polyfill navigator.clipboard for non-secure contexts (HTTP on non-localhost).
// The Clipboard API is restricted to secure contexts (HTTPS / localhost), so
// accessing the dev server via http://hostname will break copy buttons.
// This falls back to the legacy execCommand approach.
if (typeof navigator !== 'undefined' && !navigator.clipboard) {
  navigator.clipboard = {
    writeText(text) {
      return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          const ok = document.execCommand('copy');
          ok ? resolve() : reject(new Error('execCommand copy failed'));
        } catch (err) {
          reject(err);
        } finally {
          document.body.removeChild(textarea);
        }
      });
    },
    readText() {
      return Promise.reject(new Error('clipboard.readText not supported in polyfill'));
    },
  };
}
