const NAME = 'FilterEvents';

/**
 * Filter events when MetaMetrics is disabled.
 *
 * @param options - Options bag.
 * @param options.getMetaMetricsEnabled - Function that returns whether MetaMetrics is enabled.
 * @param options.log - Function to log messages.
 */
export function filterEvents({
  getMetaMetricsEnabled,
  log,
}: {
  getMetaMetricsEnabled: () => Promise<boolean>;
  log: (message: string) => void;
}): any {
  return {
    name: NAME,
    processEvent: async (event: unknown) => {
      return null;
    },
  };
}
