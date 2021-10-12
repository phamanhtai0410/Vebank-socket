const {isValidMessage, isOID} = require("../../helpers/valid");
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
const MAP_KEY = '_#rinzRom#_'
const getKeyCountClientOfRoom = roomKey => `counters:rooms:${roomKey}`
const getKeyRecordUser = roomKey => `recorders:rooms:${roomKey}`
const getKeyLogRoom = roomKey => `logs:rooms:${roomKey}`
const genRoomKey = (author_id, room) => `${author_id}${MAP_KEY}${room}`
const logRoom = async (roomKey, event, payload) => {
    try {
        const key = getKeyLogRoom(roomKey)
        lPushArray(key, {
            'event': event,
            'payload': payload,
            'created_time': getTimeCurrentUTC(),
        })
    } catch (e) {
        console.error(e)
    }
}

const recordUser = async (roomKey, user) => {
    try {
        const key = getKeyRecordUser(roomKey)
        const has = await hSetRedis(key, user.id, {
            ...user,
            'devices': 1,
            'created_time': getTimeCurrentUTC()
        })
        console.log('recordUser has', has)
        if (has === 0) {
            const v = await hUpdateINCRBYFLOAT(key, user.id, 'devices', 1)
            return v
        }
        return has;
    } catch (e) {
        console.error(e)
    }
}

const joinRoom = async (socket, room, author_id) => {
    try {
        const roomKey = genRoomKey(author_id, room)
        const key = getKeyCountClientOfRoom(roomKey)
        console.log('roomKey', roomKey)
        socket.join(roomKey)
        const has = await recordUser(roomKey, socket.user)
        let countClients = 0
        console.log('recordUser ah', has)
        if (has === 1) {
            countClients = await incrRedisCluster(key, 1)
            console.log('send joined to room', roomKey, countClients)
            socket.to(roomKey).emit('joined', {
                payload: {
                    total_views: countClients,
                    member: socket.user,
                    room: room
                },
                user_id: -777
            })
        } else {
            countClients = Number(await getRedis(key))
        }
        logRoom(roomKey, 'joined', {
            'total_views': countClients,
            'user': socket.user
        })
        return countClients
    } catch (e) {
        console.error(e)
    }
    return 0
}
const leftRoom = async (socket, roomKey, io) => {
    try {
        let room = roomKey
        const key = getKeyCountClientOfRoom(roomKey)
        if (socket) {
            socket.leave(roomKey)
        }
        if (room.indexOf(MAP_KEY) !== -1) {
            room = roomKey.split(MAP_KEY)[1]
        }
        console.log('left room', room, key)
        const user = socket.user
        const _keyRecorder = getKeyRecordUser(roomKey)
        const currentRow = await hGetRedis(_keyRecorder, user.id)
        if (currentRow) {
            if (!currentRow?.devices || currentRow.devices === 1) {
                const countClients = await incrRedisCluster(key, -1)
                if (io && countClients > 0) {
                    io.to(roomKey).emit('left', {
                        payload: {
                            total_views: countClients,
                            member: user,
                            room: room
                        },
                        user_id: -777
                    })
                }
                logRoom(roomKey, 'left', {
                    'total_views': countClients,
                    'user': user
                })
            }
            hUpdateINCRBYFLOAT(_keyRecorder, user.id, 'devices', -1)
        }

    } catch (e) {
        console.error(e)
    }
    return 0
}
const onSubscribe = async (data, socket, io, cb = null) => {
    try {
        const {room, author_id} = data;
        console.log(data)
        if (room && isOID(room)) {
            if (!author_id) {
                console.log('cb', cb)
                if (cb) {
                    cb({
                        'error_code': 'ERROR_INVALID_ROOM',
                        'status': 0,
                        'data': {},
                        'msg': 'author_id is invalid'
                    })
                }
            } else {
                const countClients = await joinRoom(socket, room, author_id)
                console.log('countClients', countClients)
                if (cb) {
                    cb({
                        'error_code': '',
                        'status': 1,
                        'data': {
                            room: room,
                            total_views: countClients
                        },
                        'msg': 'success'
                    })
                }
            }
        } else {
            if (cb) {
                cb({
                    'error_code': 'ERROR_INVALID_ROOM',
                    'status': 0,
                    'data': {},
                    'msg': 'room is invalid'
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
        const {room, author_id} = data;
        if (room) {
            let roomKey = room
            if (author_id) {
                roomKey = genRoomKey()
            }
            if (isOID(room)) {
                leftRoom(socket, roomKey)
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
                        'error_code': 'ERROR_INVALID_ROOM',
                        'status': 0,
                        'data': {},
                        'msg': 'room is invalid'
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
const genKeyUserOnline = userId => `tracking:users:online:${userId}`;


const checkUserOnline = async userId => {
    try {
        const key = genKeyUserOnline(userId);
        const device = await getRedis(key, Number)
        console.log('checkUserOnline', userId, device)
        if (device > 0) {
            return true
        }
    } catch (e) {
        console.error(e)
    }
    return false
}

const onConnected = async (socket, io) => {
    try {
        const user = socket.user;
        const key = genKeyUserOnline(user.id)
        const device = await incrRedisCluster(key, 1)
        console.log('UserOnline', user, device)
    } catch (e) {
        console.error(e)
    }
}
const onDisconnected = async (socket, io) => {
    try {
        const user = socket.user;
        const key = genKeyUserOnline(user.id)
        const device = await incrRedisCluster(key, -1)
        console.log('UserOnline', user, device)
    } catch (e) {
        console.error(e)
    }
}
module.exports = {
    onSubscribe: onSubscribe,
    unSubscribe: unSubscribe,
    onEmit: onEmit,
    leftRoom: leftRoom,
    onConnected,
    onDisconnected,
    checkUserOnline,
    genRoomKey
}
