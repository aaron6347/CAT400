export default function getCookie(cookie, prefix) {
  let cookieArray = cookie.split(';');
  for(let i = 0; i < cookieArray.length; i++) {
    let c = cookieArray[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(prefix) == 0) {
      return c.substring(prefix.length, c.length);
    }
  }
  return "";
}