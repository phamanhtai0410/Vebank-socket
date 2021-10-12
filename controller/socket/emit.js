const express = require('express');
const {isOID} = require("../../helpers/valid");
const bluebird = require("bluebird");
const {checkUserOnline, genRoomKey} = require("./on");
const {genRoomForUser} = require("../../helpers/gen");
const {getTimeCurrentUTC} = require("../../helpers/datetime");

/* GET home page. */


module.exports = function (io) {
    const router = express.Router();
    router.post('/send_to_room', async function (req, res, next) {
        try {
            const body = req.body;
            console.log(body)
            const {
                room,
                event = 'message',
                payload,
                owner = -777,
                type = "public",
                users = [],
                author_id
            } = body;
            if (!isOID(room)) {
                return res.status(200).send({
                    'error_code': 'ERROR_INVALID',
                    'status': 0,
                    'data': {},
                    'msg': 'room is invalid',
                    'time': getTimeCurrentUTC(),
                    'version': 'v1'
                })
            }

            if (type === 'public') {
                if (!author_id) {
                    return res.status(200).send({
                        'error_code': 'ERROR_INVALID',
                        'status': 0,
                        'data': {},
                        'msg': 'author_id is invalid',
                        'time': getTimeCurrentUTC(),
                        'version': 'v1'
                    })
                }
                io.to(genRoomKey(author_id, room)).emit(event, {
                    'payload': payload,
                    'room': room,
                    'owner': owner,

                    'time': getTimeCurrentUTC(),
                    'version': 'v1'
                })
                return res.status(200).send({
                    'error_code': '',
                    'status': 1,
                    'msg': '',
                    'data': {},
                    'time': getTimeCurrentUTC(),
                    'version': 'v1'
                })
            }
            if (type === 'private') {
                if (!Array.isArray(users) || users.length === 0) {
                    return res.status(200).send({
                        'error_code': 'ERROR_INVALID',
                        'status': 0,
                        'data': {},
                        'msg': 'users is invalid (len >= 1)',
                        'time': getTimeCurrentUTC(),
                        'version': 'v1'
                    })
                }
                const offlineUsers = [];
                await bluebird.map(users, async userId => {
                    try {
                        const isOnline = await checkUserOnline(userId)
                        if (isOnline) {
                            const roomUser = genRoomForUser(userId)
                            io.to(roomUser).emit(event, {
                                'payload': payload,
                                'room': room,
                                'owner': owner,
                                'time': getTimeCurrentUTC(),
                                'version': 'v1'
                            })
                        } else {
                            offlineUsers.push(userId)
                        }
                    } catch (e) {
                        console.error(e)
                    }
                })
                return res.status(200).send({
                    'error_code': '',
                    'status': 1,
                    'msg': '',
                    'data': {
                        'offline_users': offlineUsers
                    },
                    'time': getTimeCurrentUTC(),
                    'version': 'v1'
                })
                //    checkUserOnline
            }
            return res.status(200).send({
                'error_code': 'ERROR_INVALID',
                'status': 0,
                'data': {},
                'msg': 'type is invalid (public or private)',
                'time': getTimeCurrentUTC(),
                'version': 'v1'
            })
        } catch (e) {
            console.error(e)
            return res.status(200).send({
                'error_code': 'ERROR_SERVER',
                'status': 0,
                'data': {},
                'msg': 'unknown error',

                'time': getTimeCurrentUTC(),
                'version': 'v1'
            })
        }

    });
    return router
};
