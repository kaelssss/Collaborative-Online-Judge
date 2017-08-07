var redisClient = require('../modules/redisClient.js');

const TIMEOUT_IN_SEC = 3600;

var welcome = function(io) {
    // array of array in js: array
    var problemToCollabors = [];
    var collaborToProblem = [];

    var sessionPath = '/oj-server/';

    io.on('connection', (sck) => {
        let sessionId = sck.handshake.query['sessionId'];
        collaborToProblem[sck.id] = sessionId;
        if(sessionId in problemToCollabors) {
            problemToCollabors[sessionId].collabors.push(sck.id);
        }
        else {
            redisClient.get(sessionPath + sessionId, (data) => {
                if(data) {
                    console.log('this problem was visited by some extincted species');
                    // new struct of p2c:
                    // cW: a list of 3-ele-lists, saving ['change', changedContent, time]
                    // collabors: who are working on this problem
                    problemToCollabors[sessionId] = {
                        'cachedWorks': JSON.parse(data),
                        'collabors': []
                    };
                }
                else {
                    console.log('a brand new world here');
                    problemToCollabors[sessionId] = {
                        'cachedWorks': [],
                        'collabors': []
                    };
                }
                problemToCollabors[sessionId].collabors.push(sck.id);
            });
        }

        sck.on('change', delta => {
            console.log('change ' + collaborToProblem[sck.id] + ' ' + delta);
            let sessionId = collaborToProblem[sck.id];
            if(sessionId in problemToCollabors) {
                problemToCollabors[sessionId].cachedWorks.push(
                    ['change', delta, Date.now()]
                );
            }
            else {
                console.log('oops');
            }
            forwardEvent(sck.id, 'change', delta);
        });

        sck.on('cursorMove', cursor => {
            console.log('cursorMove ' + cursor);
            cursorObj = JSON.parse(cursor);
            cursorObj.sckId = sck.id;
            cursor = JSON.stringify(cursorObj);
            forwardEvent(sck.id, 'cursorMove', cursor);
        });

        sck.on('restoreBuffer', () => {
            let sessionId = collaborToProblem[sck.id];
            console.log('loading previous works to: '+sck.id);
            if(sessionId in problemToCollabors) {
                let cachedWorks = problemToCollabors[sessionId].cachedWorks;
                for(let i=0; i<cachedWorks.length; i++) {
                    sck.emit(cachedWorks[i][0], cachedWorks[i][1]);
                }
            }
            else {
                console.log('oops');
            }
        });

        sck.on('disconnect', () => {
            let sessionId = collaborToProblem[sck.id];
            console.log('this guy is leaving: '+sck.id);
            if(sessionId in problemToCollabors) {
                let collabors = problemToCollabors[sessionId].collabors;
                let index = collabors.indexOf(sck.id);
                if(index >= 0) {
                    collabors.splice(index, 1);
                    if(collabors.length===0) {
                        console.log('a civilization just extincted');
                        let key = sessionPath+sessionId;
                        let val = JSON.stringify(problemToCollabors[sessionId].cachedWorks);
                        redisClient.set(key, val, redisClient.redisPrint);
                        redisClient.expire(key, TIMEOUT_IN_SEC);
                        delete problemToCollabors[sessionId];
                    }
                }
                else {
                    console.log('oops');
                }
            }
            else {
                console.log('oops');
            }
        });
    });

    let forwardEvent = function(sckId, eventName, dataString) {
        let sessionId = collaborToProblem[sckId];
        if (sessionId in problemToCollabors) {
            let collabors = problemToCollabors[sessionId].collabors;
            for (let i = 0; i < collabors.length; i++) {
                if (sckId != collabors[i]) {
                    io.to(collabors[i]).emit(eventName, dataString);
                }
            }
        } else {
            console.log('oops');
        }
    }
};

module.exports = {
    welcome: welcome
};