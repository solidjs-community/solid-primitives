function makeDelay(ms?: number): Promise<boolean> {
  return new Promise(resolve => setTimeout(() => resolve(true), ms ?? 500));
}

export function sendEmailDefault(data: FormData) {
  return makeDelay().then(
    () => `Your email was sent to ${data.get("to") || "no one"} with your default provider`,
  );
}

export function sendEmailAlternative(data: FormData) {
  return makeDelay().then(
    () => `Your email was sent to ${data.get("to") || "no one"} with an alternative provider`,
  );
}
