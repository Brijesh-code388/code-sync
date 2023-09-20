const express = require('express');
const app = express();
const http = require('http');
const { type } = require('os');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./Actions');

const server = http.createServer(app);
const io = new Server(server);

// app.use(express.static('build'));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        // const clients = getAllConnectedClients(roomId);//remove
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        // console.log(clients)
        clients.forEach((socketId) => {
            //joined
            io.to(socketId).emit(ACTIONS.JOINED, {
                // clients,//remove
                username,
                socketId: socket.id,
            });
            console.log(userSocketMap[socketId])
            // add peer event send to all joined-user
            io.to(socketId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                username: username,
            });
            //add peer event send to me
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: socketId,
                createOffer: true,
                username: userSocketMap[socketId],
            });
        });
        socket.join(roomId);

        console.log(userSocketMap)
        console.log(clients)

    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.ISYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.ICODE_CHANGE, { code });
    });
    socket.on(ACTIONS.ICODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.ICODE_CHANGE, { code });
    });

    socket.on(ACTIONS.OSYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.OCODE_CHANGE, { code });
    });
    socket.on(ACTIONS.OCODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.OCODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_LAN, ({ socketId, language }) => {
        io.to(socketId).emit(ACTIONS.LAN_CHANGE, { language });
    });
    socket.on(ACTIONS.LAN_CHANGE, ({ roomId, language }) => {
        socket.in(roomId).emit(ACTIONS.LAN_CHANGE, { language });
    });

    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        });
    });

    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        });
    });

    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.MUTE_INFO, ({ userId, roomId, isMute }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            if (clientId !== socket.id) {
                console.log('mute info');
                io.to(clientId).emit(ACTIONS.MUTE_INFO, {
                    userId,
                    isMute,
                });
            }
        });
    });

    const leaveRoom = () => {
        const { rooms } = socket;
        Array.from(rooms).forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
            const clients = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            );
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: userSocketMap[socket.id]?.id,
                });

                // socket.emit(ACTIONS.REMOVE_PEER, {
                //     peerId: clientId,
                //     userId: socketUserMap[clientId]?.id,
                // });
            });
            socket.leave(roomId);
        });
        delete userSocketMap[socket.id];
        console.log(userSocketMap)
    };

    socket.on(ACTIONS.LEAVE, leaveRoom);

    socket.on('disconnecting', leaveRoom);

});

const PORT = 5000;
server.listen(process.env.PORT || PORT, () => console.log(`Listening on port ${PORT}`));
