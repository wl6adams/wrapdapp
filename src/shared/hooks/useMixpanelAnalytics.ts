import mixpanel from 'mixpanel-browser';

mixpanel.init('e6ec200df648294d46793fd628347009', {
  debug: process.env.NEXT_PUBLIC_HOST_TYPE === 'develop',
  track_pageview: false,
  persistence: 'localStorage',
});

const useMixpanelAnalytics = () => {
  const mixpanelTrackEvent = (event: string, data?: any) => {
    mixpanel.track(event, data);
  };

  return {
    mixpanelTrackEvent,
  };
};

export { useMixpanelAnalytics };
