import { createHistorySnapshot } from '../core/clone';
import type {
  FormulaDoc,
  FormulaHistoryReason,
  FormulaHistorySnapshot,
  FormulaSelection,
} from '../core/types';

export interface FormulaHistoryEntry extends FormulaHistorySnapshot {
  timestamp: number;
  reason: FormulaHistoryReason;
}

export interface FormulaHistoryOptions {
  maxDepth?: number;
  mergeDelay?: number;
}

export class FormulaHistory {
  private readonly maxDepth: number;
  private readonly mergeDelay: number;
  private undoStack: FormulaHistoryEntry[] = [];
  private redoStack: FormulaHistoryEntry[] = [];

  constructor(options: FormulaHistoryOptions = {}) {
    this.maxDepth = options.maxDepth ?? 100;
    this.mergeDelay = options.mergeDelay ?? 800;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  push(
    doc: FormulaDoc,
    selection: FormulaSelection | null,
    reason: FormulaHistoryReason,
    options: { mergeWithPrevious?: boolean } = {},
  ): void {
    const entry: FormulaHistoryEntry = {
      ...createHistorySnapshot(doc, selection),
      timestamp: Date.now(),
      reason,
    };

    const previous = this.undoStack[this.undoStack.length - 1];
    const canMerge = Boolean(
      options.mergeWithPrevious
      && previous
      && previous.reason === reason
      && entry.timestamp - previous.timestamp <= this.mergeDelay,
    );

    if (canMerge) {
      this.undoStack[this.undoStack.length - 1] = {
        ...previous,
        timestamp: entry.timestamp,
        reason: entry.reason,
      };
    } else {
      this.undoStack.push(entry);
      if (this.undoStack.length > this.maxDepth) {
        this.undoStack.shift();
      }
    }

    this.redoStack = [];
  }

  undo(current: FormulaDoc, selection: FormulaSelection | null): FormulaHistoryEntry | null {
    const entry = this.undoStack.pop() ?? null;
    if (!entry) {
      return null;
    }

    this.redoStack.push({
      ...createHistorySnapshot(current, selection),
      timestamp: Date.now(),
      reason: entry.reason,
    });
    return entry;
  }

  redo(current: FormulaDoc, selection: FormulaSelection | null): FormulaHistoryEntry | null {
    const entry = this.redoStack.pop() ?? null;
    if (!entry) {
      return null;
    }

    this.undoStack.push({
      ...createHistorySnapshot(current, selection),
      timestamp: Date.now(),
      reason: entry.reason,
    });
    return entry;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getState() {
    return {
      undoStack: [...this.undoStack],
      redoStack: [...this.redoStack],
      maxDepth: this.maxDepth,
    };
  }
}
