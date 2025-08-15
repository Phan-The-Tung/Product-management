const Chat  = require("../../models/chat.model");

module.exports = (res) => {
    const userId = res.locals.user.id;
    const fullName = res.locals.user.fullName;

    _io.once('connection', (socket) => {
        socket.on("CLIENT_SEND_MESSAGE", async (content) => {
            // Lưu vào database
            const chat = new Chat({
                user_id: userId,
                content: content
            });
            await chat.save();

            // Trả data về client
            _io.emit("SERVER_RETURN_MESSAGE", {
              userId: userId,
              fullName: fullName,
              content: content
          });
        });

        // Typing
        socket.on("CLIENT_SEND_TYPING", async (type) => {
          socket.broadcast.emit("SERVER_RETURN_TYPING", {
            userId: userId,
            fullName: fullName,
            type: type
          });
        });
        // End Typing
    });
}