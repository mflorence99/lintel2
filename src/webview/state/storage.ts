import { WebviewAPI } from '@lib/webview-api';

declare const lintelWebviewAPI: WebviewAPI;

// 📘 implement LocalStorage-like in terms of webview API

class StorageService implements Storage {
  length = 0;

  // @see https://developer.mozilla.org/en-US/docs/Web/API/Storage

  clear(): void {
    lintelWebviewAPI.setState({});
  }

  getItem(key: string): any {
    const state = lintelWebviewAPI.getState() ?? {};
    return state[key];
  }

  key(n: number): string {
    const state = lintelWebviewAPI.getState() ?? {};
    return Object.keys(state)[n];
  }

  removeItem(key: string): void {
    const state = lintelWebviewAPI.getState() ?? {};
    delete state[key];
    lintelWebviewAPI.setState(state);
  }

  setItem(key: string, val: any): void {
    const state = lintelWebviewAPI.getState() ?? {};
    state[key] = val;
    lintelWebviewAPI.setState(state);
  }
}

// 👇 the singleton service

export const storage = new StorageService();
