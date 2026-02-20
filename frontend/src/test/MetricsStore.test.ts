import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsStore } from '@/services/MetricsStore';
import { METRIC_KEYS } from '@/types/metrics.types';
import type { MetricKey } from '@/types/metrics.types';

describe('MetricsStore', () => {
    beforeEach(() => {
        // Ensure every test gets a fresh singleton
        MetricsStore.resetInstance();
    });

    /* -------------------------------------------------------------- */
    /*  Singleton identity                                             */
    /* -------------------------------------------------------------- */

    it('returns the same instance on repeated calls', () => {
        const a = MetricsStore.getInstance();
        const b = MetricsStore.getInstance();
        expect(a).toBe(b);
    });

    it('returns a new instance after resetInstance()', () => {
        const a = MetricsStore.getInstance();
        MetricsStore.resetInstance();
        const b = MetricsStore.getInstance();
        expect(a).not.toBe(b);
    });

    /* -------------------------------------------------------------- */
    /*  Initial state                                                  */
    /* -------------------------------------------------------------- */

    it('initialises every counter to 0', () => {
        const store = MetricsStore.getInstance();
        for (const key of METRIC_KEYS) {
            expect(store.getCounter(key)).toBe(0);
        }
    });

    /* -------------------------------------------------------------- */
    /*  increment()                                                    */
    /* -------------------------------------------------------------- */

    it('increments a counter by 1 when no delta is given', () => {
        const store = MetricsStore.getInstance();
        store.increment('shipmentsCreated');
        expect(store.getCounter('shipmentsCreated')).toBe(1);
    });

    it('increments a counter by a custom delta', () => {
        const store = MetricsStore.getInstance();
        store.increment('settlementTotalUsd', 500);
        store.increment('settlementTotalUsd', 250);
        expect(store.getCounter('settlementTotalUsd')).toBe(750);
    });

    /* -------------------------------------------------------------- */
    /*  set()                                                          */
    /* -------------------------------------------------------------- */

    it('overwrites a counter with an absolute value', () => {
        const store = MetricsStore.getInstance();
        store.increment('ledgerTransactions', 10);
        store.set('ledgerTransactions', 42);
        expect(store.getCounter('ledgerTransactions')).toBe(42);
    });

    /* -------------------------------------------------------------- */
    /*  getCounter()                                                   */
    /* -------------------------------------------------------------- */

    it('returns 0 for an untouched counter', () => {
        const store = MetricsStore.getInstance();
        expect(store.getCounter('shipmentsInTransit')).toBe(0);
    });

    /* -------------------------------------------------------------- */
    /*  getSnapshot()                                                  */
    /* -------------------------------------------------------------- */

    it('returns a snapshot with all counters and a timestamp', () => {
        const store = MetricsStore.getInstance();
        store.increment('shipmentsDelivered', 3);

        const snap = store.getSnapshot();

        expect(snap.counters.shipmentsDelivered).toBe(3);
        expect(typeof snap.lastUpdatedAt).toBe('number');
        expect(snap.lastUpdatedAt).toBeGreaterThan(0);
    });

    it('returns a frozen snapshot (cannot mutate internal state)', () => {
        const store = MetricsStore.getInstance();
        const snap = store.getSnapshot();

        // Attempting to mutate the snapshot should throw in strict mode
        expect(() => {
            (snap.counters as Record<MetricKey, number>).shipmentsCreated = 999;
        }).toThrow();
    });

    it('snapshot does not change when internal state changes afterwards', () => {
        const store = MetricsStore.getInstance();
        store.increment('settlementCount', 5);
        const snap = store.getSnapshot();

        store.increment('settlementCount', 10);
        // The previously captured snapshot must be unaffected
        expect(snap.counters.settlementCount).toBe(5);
        expect(store.getCounter('settlementCount')).toBe(15);
    });

    /* -------------------------------------------------------------- */
    /*  reset()                                                        */
    /* -------------------------------------------------------------- */

    it('zeros all counters on reset', () => {
        const store = MetricsStore.getInstance();
        store.increment('shipmentsCreated', 100);
        store.increment('settlementTotalUsd', 5000);
        store.reset();

        for (const key of METRIC_KEYS) {
            expect(store.getCounter(key)).toBe(0);
        }
    });
});
