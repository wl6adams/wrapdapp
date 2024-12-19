import { useCallback } from 'react';

interface AnalyticsEvent {
  event: string;

  properties?: Record<string, any>;
}

export default function useAnalytics() {
  const trackEvent = useCallback(({ event, properties }: AnalyticsEvent) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties || {});
    }
  }, []);

  return { trackEvent };
}
