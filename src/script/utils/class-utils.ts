export function getWrap<T>(promise: Promise<T>, fallback?: T) {
  return (async () => {
    try {
      return await promise;
    } catch (e) {
      console.error(e);
      return fallback;
    }
  })();
}
