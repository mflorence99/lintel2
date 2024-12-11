import { config } from '@lib/config.ts';
import { wsClient } from './ws-client.ts';

import openBrowser from 'open';

type Params = {
  dir: string;
  open: boolean;
};

// 📘 provides HTTP services for the simulator

export function httpServer({ dir, open }: Params): void {
  Deno.serve({ port: config.simulator.http.port }, async (req) => {
    const url = new URL(req.url);

    // 👇 route: /index.html
    if (url.pathname === '/' || url.pathname === '/index.htrml') {
      const html = await Deno.readTextFile(`${Deno.cwd()}/${dir}/index.html`);
      return new Response(mungeIndexHTML(html), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // 👇 route: /assets/xxx.png etc
    let regex = /^\/assets\/(.*).(gif|jpeg|jpg|png)$/;
    let match = regex.exec(url.pathname);
    if (match) {
      const file = await Deno.open(
        `${Deno.cwd()}/${dir}/assets/${match[1]}.${match[2]}`,
        {
          read: true
        }
      );
      return new Response(file.readable, {
        headers: { 'Content-Type': `image/${match[2]}` }
      });
    }

    // 👇 route: /assets/xxx.css etc
    regex = /^\/assets\/(.*).(css)$/;
    match = regex.exec(url.pathname);
    if (match) {
      const html = await Deno.readTextFile(
        `${Deno.cwd()}/${dir}/assets/${match[1]}.${match[2]}`
      );
      return new Response(mungeIndexHTML(html), {
        headers: { 'Content-Type': `text/${match[2]}` }
      });
    }

    // 👇 route: anything else is a 404
    return new Response(null, { status: 404 });
  });

  // 👇 if requested, open the browser
  if (open) openBrowser(`http://localhost:${config.simulator.http.port}`);
}

// 👇 munge the index.html to add the WebSocket client
//    and prepare it for the simulator file paths etc

function mungeIndexHTML(html: string): string {
  return html.replace(
    '</head>',
    `
    <link rel="icon" type="image/x-icon" href="assets/lintel.png" />
    <script>
      ${wsClient.toString()}
      wsClient({httpPort: ${config.simulator.http.port}, 
                  wsPort: ${config.simulator.ws.port}});
    </script>
    </head>`
  );
}
