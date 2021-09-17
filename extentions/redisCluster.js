const {Cluster} = require("ioredis");
const redisCluster = new Cluster(JSON.parse(process.env.REDIS_CLUSTER))

const incrRedisCluster = async (key, number = 1) => {
    const count = await redisCluster.incrbyfloat(key, number)
    console.log('count', count)
    return count
}
module.exports = {
    redisCluster: redisCluster,
    incrRedisCluster
}
