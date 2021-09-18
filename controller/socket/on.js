const {isValidMessage} = require("../../helpers/valid");
const {inRoom} = require("../../helpers/rules");
const {
    incrRedisCluster,
    hSetRedis,
    getRedis,
    hUpdateINCRBYFLOAT,
    hGetRedis,
    lPushArray
} = require("../../extentions/redisCluster");
const {getTimeCurrentUTC} = require("../../helpers/datetime");
const getKeyCountClientOfRoom = room => `counters:rooms:${room}`
const getKeyRecordUser = room => `recorders:rooms:${room}`
const getKeyLogRoom = room => `logs:rooms:${room}`
const logRoom = async (room, event, payload) => {
    try {
        const key = getKeyLogRoom(room)
        lPushArray(key, {
            'event': event,
            'payload': payload,
            'created_time': getTimeCurrentUTC(),
        })
    } catch (e) {
        console.error(e)
    }
}

const recordUser = async (room, user) => {
    try {
        const key = getKeyRecordUser(room)
        const has = await hSetRedis(key, user.id, {
            ...user,
            'devices': 1,
            'created_time': getTimeCurrentUTC()
        })
        if (has === 0) {
            hUpdateINCRBYFLOAT(key, user.id, 'devices', 1)
        }
        return has;
    } catch (e) {
        console.error(e)
    }
}

const joinRoom = async (socket, room) => {
    try {
        const key = getKeyCountClientOfRoom(room)
        socket.join(room)
        const has = await recordUser(room, socket.user)
        let countClients = 0
        if(has===1) {
            countClients = await incrRedisCluster(key, 1)
            socket.to(room).emit('joined', {
                payload: {
                    total_views: countClients,
                    member: socket.user,
                    room: room
                },
                user_id: -777
            })
        } else {
            countClients = await getRedis(key)
        }
        logRoom(room, 'joined', {
            'total_views': countClients,
            'user': socket.user
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
        if (socket) {
            socket.leave(room)
        }
        const user = socket.user
        const _keyRecorder = getKeyRecordUser(room)
        const currentRow = await hGetRedis(_keyRecorder, user.id)
        if (currentRow) {
            if (!currentRow?.devices || currentRow.devices === 1) {
                const countClients = await incrRedisCluster(key, -1)
                if (io && countClients > 0) {
                    io.to(room).emit('left', {
                        payload: {
                            total_views: countClients,
                            member: user,
                            room: room
                        },
                        user_id: -777
                    })
                }
                logRoom(room, 'left', {
                    'total_views': countClients,
                    'user': user
                })
            }
            hUpdateINCRBYFLOAT(_keyRecorder, user.id, 'devices', -1)
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
