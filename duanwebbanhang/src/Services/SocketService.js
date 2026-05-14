import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

<<<<<<< HEAD
    const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4321';
=======
    const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9

    this.socket = io(SOCKET_SERVER_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected:', this.socket.id);
<<<<<<< HEAD
      // Authenticate sau khi kết nối để backend map socketId với userId
      this.socket.emit('authenticate', token);
      console.log('Socket authenticate emitted');
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnectedStatus() {
    return this.isConnected && this.socket?.connected;
  }
}

const socketService = new SocketService();
export default socketService;
