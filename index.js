import express from "express";
import si from "systeminformation";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Status API
app.get("/api/status", async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const disk = await si.fsSize();
    const uptime = process.uptime();

    res.json({
      cpu: cpu.currentLoad.toFixed(2),
      ram: ((mem.used / mem.total) * 100).toFixed(2),
      disk: disk.map(d => ({ fs: d.fs, used: ((d.used / d.size) * 100).toFixed(2) })),
      uptime: (uptime / 3600).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Network API
app.get("/api/network", async (req, res) => {
  try {
    const net = await si.networkStats();
    res.json(net);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HTTP Requests API (mock)
app.get("/api/http", (req, res) => {
  res.json({
    "200": Math.floor(Math.random() * 100),
    "400": Math.floor(Math.random() * 10),
    "500": Math.floor(Math.random() * 5)
  });
});

// Top Processes API
app.get("/api/processes", async (req, res) => {
  const processes = await si.processes();
  const top = processes.list.sort((a, b) => b.cpu - a.cpu).slice(0, 5);
  res.json(top.map(p => ({ name: p.name, cpu: p.cpu.toFixed(2), mem: p.mem.toFixed(2) })));
});

// Logs API (mock logs)
app.get("/api/logs", (req, res) => {
  const logs = [];
  for(let i=0; i<50; i++) {
    logs.push({ time: new Date().toLocaleTimeString(), message: `Log entry ${i+1}` });
  }
  res.json(logs);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
