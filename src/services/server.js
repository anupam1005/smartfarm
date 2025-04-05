const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3002",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('🟢 New WebSocket Connection:', socket.id);
    socket.on('disconnect', () => {
        console.log('🔴 User Disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('Backend Server Running...');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
