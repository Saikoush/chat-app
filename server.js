(async () => {
  // Dynamically import the 'open' module correctly (ESM)
  const open = (await import('open')).default;

  const express = require('express');
  const path = require('path');
  const app = express();

  const PORT = process.env.PORT || 4000;
  const server = app.listen(PORT, async () => {
    const url = `http://localhost:${PORT}`;
    console.log(`💬 Server is running at: ${url}`);
    await open(url); // This will open the default browser automatically
  });

  const io = require('socket.io')(server);

  app.use(express.static(path.join(__dirname, 'public')));

  let socketsConected = new Set();

  io.on('connection', onConnected);

  function onConnected(socket) {
    console.log('Socket connected', socket.id);
    socketsConected.add(socket.id);
    io.emit('clients-total', socketsConected.size);

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
      socketsConected.delete(socket.id);
      io.emit('clients-total', socketsConected.size);
    });

    socket.on('message', (data) => {
      socket.broadcast.emit('chat-message', data);
    });

    socket.on('feedback', (data) => {
      socket.broadcast.emit('feedback', data);
    });
  }
})();
