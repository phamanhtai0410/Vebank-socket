const io = require("socket.io-client");
const host = 'http://localhost:5007'
let socket = io(host, {
    forceNew: true,
    transports: ["websocket"],
    auth: {
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJwYXlsb2FkIjp7ImlkIjoyNjY0LCJlbWFpbCI6bnVsbCwidXNlcm5hbWUiOm51bGwsInVzZXJfYXZhdGFyIjpudWxsLCJmdWxsX25hbWUiOm51bGx9LCJpYXQiOjE2Mjg1MDIwMDMsImV4cCI6MTY2MDAzODAwM30.IW54mLOMRvBwWnB61b6J2wVb8zgG_C7lPaQyfFEqtW-_rfCCXz--O_eXqks74Oh6RbwpHNqWoFT8mSPKOMctzPpz_QXx_T0FPw4AYV6EpDVIOjilHrl2WfR5DNaDwu4MuXBePXQJEq0NKmZU5t9tLPf0x8YKi3v6FE_TFCYtubGCtxlpF94dVSz1uacXvLG0LSGHYHk75RP_Ub9jUnZScDQsfBjgO1CIgpyhE8RQottKcaNduzsE1xmSuw0uevDKqp56tADKrVrlKyUUxta8ogCQfl_nZdtCjFkDy6ldM2s6RryiEtEioBM-ttQTLsgXPYYN1qkC2ae6M8wHq0Ns8w"
    }
});


socket.on("connect", () => {
    console.log('connected', socket.id, host);
    socket.emit("subscribe", {
        'room': '123456',
        'type': 'post'
    }, (response) => {
        console.log(response); // ok
        socket.emit("sendRoom", {
            'room': '123456',
            'payload': {
                'a': 1
            }
        }, (response2) => {
            console.log(response2); // ok
        })
    })

});

socket.on("message", (data) => {
    console.log('message', data);
});
socket.on("disconnect", () => {
    console.log('disconnected', socket.id);
});
socket.on("error", (e) => {
    console.log('error', e)
});
socket.on("connect_error", (err) => {
    console.log(err instanceof Error); // true
    console.log(err.message); // not authorized
    console.log(err.data); // { content: "Please retry later" }
});
