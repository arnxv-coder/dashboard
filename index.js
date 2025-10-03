const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store historical data for charts
let networkHistory = [];
let httpRequestHistory = {
    status200: 0,
    status400: 0,
    status500: 0
};

// Helper function to get CPU usage
function getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - Math.floor((idle / total) * 100);
    
    return Math.min(Math.max(usage, 0), 100);
}

// Helper function to get memory usage
function getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = Math.floor((usedMem / totalMem) * 100);
    
    return {
        usage: Math.min(Math.max(usage, 0), 100),
        used: (usedMem / (1024 ** 3)).toFixed(2),
        total: (totalMem / (1024 ** 3)).toFixed(2)
    };
}

// Helper function to get uptime
function getUptime() {
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
}

// Simulate disk usage (in production, use actual disk monitoring)
function getDiskUsage() {
    return Math.floor(Math.random() * 30) + 50; // 50-80%
}

// Simulate network traffic
function generateNetworkData() {
    return {
        upload: (Math.random() * 5 + 1).toFixed(2),
        download: (Math.random() * 10 + 2).toFixed(2)
    };
}

// Simulate HTTP requests
function updateHTTPRequests() {
    httpRequestHistory.status200 += Math.floor(Math.random() * 50) + 100;
    httpRequestHistory.status400 += Math.floor(Math.random() * 10) + 2;
    httpRequestHistory.status500 += Math.floor(Math.random() * 5) + 1;
}

// Generate mock processes
function getTopProcesses() {
    const processes = [
        { name: 'node', pid: 1234, cpu: Math.random() * 30 + 10, ram: Math.random() * 20 + 5, status: 'running' },
        { name: 'nginx', pid: 5678, cpu: Math.random() * 20 + 5, ram: Math.random() * 15 + 3, status: 'running' },
        { name: 'postgres', pid: 9012, cpu: Math.random() * 25 + 8, ram: Math.random() * 30 + 10, status: 'running' },
        { name: 'redis', pid: 3456, cpu: Math.random() * 15 + 3, ram: Math.random() * 10 + 2, status: 'running' },
        { name: 'docker', pid: 7890, cpu: Math.random() * 20 + 5, ram: Math.random() * 25 + 8, status: 'running' }
    ];
    
    return processes.map(proc => ({
        ...proc,
        cpu: proc.cpu.toFixed(1),
        ram: proc.ram.toFixed(1)
    }));
}

// Generate mock logs
function generateLogs() {
    const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const messages = [
        'Server started successfully on port 3000',
        'Database connection established',
        'API request completed in 45ms',
        'Cache hit ratio: 87%',
        'Memory usage within normal range',
        'New client connected from 192.168.1.45',
        'Scheduled backup completed',
        'SSL certificate valid for 89 days',
        'Rate limit threshold reached for IP 10.0.0.23',
        'Authentication successful for user: admin'
    ];
    
    const logs = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
        const timestamp = new Date(now - i * 60000).toLocaleTimeString();
        const type = logTypes[Math.floor(Math.random() * logTypes.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        logs.push(`[${timestamp}] [${type}] ${message}`);
    }
    
    return logs;
}

// API Routes

// System Status
app.get('/api/status', (req, res) => {
    const cpu = getCPUUsage();
    const memory = getMemoryUsage();
    const disk = getDiskUsage();
    const uptime = getUptime();
    
    res.json({
        cpu: cpu,
        ram: memory.usage,
        ramUsed: memory.used,
        ramTotal: memory.total,
        disk: disk,
        uptime: uptime
    });
});

// Network Activity
app.get('/api/network', (req, res) => {
    const networkData = generateNetworkData();
    
    // Keep last 20 data points
    if (networkHistory.length > 20) {
        networkHistory.shift();
    }
    networkHistory.push({
        timestamp: new Date().toISOString(),
        ...networkData
    });
    
    res.json(networkData);
});

// HTTP Requests
app.get('/api/http', (req, res) => {
    updateHTTPRequests();
    
    res.json({
        status200: httpRequestHistory.status200,
        status400: httpRequestHistory.status400,
        status500: httpRequestHistory.status500
    });
});

// Active Connections and Processes
app.get('/api/connections', (req, res) => {
    const activeConnections = Math.floor(Math.random() * 50) + 20;
    const processes = getTopProcesses();
    
    res.json({
        active: activeConnections,
        processes: processes
    });
});

// System Logs
app.get('/api/logs', (req, res) => {
    const logs = generateLogs();
    res.json(logs);
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: "Arnav's Dashboard API",
        version: '1.0.0',
        endpoints: {
            status: '/api/status',
            network: '/api/network',
            http: '/api/http',
            connections: '/api/connections',
            logs: '/api/logs'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard API ready at http://localhost:${PORT}`);
});
