// /services/socket.js (Phiên bản Nâng cấp)

const { Server } = require("socket.io");
const jwt = require('jsonwebtoken'); // Import JWT để xác thực

let io;

// NÂNG CẤP 1: Hỗ trợ nhiều thiết bị/tab
// Key: userId (string), Value: Set<socket.id> (Một tập hợp các socketId)
const userSockets = new Map();

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // NÂNG CẤP 3: Xử lý xác thực an toàn bằng JWT
    socket.on("authenticate", (token) => {
      try {
        if (!token) {
          console.log(`Socket ${socket.id} tried to authenticate without a token.`);
          return;
        }

        // Giải mã token để lấy userId một cách an toàn
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id.toString();

        console.log(`🔒 Authenticated socket ${socket.id} for user ${userId}`);

        // NÂNG CẤP 2: Tăng hiệu năng khi ngắt kết nối
        // Lưu userId trực tiếp vào đối tượng socket
        socket.userId = userId;

        // Thêm socket.id vào Set của user
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);

      } catch (error) {
        // Nếu token không hợp lệ, không làm gì cả
        console.log(`Authentication failed for socket ${socket.id}: ${error.message}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      
      // Lấy userId đã được lưu từ chính socket
      const userId = socket.userId;

      if (userId && userSockets.has(userId)) {
        const userSocketSet = userSockets.get(userId);
        userSocketSet.delete(socket.id); // Xóa socket.id khỏi Set

        // Nếu user không còn socket nào online, xóa luôn key userId khỏi Map
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Hàm này không còn cần thiết nữa vì getIo().to(socketId) là đủ
// const getUserSocketId = (userId) => { ... }

// Nâng cấp: Tạo hàm gửi sự kiện đến một user cụ thể (trên tất cả các thiết bị của họ)
const emitToUser = (userId, event, data) => {
    if (!io) return; // Không làm gì nếu socket chưa khởi tạo

    const userSocketSet = userSockets.get(userId.toString());
    if (userSocketSet && userSocketSet.size > 0) {
        // Gửi đến tất cả các socketId trong Set
        userSocketSet.forEach(socketId => {
            io.to(socketId).emit(event, data);
        });
    }
}


module.exports = { initSocket, getIo, emitToUser }; // Export hàm mới