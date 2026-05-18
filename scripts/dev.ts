import index from "../src/index.html";

const server = Bun.serve({
  port: 3000,
  development: {
    hmr: true,
    console: true,
  },
  routes: {
    "/": index,
    "/*": index,
    "/favicon.ico": new Response(Bun.file("public/favicon.ico")),
    "/robots.txt": new Response(Bun.file("public/robots.txt")),
  },
});

console.log(`dev server: ${server.url}`);
