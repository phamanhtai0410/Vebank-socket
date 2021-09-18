const getTimeCurrentUTC = () => {
    const data = new Date();
    return new Date(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), data.getUTCHours(), data.getUTCMinutes(), data.getUTCSeconds()).getTime() / 1000
}
module.exports = {
    getTimeCurrentUTC
}
