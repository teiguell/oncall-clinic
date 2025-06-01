import express from "express";
import type { Request, Response } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("dist"));

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

async function main() {
  // Read the main HTML file
  const mainHtmlPath = path.join(process.cwd(), 'index.html');
  let finalHtml: string;
  
  try {
    finalHtml = fs.readFileSync(mainHtmlPath, 'utf8');
    log("Main HTML loaded successfully");
  } catch (error) {
    console.error('Error reading main HTML file:', error);
    // Fallback to basic HTML if file not found
    finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OnCall Clinic - Professional Medical Care</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 2rem; }
        .hero { text-align: center; padding: 4rem 0; }
        h1 { color: #2563eb; font-size: 3rem; margin-bottom: 1rem; }
        p { color: #6b7280; font-size: 1.2rem; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>OnCall Clinic</h1>
        <p>Professional medical care at home</p>
        <p>Loading...</p>
    </div>
</body>
</html>`;
  }

  // Serve the final OnCall Clinic page
  app.get("/", (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(finalHtml);
  });

  app.get("/clinic", (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(finalHtml);
  });

  // Register API routes
  const server = await registerRoutes(app);

  // Setup Vite or serve static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    try {
      serveStatic(app);
    } catch (error) {
      log("Static files not available, continuing with API only");
    }
  }

  // Start server
  const PORT = Number(process.env.PORT) || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${PORT}`, "express");
  });
}

main().catch(console.error);