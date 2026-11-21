import index from "../src/index.html";

async function publicAsset(pathname: string): Promise<Response> {
  const path = decodeURIComponent(pathname);
  if (path.includes("..") || path.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }

  const file = Bun.file(`public${path}`);
  if (!(await file.exists())) return new Response("Not found", { status: 404 });
  return new Response(file);
}

const server = Bun.serve({
  port: 3000,
  development: {
    hmr: true,
    console: true,
  },
  routes: {
    "/": index,
    "/images/*": (req) => publicAsset(new URL(req.url).pathname),
    "/cv.pdf": new Response(Bun.file("public/cv.pdf")),
    "/favicon.ico": new Response(Bun.file("public/favicon.ico")),
    "/robots.txt": new Response(Bun.file("public/robots.txt")),
    "/*": index,
  },
});

console.log(`dev server: ${server.url}`);
