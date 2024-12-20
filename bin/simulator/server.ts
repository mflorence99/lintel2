import { config } from '../config.ts';
import { log } from '../logger.ts';
import { webview } from './webview.ts';

type Params = {
  dir: string;
};

// 📘 provides HTTP services for the simulator

export function server({ dir }: Params): void {
  Deno.serve(
    {
      onListen({ port, hostname }) {
        log({
          important: `HTTP server started`,
          text: `http://${hostname}:${port}`
        });
      },
      port: config.simulator.http.port
    },
    async (req) => {
      const url = new URL(req.url);
      const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

      // 👇 route: from the root
      let regex = /^\/(.*).(html|js|map)$/;
      let match = regex.exec(pathname);
      if (match) {
        let contents = await Deno.readTextFile(
          `${dir}/${match[1]}.${match[2]}`
        );
        if (pathname === '/index.html') contents = mungeIndexHTML(contents);
        return new Response(contents, {
          headers: {
            'Content-Type': `text/${match[2]}`,
            'Cache-Control': 'no-store'
          }
        });
      }

      // 👇 route: /assets/xxx.png etc
      regex = /^\/([a-z0-9]+)\/(.*).(gif|jpeg|jpg|png)$/;
      match = regex.exec(pathname);
      if (match) {
        const file = await Deno.open(
          `${dir}/${match[1]}/${match[2]}.${match[3]}`,
          {
            read: true
          }
        );
        return new Response(file.readable, {
          headers: {
            'Content-Type': `image/${match[3]}`,
            'Cache-Control': 'no-store'
          }
        });
      }

      // 👇 route: /assets/xxx.css etc
      regex = /^\/([a-z0-9]+)\/(.*).(css)$/;
      match = regex.exec(pathname);
      if (match) {
        const contents = await Deno.readTextFile(
          `${dir}/${match[1]}/${match[2]}.${match[3]}`
        );
        return new Response(contents, {
          headers: {
            'Content-Type': `text/${match[3]}`,
            'Cache-Control': 'no-store'
          }
        });
      }

      // 👇 route: anything else is a 404
      return new Response(null, { status: 404 });
    }
  );
}

// 👇 munge the index.html to add the WebSocket client
//    and prepare it for the simulator file paths etc

function mungeIndexHTML(html: string): string {
  return html.replace(
    '</head>',
    `
    <link rel="icon" type="image/x-icon" href="assets/lintel.png" />
    <style>
      ${Deno.readTextFileSync(`${import.meta.dirname}/webview.css`)}
    </style>
    <script>
      var acquireVsCodeApi;
      
      // 🔥 load the webview simulation
      (() => {
        ${webview.toString()}
        webview({
          httpPort: ${config.simulator.http.port}, 
          wsPort: ${config.simulator.ws.port},
          pingPongMillis: ${config.pingPongMillis}
        });
      })();

      // 🔥 smoke test to check if all setup
      lintelIsReady.then(() => {
        lintelVSCodeAPI.setState({ x: 1, y: 2 });
        const { x, y } = lintelVSCodeAPI.getState();
        if (x === 1 && y === 2) {
          const ok = 
            lintelVSCodeAPI.postMessage({ command: 'doit', when: 'now' });
          if (ok)
            console.log('%cwebview simulator is ready', 'color: lightgreen');
        }
      });
    </script>
    </head>`
  );
}
