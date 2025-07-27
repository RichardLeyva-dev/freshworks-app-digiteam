import type { ZAFClient } from 'zendesk_app_framework_sdk'; // usa tu .d.ts

const init = (): ZAFClient => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ZAF = (window as any).ZAFClient;
  if (!ZAF) throw new Error('ZAFClient not loaded');
  return ZAF.init();
};

export default { init };
export { init };
