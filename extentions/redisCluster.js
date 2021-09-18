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
const hSetRedis = async (key, field, item = {}) => {
    try {
        const payload = JSON.stringify(item)
        const response = await redisCluster.hset(key, field, payload)
        return response
    } catch (e) {
        console.error(e)
    }
    return 0
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
module.exports = {
    redisCluster: redisCluster,
    incrRedisCluster,
    lPushArray,
    hSetRedis,
    getRedis
}
