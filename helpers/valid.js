const blackList = require('../constants/blackList')
const bluebird = require('bluebird')
const {ObjectID} = require("mongodb")
function isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }
    return false;
}

const isValidMessage = payload => new Promise(async resolve => {
    if (isJson(payload)) {
        const {content = ''} = payload;
        let b = true;
        if (content) {
            await bluebird.map(blackList, w => {
                if (content.indexOf(w) !== -1) {
                    b = false
                }
            })
            resolve(b)
        } else {
            resolve(false)
        }
    } else {
        resolve(false)
    }

})
const isOID = _id => ObjectID.isValid(_id)
module.exports = {
    isValidMessage: isValidMessage,
    isOID,
    isJson
}
