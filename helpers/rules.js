const inRoom = (socket, room) => new Promise(resolve => {
    try {
        if (socket.rooms.has(room)) {
            return  resolve(true)
        }
        return resolve(false)
    } catch (e) {
        console.error(e)
        return resolve(false)
    }
})
module.exports = {
    inRoom
}
