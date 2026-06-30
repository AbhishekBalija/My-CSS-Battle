import { createServer } from "vite";
const root = "/Users/abhishekan/Desktop/Web Projects/My-CSS-Battle";
const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom" });
try {
  const mod = await server.ssrLoadModule("/src/entry-server.tsx");
  const res = mod.render("/");
  console.log("html length", res.html.length);
  console.log("helmet", typeof res.helmet, res.helmet ? Object.keys(res.helmet) : null);
  if (res.helmet) {
    console.log("title", res.helmet.title?.toString());
    console.log("meta", res.helmet.meta?.toString());
  }
} finally { await server.close(); }
