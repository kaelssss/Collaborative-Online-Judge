var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var nodeRestClient = require('node-rest-client').Client;
var restClient = new nodeRestClient();

var problemService = require('../services/problemService');

EXECUTOR_SERVER_URL = 'http://localhost:5000/build_and_run';

restClient.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST');

router.get('/problems', function(req, res) {
    problemService.getProblems().then(problems => {res.json(problems);});
});

router.get('/problems/:id', function(req, res) {
    var id = req.params.id;
    problemService.getProblem(+id).then(problem => {res.json(problem);});
});

router.post('/problems', jsonParser, function(req, res) {
    problemService.addProblem(req.body)
    .then(problem => {res.json(problem);},
            error => {res.status(400).send('already exist');});
});

router.post('/build_and_run', jsonParser, function(req, res) {
    let code = req.body.userCodes;
    let lang = req.body.lang;
    console.log('codes: '+code+'; in: '+lang);
    restClient.methods.build_and_run(
        {
            data: {
                code: code,
                lang: lang
            },
            headers: {'Content-Type': 'application/json'}
        },
        (data, response) => {
            console.log('from server: '+data);
            let text = `Build Output: ${data.build}
            Run Output: ${data.run}`;
            data.text = text;
            res.json(data);
        }
    );
});

module.exports = router;