const io = require("socket.io-client");
// const host = 'https://socket-staging.rinznetwork.com'
const host = 'http://127.0.0.1:3000'
const token_1 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJwYXlsb2FkIjp7ImlkIjo2NiwidXNlcl9uYW1lIjpudWxsLCJ1c2VyX2F2YXRhciI6Imh0dHBzOi8vc3RhdGljLnRoZWN1YXR1aS5uZXQvdGhlY3VhdHVpL2ltYWdlcy8yMDIxLzA4LzIyLzE2Mjk1ODAzOTIuNjY4OTEzX1JpblotMTAyNC5wbmciLCJ1c2VyX2Z1bGxfbmFtZSI6IlZcdTAwZjUgTWluaCBUclx1MWVhMW0ifSwiaWF0IjoxNjM0MDIzMzg4LCJleHAiOjE2NjU1NTkzODh9.bstZB7ySAbOyfYfr7-rAuLsgJYi0EDe5SFz5HvkCFAEWnAp-zPo7AtZTV8Go929wgy5wbarKg6_WZzSHs4yJxR9A0WpEYTOZkCAHhNXNJLTRi6CLKhVglqgTXyDwMKnTkGBdYoHYyWGfHcz6N-G0UlinlfhszK3rTD1YkBinXf8NBLTx7Wz1iPvaJwdcRh5jwGcNUhzX4F1vUaH6spMqBdYx6uaJE7scDIxZwQ5NlicQVgKDpolRyLg_sOT0TY4gaUiwYMUdXRYGwpWq52V8EPdp1K8kIcyp_qrb4l2zm2gPFEry__EWwpCcjL6uaiB1b8gZYftue-1V1UgQngp7tg"
const token_2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJwYXlsb2FkIjp7ImlkIjoxODEsInVzZXJfbmFtZSI6bnVsbCwidXNlcl9hdmF0YXIiOiJodHRwczovL3N0YXRpYy50aGVjdWF0dWkubmV0L3RoZWN1YXR1aS9pbWFnZXMvMjAyMS8wNy8yNy8xNjI3MzY4MDk0Ljk2NTAyXzM4MDk2OTUuanBnIiwidXNlcl9mdWxsX25hbWUiOiJJZ25vcmFudCBwZXJzb24gW1N0dXBpZF0ifSwiaWF0IjoxNjM0MDI3MDM1LCJleHAiOjE2NjU1NjMwMzV9.Yu-i3bod4WbiDn-XhxH_e4o9tDDp_orbYFq5T5CVzHTitUjEWo9KAWBQVBSScE1m258PAklJ9YCTIF8cHyRQagmkITKo35KxQK2G4wuFVXO1KwYd0m2Dg1jh2nf3RdvnxJJkabPmDa4lUnWUNrjb4AzFT45ETLDiobj-qZ2kDWN5cbNVIeQ1R8IPM4_F5ECGQc_yJ3x_dCXLWnDJcJw-76s08xavSVGwPcJr7U2I2GVY2QcJGGP9ag7kRYyLUk-zWcahyJAf0PcO_I4Kk5Xkg6gx9LM-Mb6M3vCvZ7FWu9yRP-ZqtgJ_cUJZAqpwqQFPqgkXZnB2-JN-KXs_a0Oaxw"
let socket = io(host, {
    forceNew: true,
    transports: ["websocket"],
    auth: {
        token: token_1
    }
});


socket.on("connect", () => {
    console.log('connected', socket.id, host);
    socket.emit("subscribe", {
        'room': '6157739dec1491a89f942b61',
        'author_id': 66
    }, (response) => {
        console.log(response); // ok
        socket.emit("send_room", {
            'room': '6157739dec1491a89f942b61',
            'author_id': 66,
            'type': 'activity',
            "meta": {
                "action": "heard"
            }
        }, (response) => {
            console.log(response); // ok
        })
    })

});
socket.on("joined", (data) => {
    console.log('joined', data);
});
socket.on("in_room", (data) => {
    console.log('in_room', data);
});
socket.on("left", (data) => {
    console.log('left', data);
});

socket.on("live_chat", (data) => {
    console.log('live_chat', data);
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
