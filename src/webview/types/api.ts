import { Message } from '~lib/types/messages';

// 📘 abstract the VSCode API for webview

export type WebviewAPI = {
  getState(): Record<string, any>;
  postMessage(message: Message): void;
  setState(state: Record<string, any>): void;
};
