import ReactGA from 'react-ga4';

// const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS! || 'GTM-W73HLJFM';

export const initGA = (GA_TRACKING_ID: string) => {
  ReactGA.initialize(GA_TRACKING_ID);
};

// export const GAPageView = (GA_TRACKING_ID: string) => {
//   ReactGA._gaCommandSendPageview(window.location.pathname + window.location.search, '');
// };

export const GAEvent = (category: string, action: string, label: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
