const {Cluster} = require("ioredis");
const redisCluster = new Cluster(JSON.parse(process.env.REDIS_CLUSTER))

const incrRedisCluster = async (key, number = 1) => {
    try {
        const count = await redisCluster.incrbyfloat(key, number)
        return Number(count)
    } catch (e) {
        console.error(e)
    }
    return 0
}
const lPushArray = async (key, item = {}) => {
    try {
        const payload = JSON.stringify(item)
        const count = await redisCluster.lpush(key, payload)
        return Number(count)
    } catch (e) {
        console.error(e)
    }
    return 0
}

const hGetRedis = async (key, field) => {
    try {
        const _row = await redisCluster.hget(key, String(field))
        if (_row) {
            return JSON.parse(_row)
        }
    } catch (e) {
        console.error(e)
    }
    return {}

}
/*
* @param {String} key
* @param {String} field
* @param {Object} item
* return:
*  - 0: has exists
*  - 1: save successfully
* */
const hSetRedis = async (key, field, item = {}) => {
    try {
        const payload = JSON.stringify(item)
        const has = await redisCluster.hexists(key, field)
        console.log('hexists', key, field)
        if (has === 0) {
            const response = await redisCluster.hset(key, field, payload)
            return Number(response)
        }
    } catch (e) {
        console.error(e)
    }
    return 0
}
const hUpdateRedis = async (key, field, payload) => {
    try {
        const currentRow = await hGetRedis(key, field)
        const update = {
            ...currentRow,
            ...payload
        }
        const _payload = JSON.stringify(update)
        await  redisCluster.hset(key, field, _payload)
    } catch (e) {
        console.error(e)
    }
}
const getRedis = async (key, type = null) => {
    try {
        const val = await redisCluster.get(key)
        if (type) {
            return type(val)
        }
        return val
    } catch (e) {
        console.error(e)
    }
    return ''
}
const hUpdateINCRBYFLOAT = async (key, field, fieldKey, number) => {
    try {
        const currentRow = await hGetRedis(key, field)
        if(typeof currentRow[fieldKey] !== 'number') {
            currentRow[fieldKey] = 0
        }
        const update = {
            ...currentRow,
            [fieldKey]: currentRow[fieldKey] + number
        }

        const _payload = JSON.stringify(update)
        await  redisCluster.hset(key, field, _payload)

        return update[fieldKey]
    } catch (e) {
        console.error(e)
        return false
    }
}
module.exports = {
    redisCluster: redisCluster,
    incrRedisCluster,
    lPushArray,
    hSetRedis,
    getRedis,
    hUpdateRedis,
    hUpdateINCRBYFLOAT,
    hGetRedis
}
