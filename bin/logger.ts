import { config } from '@lib/config.ts';

type Params = {
  data?: any;
  error?: boolean;
  important?: string;
  text?: string;
};

// 📘 provides a consistent logging format

export function log({ data, error, important, text }: Params): void {
  const now = new Date();
  // 👇 assemble the individual parts of the message
  const parts: string[][] = [
    [
      `%c${now.toLocaleTimeString()}`,
      `color: ${error ? config.log.color.error : config.log.color.ts}`
    ]
  ];
  if (important)
    parts.push([`%c${important}`, `color: ${config.log.color.important}`]);
  if (text) parts.push([`%c${text}`, `color: ${config.log.color.text}`]);
  if (data)
    parts.push([
      `%c${JSON.stringify(data)}`,
      `color: ${config.log.color.data}`
    ]);
  // 👇 ready to log them
  console.log(
    parts.map((part) => part[0]).join(' '),
    ...parts.map((part) => part[1])
  );
}
