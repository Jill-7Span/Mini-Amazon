const Redis = require('redis');
const redisClient = Redis.createClient();

// "redis-commander": "^0.8.0",    in  package.json

exports.getCacheData = async (id) => {
    try {
        await redisClient.connect();
        const cacheData = await redisClient.GET(`cacheData.${id}`);
        console.log("Cache Hit");
        return cacheData;
    } catch (error) {
        return error;
    } finally {
        redisClient.quit();
    }
};

exports.setCacheData = async (id, newCacheData) => {
    try {
        await redisClient.connect();
        const cacheData = await redisClient.SET(`cacheData.${id}`, JSON.stringify(newCacheData));
        await redisClient.expire(`cacheData.${id}`, CACHE_EXPIRE_TIME);
        console.log("Cache Miss And Set");
        return cacheData;
    } catch (error) {
        return error;
    } finally {
        redisClient.quit();
    }
};

exports.deleteCacheData = async (id) => {
    try {
        await redisClient.connect();
        await redisClient.DEL(`cacheData.${id}`);
        console.log("Delete Cache");
    } catch (error) {
        return error;
    }finally{
        redisClient.quit();
    }
};