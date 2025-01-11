import xss from 'xss';

export function sanitize(value: string = ''): string {
  return xss(value, {
    escapeHtml: (html: string) => {
      return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
  });
}
