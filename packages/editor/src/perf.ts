import { ensureKityRuntime } from '@formulaxjs/kity-runtime';

type FormulaXPerfState = {
  reportedMeasureCount: number;
  reportScheduled: boolean;
};

type FormulaXPerfHost = typeof globalThis & {
  __FORMULAX_PERF__?: boolean;
  __FORMULAX_PERF_STATE__?: FormulaXPerfState;
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export type FormulaXEditorPreloadMode = 'idle' | 'hover' | false;

function getPerfHost(): FormulaXPerfHost {
  return globalThis as FormulaXPerfHost;
}

function getPerfState(): FormulaXPerfState {
  const host = getPerfHost();

  host.__FORMULAX_PERF_STATE__ ??= {
    reportedMeasureCount: 0,
    reportScheduled: false,
  };

  return host.__FORMULAX_PERF_STATE__;
}

function hasPerfSupport(): boolean {
  return typeof performance !== 'undefined'
    && typeof performance.mark === 'function'
    && typeof performance.measure === 'function'
    && typeof performance.getEntriesByType === 'function';
}

function isPerfDebugEnabled(): boolean {
  return getPerfHost().__FORMULAX_PERF__ === true;
}

function schedulePerfReport(): void {
  if (!hasPerfSupport() || !isPerfDebugEnabled()) {
    return;
  }

  const state = getPerfState();
  if (state.reportScheduled) {
    return;
  }

  state.reportScheduled = true;

  queueMicrotask(() => {
    state.reportScheduled = false;

    const entries = performance
      .getEntriesByType('measure')
      .filter((entry): entry is PerformanceMeasure => entry.name.startsWith('fx:'))
      .sort((left, right) => left.startTime - right.startTime);

    const nextEntries = entries.slice(state.reportedMeasureCount);
    state.reportedMeasureCount = entries.length;

    if (!nextEntries.length) {
      return;
    }

    console.table(nextEntries.map((entry) => ({
      name: entry.name,
      duration: Number(entry.duration.toFixed(2)),
      startTime: Number(entry.startTime.toFixed(2)),
    })));
  });
}

export function markFormulaXPerf(name: string): string | null {
  if (!hasPerfSupport()) {
    return null;
  }

  const markName = `${name}::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;
  performance.mark(markName);
  return markName;
}

export function measureFormulaXPerf(
  name: string,
  startMark: string | null,
  endMark?: string | null,
): string | null {
  if (!hasPerfSupport() || !startMark) {
    return null;
  }

  const resolvedEndMark = endMark ?? markFormulaXPerf(`${name}:end`);
  if (!resolvedEndMark) {
    return null;
  }

  performance.measure(name, startMark, resolvedEndMark);
  schedulePerfReport();
  return resolvedEndMark;
}

export function recordFormulaXPerfPoint(name: string): void {
  const markName = markFormulaXPerf(name);
  if (!markName) {
    return;
  }

  measureFormulaXPerf(name, markName, markName);
  clearFormulaXPerfMarks(markName);
}

export function clearFormulaXPerfMarks(...marks: Array<string | null | undefined>): void {
  if (!hasPerfSupport()) {
    return;
  }

  for (const mark of marks) {
    if (!mark) {
      continue;
    }

    performance.clearMarks(mark);
  }
}

export async function preloadFormulaXEditor(): Promise<void> {
  await ensureKityRuntime();
}

export function scheduleFormulaXEditorPreload(
  mode: FormulaXEditorPreloadMode,
  target?: EventTarget | null,
): () => void {
  if (mode === false || typeof window === 'undefined') {
    return () => undefined;
  }

  let disposed = false;
  let triggered = false;
  const cleanupCallbacks: Array<() => void> = [];

  const trigger = (): void => {
    if (disposed || triggered) {
      return;
    }

    triggered = true;

    while (cleanupCallbacks.length) {
      cleanupCallbacks.pop()?.();
    }

    void preloadFormulaXEditor();
  };

  if (mode === 'idle') {
    const host = getPerfHost();

    if (typeof host.requestIdleCallback === 'function') {
      const handle = host.requestIdleCallback(() => {
        trigger();
      });

      cleanupCallbacks.push(() => {
        host.cancelIdleCallback?.(handle);
      });
    } else {
      const handle = window.setTimeout(() => {
        trigger();
      }, 1);

      cleanupCallbacks.push(() => {
        window.clearTimeout(handle);
      });
    }

    return () => {
      disposed = true;

      while (cleanupCallbacks.length) {
        cleanupCallbacks.pop()?.();
      }
    };
  }

  if (target && 'addEventListener' in target && 'removeEventListener' in target) {
    const eventTarget = target as EventTarget;

    const onActivate = (): void => {
      trigger();
    };

    eventTarget.addEventListener('pointerenter', onActivate, { once: true, passive: true });
    eventTarget.addEventListener('focusin', onActivate, { once: true });

    cleanupCallbacks.push(() => {
      eventTarget.removeEventListener('pointerenter', onActivate);
      eventTarget.removeEventListener('focusin', onActivate);
    });
  }

  return () => {
    disposed = true;

    while (cleanupCallbacks.length) {
      cleanupCallbacks.pop()?.();
    }
  };
}

export function waitForFormulaXAnimationFrame(): Promise<void> {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}
