type Procedure = (...args: any[]) => void;

export function throttle<F extends Procedure>(func: F, delay: number): F {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      func.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func.apply(this, args);
      }, remaining);
    }
  } as F;

  return throttled;
}
