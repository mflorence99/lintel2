import { config } from '../config.ts';
import { log } from '../logger.ts';
import { webview } from './webview.ts';

type Params = {
  ac?: AbortController;
  dir: string;
};

// 📘 provides HTTP services for the simulator

export function http({ ac, dir }: Params): Deno.HttpServer {
  return Deno.serve(opts(), (req) => {
    const url = new URL(req.url);
    const pathname =
      url.pathname === '/' ? '/index.html' : url.pathname;

    // 👇 text contents
    {
      const { path, file, ext } = match(pathname, [
        'css',
        'html',
        'js',
        'map'
      ]);
      if (ext) {
        let contents = Deno.readTextFileSync(
          `${dir}/${path}/${file}.${ext}`
        );
        if (pathname === '/index.html')
          contents = mungeIndexHTML(contents);
        return new Response(contents, init(`text/${ext}`));
      }
    }

    // 👇 binary contents
    {
      const { path, file, ext } = match(pathname, [
        'gif',
        'jpeg',
        'png'
      ]);
      if (ext) {
        const image = Deno.openSync(`${dir}/${path}/${file}.${ext}`, {
          read: true
        });
        return new Response(image.readable, init(`image/${ext}`));
      }
    }

    // 👇 anything else is a 404
    return new Response(null, { status: 404 });
  });

  // 👇 make response init

  function init(contentType: string): ResponseInit {
    return {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store'
      }
    };
  }

  // 👇 extract path, file, ext from URL

  function match(
    pathname: string,
    exts: string[]
  ): { path; file; ext } {
    const regex = new RegExp(
      `^([/a-z0-9]?)\/(.*).(${exts.join('|')})$`
    );
    const match = regex.exec(pathname);
    return { path: match?.[1], file: match?.[2], ext: match?.[3] };
  }

  // 👇 make server options

  function opts(): any {
    return {
      onListen({ port, hostname }) {
        log({
          important: `HTTP server started`,
          text: `http://${hostname}:${port}`
        });
      },
      port: config.simulator.http.port,
      signal: ac?.signal
    };
  }
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
            
      // 👇 yes, we are in a simulation
      lintelIsSimulated = true;
      
      // 👇 load the webview simulation
      (() => {
        ${webview.toString()}
        webview({
          httpPort: ${config.simulator.http.port}, 
          wsPort: ${config.simulator.ws.port},
          keepAliveMillis: ${config.keepAliveMillis}
        });
      })();
    </script>
    </head>`
  );
}
