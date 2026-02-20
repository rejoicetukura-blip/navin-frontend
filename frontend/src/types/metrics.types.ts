/**
 * Observability Metrics – Type Definitions
 *
 * All counter keys the system tracks and the public read-only snapshot
 * returned by getter functions.
 */

/** Every discrete metric the platform records. */
export type MetricKey =
  | 'shipmentsCreated'
  | 'shipmentsDelivered'
  | 'shipmentsInTransit'
  | 'settlementCount'
  | 'settlementTotalUsd'
  | 'ledgerTransactions';

/** All recognised keys as a const array (used internally for initialisation). */
export const METRIC_KEYS: readonly MetricKey[] = [
  'shipmentsCreated',
  'shipmentsDelivered',
  'shipmentsInTransit',
  'settlementCount',
  'settlementTotalUsd',
  'ledgerTransactions',
] as const;

/**
 * Immutable snapshot returned by getter functions.
 * Every field is a plain property lookup – O(1) reads guaranteed.
 */
export interface MetricsSnapshot {
  readonly counters: Readonly<Record<MetricKey, number>>;
  readonly lastUpdatedAt: number; // epoch milliseconds
}
