import { obj } from '@lib/test.ts';
import { open } from '@opensrc/deno-open';

console.log(obj);

const server = Deno.serve(async (req) => {
  console.log('Method:', req.method);

  const url = new URL(req.url);
  console.log('Path:', url.pathname);
  console.log('Query parameters:', url.searchParams);

  console.log('Headers:', req.headers);

  if (req.body) {
    const body = await req.text();
    console.log('Body:', body);
  }

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

console.log(server);

open('http://localhost:8000');
