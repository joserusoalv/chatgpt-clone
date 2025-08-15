/* Dev server: SSE and chunked streaming endpoints */
import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const prompt = String(req.query.prompt || "");
  const chunks = [
    `Hola, estoy procesando: "${prompt}".\n\n`,
    "Aquí va un bloque de código:\n\n",
    "```ts\n",
    "function greet(name: string) {\n",
    "  console.log(`Hola ${name}`);\n",
    "}\n",
    "```\n\n",
    "Fin del ejemplo.\n",
  ];
  let i = 0;
  const timer = setInterval(() => {
    if (i < chunks.length) res.write(`data: ${chunks[i++]}\n\n`);
    else {
      res.write("data: [DONE]\n\n");
      clearInterval(timer);
      res.end();
    }
  }, 150);
  req.on("close", () => clearInterval(timer));
});

app.post("/api/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  const { prompt = "" } = req.body || {};
  const chunks = [
    `Procesando: "${prompt}"\n\n`,
    "Código:\n",
    "```ts\n",
    "export const add = (a: number, b: number) => a + b;\n",
    "```\n",
    "Listo.\n",
  ];
  for (const c of chunks) {
    res.write(c);
    await new Promise((r) => setTimeout(r, 150));
  }
  res.end();
});

app.listen(PORT, () => console.log(`[dev-server] http://localhost:${PORT}`));
