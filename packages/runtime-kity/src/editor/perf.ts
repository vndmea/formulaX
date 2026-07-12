type FormulaXPerfState = {
  reportedMeasureCount: number;
  reportScheduled: boolean;
};

type FormulaXPerfHost = typeof globalThis & {
  __FORMULAX_PERF__?: boolean;
  __FORMULAX_PERF_STATE__?: FormulaXPerfState;
};

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
