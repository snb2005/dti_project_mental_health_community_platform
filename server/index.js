import express from 'express'
import dotenv from "dotenv"
import cookieParser from 'cookie-parser' 
import cors from "cors"
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import conversationRouter from './routes/conversationRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import forumRouter from './routes/forumRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import expertChatRouter from './routes/expertChatRoutes.js';
import expertApplicationRouter from './routes/expertApplicationRoutes.js';

dotenv.config();
const app = express();

// Increase payload limit for rich text content
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Updated CORS configuration
app.use(cors({
    origin: ["https://manobala.netlify.app","http://localhost:5173"] , // Allows requests from any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("Hello World");
})
connectDB();
const port=process.env.PORT|| 5000;

app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/conversations', conversationRouter)
app.use('/api/blogs', blogRouter);
app.use('/api/admin', adminRouter)
app.use('/api/expert-chat', expertChatRouter)
app.use('/api/expert-applications', expertApplicationRouter)

// Create HTTP server first
const httpServer = createServer(app);

// Initialize Socket.IO with proper configuration
const io = new Server(httpServer, {
    cors: {
        origin: ["https://manobala.netlify.app","http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    },
    path: '/socket.io/',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    transports: ['polling', 'websocket']
});

// Store socket instance in app for use in routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinExpertChat', (chatId) => {
        const roomId = `expert-chat-${chatId}`;
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined expert chat room: ${roomId}`);
        socket.emit('joinedRoom', { room: roomId });
    });

    socket.on('leaveExpertChat', (chatId) => {
        const roomId = `expert-chat-${chatId}`;
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left expert chat room: ${roomId}`);
    });

    socket.on('joinRoom', (roomId) => {
        if (!roomId.startsWith('expert-chat-')) {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined forum room: ${roomId}`);
        }
    });

    socket.on('leaveRoom', (roomId) => {
        if (!roomId.startsWith('expert-chat-')) {
            socket.leave(roomId);
            console.log(`Socket ${socket.id} left forum room: ${roomId}`);
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('User disconnected:', socket.id, 'Reason:', reason);
    });
});

// Add forum routes
app.use('/api/forum', forumRouter);

// Start the server
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Socket.IO server initialized');
});





