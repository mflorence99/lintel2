type Params = {
  data?: any;
  error?: boolean;
  important?: string;
  text?: string;
  warning?: boolean;
};

// 📘 provides a consistent logging format

export function log({ data, error, important, text, warning }: Params): void {
  const now = new Date();
  // 👇 assemble the individual parts of the message
  const parts: string[][] = [
    [
      `%c${now.toLocaleTimeString()}`,
      `color: ${error ? 'red' : warning ? 'yellow' : 'green'}; fontWeight: ${error || warning}: 'bold' : 'normal'`
    ]
  ];
  if (important) parts.push([`%c${important}`, `color: yellow`]);
  if (text) parts.push([`%c${text}`, `color: white`]);
  if (data) parts.push([`%c${JSON.stringify(data)}`, `color: cyan`]);
  // 👇 ready to log them
  console.log(
    parts.map((part) => part[0]).join(' '),
    ...parts.map((part) => part[1])
  );
}
