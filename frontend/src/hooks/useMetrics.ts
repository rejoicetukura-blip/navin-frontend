/**
 * useMetrics – React hook for the observability metrics interface.
 *
 * Provides a stable API surface for any component that needs to
 * record or read lightweight aggregate counters.
 */

import { useMemo } from 'react';
import { MetricsStore } from '@/services/MetricsStore';
import type { MetricKey, MetricsSnapshot } from '@/types/metrics.types';

export interface UseMetricsReturn {
    /** Bump a counter by `delta` (default 1). */
    increment: (key: MetricKey, delta?: number) => void;
    /** Overwrite a counter with an absolute value. */
    set: (key: MetricKey, value: number) => void;
    /** Return a single counter value – O(1). */
    getCounter: (key: MetricKey) => number;
    /** Return a frozen snapshot of all counters – O(1). */
    getSnapshot: () => MetricsSnapshot;
    /** Zero-out every counter. */
    reset: () => void;
}

export function useMetrics(): UseMetricsReturn {
    return useMemo(() => {
        const store = MetricsStore.getInstance();
        return {
            increment: store.increment.bind(store),
            set: store.set.bind(store),
            getCounter: store.getCounter.bind(store),
            getSnapshot: store.getSnapshot.bind(store),
            reset: store.reset.bind(store),
        };
    }, []);
}
