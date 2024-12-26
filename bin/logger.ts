import { parse } from '@std/path/parse';

import StackTrace from 'stacktrace-js';

type Params = {
  data?: any;
  error?: boolean;
  important?: string;
  text?: string;
  warning?: boolean;
};

// 📘 provides a consistent logging format

export function log({
  data,
  error,
  important,
  text,
  warning
}: Params): void {
  const now = new Date();
  // 👇 get the callers file, line # etc
  const frame = StackTrace.getSync()[1];
  const parsed = parse(frame.fileName);
  // 👇 assemble the individual parts of the message
  const parts: string[][] = [
    [
      `%c${now.toLocaleTimeString()}`,
      `color: ${error ? 'red' : warning ? 'yellow' : 'green'}; fontWeight: ${error || warning}: 'bold' : 'normal'`
    ],
    [`%c${parsed.name}`.padEnd(13, '.'), 'color: cyan']
  ];
  if (error) parts.push([`%c🔥`, `color: red`]);
  if (warning) parts.push([`%c⚠️`, `color: yellow`]);
  if (important) parts.push([`%c${important}`, `color: yellow`]);
  if (text) parts.push([`%c${text}`, `color: white`]);
  if (data) parts.push([`%c${JSON.stringify(data)}`, `color: cyan`]);
  // 👇 ready to log them
  console.log(
    parts.map((part) => part.at(0)).join(' '),
    ...parts.map((part) => part.at(1))
  );
}
