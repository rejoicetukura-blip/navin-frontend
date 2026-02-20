/**
 * MetricsStore – Lightweight Observability Counters
 *
 * A singleton that maintains aggregate counters for analytics.
 * All reads and writes are O(1) property lookups on a flat record.
 * No arrays are iterated; no history is scanned.
 */

import type { MetricKey, MetricsSnapshot } from '@/types/metrics.types';
import { METRIC_KEYS } from '@/types/metrics.types';

export class MetricsStore {
    /* ------------------------------------------------------------------ */
    /*  Singleton                                                         */
    /* ------------------------------------------------------------------ */

    private static instance: MetricsStore | null = null;

    static getInstance(): MetricsStore {
        if (!MetricsStore.instance) {
            MetricsStore.instance = new MetricsStore();
        }
        return MetricsStore.instance;
    }

    /** Destroy the singleton (useful for test isolation). */
    static resetInstance(): void {
        MetricsStore.instance = null;
    }

    /* ------------------------------------------------------------------ */
    /*  Internal state                                                    */
    /* ------------------------------------------------------------------ */

    private counters: Record<MetricKey, number>;
    private lastUpdatedAt: number;

    private constructor() {
        this.counters = MetricsStore.buildEmptyCounters();
        this.lastUpdatedAt = Date.now();
    }

    /* ------------------------------------------------------------------ */
    /*  Mutators                                                          */
    /* ------------------------------------------------------------------ */

    /** Increment a counter by `delta` (default 1). O(1). */
    increment(key: MetricKey, delta: number = 1): void {
        this.counters[key] += delta;
        this.lastUpdatedAt = Date.now();
    }

    /** Overwrite a counter with an absolute value. O(1). */
    set(key: MetricKey, value: number): void {
        this.counters[key] = value;
        this.lastUpdatedAt = Date.now();
    }

    /** Zero-out every counter. */
    reset(): void {
        this.counters = MetricsStore.buildEmptyCounters();
        this.lastUpdatedAt = Date.now();
    }

    /* ------------------------------------------------------------------ */
    /*  Getters – all O(1)                                                */
    /* ------------------------------------------------------------------ */

    /** Return a single counter value. O(1). */
    getCounter(key: MetricKey): number {
        return this.counters[key];
    }

    /**
     * Return a frozen, read-only snapshot of every counter plus a
     * timestamp. The returned object is a shallow copy so callers
     * cannot mutate internal state.
     */
    getSnapshot(): MetricsSnapshot {
        return Object.freeze({
            counters: Object.freeze({ ...this.counters }),
            lastUpdatedAt: this.lastUpdatedAt,
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                           */
    /* ------------------------------------------------------------------ */

    private static buildEmptyCounters(): Record<MetricKey, number> {
        const counters = {} as Record<MetricKey, number>;
        for (const key of METRIC_KEYS) {
            counters[key] = 0;
        }
        return counters;
    }
}
