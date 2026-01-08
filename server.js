// Real-time Agent Status Server
// Agents POST updates here, clients receive via SSE

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3333;

// In-memory state
let agents = {
  planner: {
    status: "idle",
    message: "Waiting...",
    tokens: 0,
    cost: 0,
    lastUpdate: Date.now(),
  },
  implementer: {
    status: "idle",
    message: "Waiting...",
    tokens: 0,
    cost: 0,
    lastUpdate: Date.now(),
  },
  reviewer: {
    status: "idle",
    message: "Waiting...",
    tokens: 0,
    cost: 0,
    lastUpdate: Date.now(),
  },
};

let messages = [];
let totalStats = { tokens: 0, cost: 0, messages: 0 };
let sseClients = [];

// Broadcast to all SSE clients
function broadcast(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (e) {
      // Client disconnected
    }
  });
}

// Handle agent updates
function handleAgentUpdate(body) {
  const { agent, status, message, tokens, cost } = body;

  if (agent && agents[agent]) {
    agents[agent] = {
      status: status || agents[agent].status,
      message: message || agents[agent].message,
      tokens: (agents[agent].tokens || 0) + (tokens || 0),
      cost: (agents[agent].cost || 0) + (cost || 0),
      lastUpdate: Date.now(),
    };

    totalStats.tokens += tokens || 0;
    totalStats.cost += cost || 0;
    totalStats.messages++;

    // Add to message log
    if (message) {
      messages.push({
        id: Date.now().toString(),
        agent,
        type: "agent",
        content: message,
        timestamp: new Date().toISOString(),
      });
      // Keep last 100 messages
      if (messages.length > 100) messages.shift();
    }

    // Broadcast update
    broadcast({
      type: "update",
      agents,
      stats: totalStats,
      messages: messages.slice(-20),
      timestamp: Date.now(),
    });

    return { success: true };
  }

  return { success: false, error: "Invalid agent" };
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        resolve({});
      }
    });
  });
}

// CORS headers
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Create server
const server = http.createServer(async (req, res) => {
  setCORS(res);

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.split("?")[0];

  // SSE endpoint for real-time updates
  if (url === "/api/events" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Send initial state
    res.write(
      `data: ${JSON.stringify({
        type: "init",
        agents,
        stats: totalStats,
        messages: messages.slice(-20),
        timestamp: Date.now(),
      })}\n\n`,
    );

    // Add to clients
    sseClients.push(res);

    // Remove on close
    req.on("close", () => {
      sseClients = sseClients.filter((c) => c !== res);
    });

    return;
  }

  // Agent update endpoint
  if (url === "/api/agent-update" && req.method === "POST") {
    const body = await parseBody(req);
    const result = handleAgentUpdate(body);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }

  // Status endpoint
  if (url === "/api/status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        agents,
        stats: totalStats,
        messages: messages.slice(-20),
      }),
    );
    return;
  }

  // Reset endpoint
  if (url === "/api/reset" && req.method === "POST") {
    agents = {
      planner: {
        status: "idle",
        message: "Reset",
        tokens: 0,
        cost: 0,
        lastUpdate: Date.now(),
      },
      implementer: {
        status: "idle",
        message: "Reset",
        tokens: 0,
        cost: 0,
        lastUpdate: Date.now(),
      },
      reviewer: {
        status: "idle",
        message: "Reset",
        tokens: 0,
        cost: 0,
        lastUpdate: Date.now(),
      },
    };
    messages = [];
    totalStats = { tokens: 0, cost: 0, messages: 0 };

    broadcast({ type: "reset", agents, stats: totalStats, messages: [] });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Serve static files from dist
  let filePath = url === "/" ? "/index.html" : url;
  filePath = path.join(__dirname, "dist", filePath);

  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
  };

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "text/plain" });
    res.end(content);
  } catch (e) {
    // Try index.html for SPA routing
    try {
      const content = fs.readFileSync(
        path.join(__dirname, "dist", "index.html"),
      );
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    } catch (e2) {
      res.writeHead(404);
      res.end("Not found");
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  ASCII AGENT DASHBOARD SERVER                              ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Dashboard:  http://localhost:${PORT}                        ║
║  SSE:        http://localhost:${PORT}/api/events             ║
║  Status:     http://localhost:${PORT}/api/status             ║
║  Update:     POST http://localhost:${PORT}/api/agent-update  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

Agents can report status with:
  curl -X POST http://localhost:${PORT}/api/agent-update \\
    -H "Content-Type: application/json" \\
    -d '{"agent":"planner","status":"working","message":"Doing something..."}'
  `);
});
