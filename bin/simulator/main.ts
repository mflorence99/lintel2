import { config } from '@lib/config.ts';
import { debounce } from 'jsr:@std/async/debounce';
import { parseArgs } from '@std/cli/parse-args';

const { dir } = parseArgs(Deno.args);

console.log({ dir, me: import.meta.dirname });

let theSocket;

Deno.serve({ port: 8100 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === '/') {
    const html = await Deno.readTextFile(
      `${import.meta.dirname}/../../dist/webview/index.html`
    );
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } else if (url.pathname === '/favicon.ico') {
    const file = await Deno.open(`${import.meta.dirname}/favicon.ico`, {
      read: true
    });
    return new Response(file.readable, {
      headers: { 'Content-Type': 'image/x-icon' }
    });
  } else return new Response(null, { status: 404 });
});

// open('http://localhost:8100');

Deno.serve({ port: 8101 }, (req) => {
  if (req.headers.get('upgrade') === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(req);
    theSocket = socket;
    socket.addEventListener('open', () => {
      console.log('a client connected!');
    });
    socket.addEventListener('message', (event) => {
      console.log(`client sent ${event.data}`);
      if (event.data === 'ping') {
        socket.send('pong');
      }
    });
    return response;
  } else return new Response(null, { status: 501 });
});

const handler = debounce((paths: string[]) => {
  const files = paths.map((path) => {
    const ix = path.indexOf(dir) + dir.length + 1;
    return path.substring(ix);
  });
  const now = new Date();
  console.log(
    `%c${now.toLocaleTimeString()} %creloading:%c[${files.join(',')}]`,
    'color: green',
    'color: white',
    'color: pink'
  );
  theSocket?.send('reload');
}, config.debounceMillis);

const watcher = Deno.watchFs(`${import.meta.dirname}/../../dist/webview`);
for await (const event of watcher) {
  handler(event.paths);
}
