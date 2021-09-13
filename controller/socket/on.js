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

const onEmit = (data, socket, io, cb = null) => {
    try {
        const {room, payload} = data;
        if (room) {
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
