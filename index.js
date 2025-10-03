import express from "express";
import si from "systeminformation";
import cors from "cors";

const app = express();
app.use(cors()); // so our frontend can fetch data

const PORT = process.env.PORT || 3000;

app.get("/api/status", async (req, res) => {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const uptime = process.uptime();

  res.json({
    cpu: cpu.currentLoad.toFixed(2) + "%",
    ram: ((mem.used / mem.total) * 100).toFixed(2) + "%",
    uptime: (uptime / 3600).toFixed(2) + " hours"
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
