const isElectron = (): boolean =>
  typeof window !== 'undefined' && 'electronAPI' in window;

const openBrowser = async (url: string) =>
  await (window as any).electronAPI.openBrowser(url);

export { isElectron, openBrowser };
