import { Message } from '@lib/messages';

// 🔥 TEMPORARY - copied from simulator

type LogParams = {
  data?: any;
  error?: boolean;
  important?: string;
  text?: string;
  warning?: boolean;
};

// 📘 abstract the VSCode API for extension

export interface ExtensionAPI {
  log(data: LogParams): void;
  onDidReceiveMessage(message: Message): void;
  postMessage(message: Message): void;
}
