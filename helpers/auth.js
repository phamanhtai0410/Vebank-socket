const jwt = require('jsonwebtoken')
const isAuth = (token) => new Promise(async resolve => {
    try {
        const decoded = await jwt.decode(token)
        if (decoded) {
            return resolve(decoded)
        }
        return resolve(false)
    } catch (e) {
        resolve(false)
    }
})

module.exports = {
    isAuth:isAuth
}
