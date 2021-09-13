const express = require('express');

/* GET home page. */


module.exports = function (io) {
    const router = express.Router();
    router.post('/send_to_room', function (req, res, next) {
        try {
            const body = req.body;
            console.log(body)
            const {room, event = 'message', payload, owner = -777} = body;
            if (room) {
                io.to(room).emit(event, {
                    'payload': payload,
                    owner: owner
                })
            }

            return res.status(200).send({
                'error_code': '',
                'status': 1,
                'msg': '',
                'data': {}
            })
        } catch (e) {
            console.error(e)
            return res.status(200).send({
                'error_code': 'ERROR_SERVER',
                'status': 0,
                'data': {},
                'msg': 'unknown error'
            })
        }

    });
    return router
};
