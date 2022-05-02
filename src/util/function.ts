export function execIfNotRunning<T>(fn: () => Promise<T>): () => Promise<T> {
  let result!: T;
  let running = false;

  return async function () {
    if (running) return result;
    try {
      running = true;
      result = await fn();
      return result;
    } finally {
      running = false;
    }
  };
}
