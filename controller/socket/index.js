const {Server} = require("socket.io");
const {createAdapter} = require("@socket.io/redis-adapter");
const {Cluster} = require("ioredis");
require('dotenv').config()
const authHelper = require('../../helpers/auth')
const onHandler = require('./on')
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
                socket.user = payload.id
                socket.join(`user_${payload.id}`)
                return next()
            }
        }
        const err = new Error("not_authorized");
        err.data = {content: "Please retry later"}; // additional details
        return next(err);
    });

    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        socket.on('subscribe', (args, cb) => onHandler.onSubscribe(args, socket, io, cb))
        socket.on('unsubscribe', (args, cb) => onHandler.unSubscribe(args, socket, io, cb))
        // socket.on('sendRoom', (args, cb) => onHandler.onEmit(args, socket, io, cb))
    });

    return io
}
