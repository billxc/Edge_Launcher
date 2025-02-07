// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function autolog(...params: any[]) {
  // if host is localhost or 127.0.0.1
  // or has debug localstorage key
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    || localStorage.getItem('debug') === 'true') {
    console.log(...params);
  }
}