const {isValidMessage} = require("../../helpers/valid");
const {inRoom} = require("../../helpers/rules");
const {incrRedisCluster} = require("../../extentions/redisCluster");
const getKeyCountClientOfRoom = room => `counters:rooms:${room}`

const joinRoom = async (socket, room) => {
    try {
        const key = getKeyCountClientOfRoom(room)
        socket.join(room)
        const countClients = await incrRedisCluster(key, 1)
        socket.to(room).emit('joined', {
            payload: {
                total_views: countClients,
                member: socket.user
            },
            user_id: -777
        })
        return countClients
    } catch (e) {
        console.error(e)
    }
    return  0
}
const leftRoom = async (socket, room, io) => {
    try {
        const key = getKeyCountClientOfRoom(room)
        if(socket) {
            socket.leave(room)
        }
        const countClients = await incrRedisCluster(key, -1)
        if(io) {
            io.to(room).emit('left', {
                payload: {
                    total_views: countClients,
                    member: socket.user
                },
                user_id: -777
            })
        }
    } catch (e) {
        console.error(e)
    }
    return  0
}
const onSubscribe = async (data, socket, io, cb = null) => {
    try {
        const {room} = data;
        if (room) {
            const  countClients = await joinRoom(socket, room)
            if (cb) {
                cb({
                    'error_code': '',
                    'status': 1,
                    'data': {
                        room:room,
                        total_views: countClients
                    },
                    'msg': 'success'
                })
            }
        }

    } catch (e) {
        console.error(e)
        if (cb) {
            cb({
                'error_code': 'ERROR_SERVER',
                'status': 0,
                'data': {},
                'msg': 'unknown error'
            })
        }
    }
}
const unSubscribe = (data, socket, io, cb = null) => {
    try {
        const {room} = data;
        if (room) {
            leftRoom(socket, room)
            if (cb) {
                cb({
                    'error_code': '',
                    'status': 1,
                    'data': {},
                    'msg': 'success'
                })
            }
        }

    } catch (e) {
        console.error(e)
        if (cb) {
            cb({
                'error_code': 'ERROR_SERVER',
                'status': 0,
                'data': {},
                'msg': 'unknown error'
            })
        }
    }
}

const onEmit = async (data, socket, io, cb = null) => {
    try {
        const {room, payload} = data;
        console.log(room, payload)
        if (room) {
            const inR = await inRoom(socket, room)
            if (inR) {
                const isValid = await isValidMessage(payload)
                if (isValid) {
                    if (!payload?.user?.user_name) {
                        if (cb) {
                            cb({
                                'error_code': 'INVALID_USER',
                                'status': 0,
                                'data': {},
                                'msg': 'Invalid user'
                            })
                        }
                        return null;
                    }
                    io.to(room).emit('message', {
                        owner: socket?.user?.id,
                        payload: payload
                    })
                    if (cb) {
                        cb({
                            'error_code': '',
                            'status': 1,
                            'data': {},
                            'msg': 'success'
                        })
                    }
                } else {
                    if (cb) {
                        cb({
                            'error_code': 'INVALID_MESSAGE',
                            'status': 0,
                            'data': {},
                            'msg': 'Invalid message'
                        })
                    }
                }
            } else {
                if (cb) {
                    cb({
                        'error_code': 'NOT_IN_ROOM',
                        'status': 0,
                        'data': {},
                        'msg': 'not in this room'
                    })
                }
            }
        }

    } catch (e) {
        console.error(e)
        if (cb) {
            cb({
                'error_code': 'ERROR_SERVER',
                'status': 0,
                'data': {},
                'msg': 'unknown error'
            })
        }
    }
}


module.exports = {
    onSubscribe: onSubscribe,
    unSubscribe: unSubscribe,
    onEmit: onEmit,
    leftRoom: leftRoom
}
