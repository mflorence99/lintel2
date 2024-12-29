// 📘 abstract the VSCode API for webview

export interface WebviewAPI {
  getState(): Record<string, any>;
  postMessage(message: any): void;
  setState(state: Record<string, any>): void;
}
