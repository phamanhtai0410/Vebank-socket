const {isValidMessage} = require("../../helpers/valid");
const {inRoom} = require("../../helpers/rules");
const onSubscribe = (data, socket, io, cb = null) => {
    try {
        const {room} = data;
        if (room) {
            socket.join(room)
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
const unSubscribe = (data, socket, io, cb = null) => {
    try {
        const {room} = data;
        if (room) {
            socket.leave(room)
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
                        owner: socket.user,
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
    onEmit: onEmit
}
