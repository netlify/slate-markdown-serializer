// to ensure markdown compatability we need to specifically encode some characters
export function encode(href: string) {
  return href
    .trim()
    .replace(/ /g, "%20")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

export function decode(href: string) {
  return decodeURI(href);
}
