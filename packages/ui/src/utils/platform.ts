function testPlatform(re: RegExp) {
  if (typeof window !== "undefined" && window.navigator != null) {
    // eslint-disable-next-line
    //@ts-ignore
    return re.test((window.navigator["userAgentData"] || window.navigator).platform);
  }

  return false;
}

export function isMac() {
  return testPlatform(/^Mac/i);
}
