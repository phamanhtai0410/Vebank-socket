const blackList = require('../constants/blackList')
const bluebird = require('bluebird')

const isValidMessage = text => new Promise(async resolve => {
    let b = true;
    await bluebird.map(blackList, w => {
        if (text.indexOf(w) !== -1) {
            b = false
        }
    })
    resolve(b)
})

module.exports = {
    isValidMessage: isValidMessage
}
