import { Message } from '~lib/types/messages';

// 🔥 TEMPORARY - copied from simulator

type LogParams = {
  data?: any;
  error?: boolean;
  important?: string;
  text?: string;
  warning?: boolean;
};

// 📘 abstract the runtime API for extension

export type ExtensionAPI = {
  cwd(): string;
  log(data: LogParams): void;
  onDidReceiveMessage(message: Message): void;
  postMessage(message: Message): void;
};
