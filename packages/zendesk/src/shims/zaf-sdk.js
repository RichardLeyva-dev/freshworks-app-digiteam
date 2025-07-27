const init = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ZAF = window.ZAFClient;
    if (!ZAF)
        throw new Error('ZAFClient not loaded');
    return ZAF.init();
};
export default { init };
export { init };
