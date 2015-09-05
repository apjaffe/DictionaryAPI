var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

var difficulty_cache = {};

function get_difficulty(word, callback) {
    if(difficulty_cache[word] !== undefined) {
        callback(difficulty_cache[word]);
    }

    var url = "http://dictionary.reference.com/browse/" + word;

    request(url, function(error, inner_resp, html){
        if(!error){
            var $ = cheerio.load(html);
            var difficulty = $('#difficulty-box').attr("data-difficulty");
            difficulty_cache[word] = difficulty;
            callback(difficulty);
        }
        else {
            callback(null);
        }
    });
}

app.get('/get_difficulty', function(req, resp) {
    get_difficulty(req.query.word, function(difficulty) {
        resp.json({"difficulty": difficulty});
    });
});

app.get('/get_difficulties', function(req, resp) {
    var words = JSON.parse(req.query.words);
    var dict = {};
    var count = 0;
    for(var i=0; i<words.length; i++) {
        get_difficulty(words[i], (function(index) { return function(difficulty) {
            dict[words[index]] = difficulty;
            count++;
            if(count == words.length) {
                // all results ready
                resp.json(dict);
            }
        } })(i));
    }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


