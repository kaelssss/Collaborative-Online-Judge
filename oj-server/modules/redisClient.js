var redis = require('redis');
var client = redis.createClient();

var set = function(key, val, callback) {
    client.set(key, val, function(err, res) {
        if(err) {
            console.log(err);
            return;
        }
        else {
            callback(res);
        }   
    });
}

var get = function(key, callback) {
    client.get(key, function(err, res) {
        if(err) {
            console.log(err);
            return;
        }
        else {
            callback(res);
        }   
    });
}

function expire(key, timeInSeconds) {
    client.expire(key, timeInSeconds);
}

function quit() {
    client.quit();
}

module.exports = {
    get: get,
    set: set,
    expire: expire,
    quit: quit,
    redisPrint: redis.print
}