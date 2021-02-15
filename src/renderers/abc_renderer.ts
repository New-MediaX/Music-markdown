import abc from "abcjs";

const MARGIN_RIGHT = 2;

export function callback(str: string, opts: MmdOptions): string {
  const div = document.createElement("div");
  abc.renderAbc(div, str, {
    visualTranspose: opts.transpose,
    staffwidth: opts.maxWidth - MARGIN_RIGHT,
    paddingtop: 0,
    paddingbottom: 0,
    paddingright: 0,
    paddingleft: 0,
    wrap: { minSpacing: 1.8, maxSpacing: 2.7 },
  });
  return div.outerHTML;
}

export const lang = "abc";