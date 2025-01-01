import { Message } from '@lib/messages';

// 📘 abstract the VSCode API for webview

export interface WebviewAPI {
  getState(): Record<string, any>;
  postMessage(message: Message): void;
  setState(state: Record<string, any>): void;
}
