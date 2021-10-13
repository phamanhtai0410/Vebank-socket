const {Server} = require("socket.io");
const {createAdapter} = require("@socket.io/redis-adapter");
const {Cluster} = require("ioredis");
require('dotenv').config()
const authHelper = require('../../helpers/auth')
const onHandler = require('./on')
const {genRoomForUser} = require("../../helpers/gen");
/*
* Config socket
* */
const pubClient = new Cluster(JSON.parse(process.env.REDIS_CLUSTER));

console.debug('REDIS_CLUSTER', process.env.REDIS_CLUSTER)

const subClient = pubClient.duplicate();

module.exports = function initSocket(server) {
    const io = new Server(server);


    io.adapter(createAdapter(pubClient, subClient));
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        const user = await authHelper.isAuth(token)
        console.log(user)
        if (user) {
            const {payload} = user;
            if (payload.id) {
                socket.user = payload
                const roomUser = genRoomForUser(payload.id)
                console.log('roomUser', roomUser)
                socket.join(roomUser)
                return next()
            }
        }
        const err = new Error("not_authorized");
        err.data = {content: "Please retry later"}; // additional details
        return next(err);
    });

    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        onHandler.onConnected(socket, io)

        socket.on('send_room', (args, cb) => onHandler.onSendRoom(args, socket, io, cb))
        socket.on('subscribe', (args, cb) => onHandler.onSubscribe(args, socket, io, cb))
        socket.on('unsubscribe', (args, cb) => onHandler.unSubscribe(args, socket, io, cb))
        socket.on('disconnecting', (reason) => {
            // ...
            console.error('disconnect', reason, Object.keys(socket.rooms), socket.rooms)
            onHandler.onDisconnected(socket, io)
            try {
                socket.rooms.forEach(room => onHandler.leftRoom(socket, room, io))
            } catch (e) {
                console.error(e)
            }
        });
        // socket.on('sendRoom', (args, cb) => onHandler.onEmit(args, socket, io, cb))
    });
    return io
}
