const User = require("../../models/user.model");

module.exports = (res) => {
  _io.once('connection', (socket) => {
    socket.on("CLIENT_ADD_FRIEND", async (userId) => {
      const myUserId = res.locals.user.id;

      // console.log(myUserId); // Id của A
      // console.log(userId); // Id của B

      // Thêm id của A vào acceptFriends của B
      const existIdAinB = await User.findOne({
        _id: userId,
        acceptFriends: myUserId
      });

      if(!existIdAinB) {
        await User.updateOne({
          _id: userId
        }, {
          $push: { acceptFriends: myUserId }
        });
      }

      // Thêm id của B vào requestFriends của A
      const existIdBinA = await User.findOne({
        _id: myUserId,
        requestFriends: userId
      });
      
      if(!existIdBinA) {
        await User.updateOne({
          _id: myUserId
        }, {
          $push: { requestFriends: userId }
        });
      }


    });


    // Chức năng hủy yêu cầu
    socket.on("CLIENT_CANCEL_FRIEND", async (userId) => {
        const myUserId = res.locals.user.id;
    
        // console.log(myUserId); // Id của A
        // console.log(userId); // Id của B
    
        // Xóa id của A trong acceptFriends của B
        const existIdAinB = await User.findOne({
        _id: userId,
        acceptFriends: myUserId
        });
    
        if(existIdAinB) {
        await User.updateOne({
            _id: userId
        }, {
            $pull: { acceptFriends: myUserId }
        });
        }

        // Xóa id của B trong requestFriends của A
        const existIdBinA = await User.findOne({
            _id: myUserId,
            requestFriends: userId
        });
        
        if(existIdBinA) {
            await User.updateOne({
                _id: myUserId
            }, {
                $pull: { requestFriends: userId }
            });
        }
    });
  });
};