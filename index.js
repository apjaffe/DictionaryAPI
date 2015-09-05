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

app.get('/get_difficulty', function(req, resp) {
    url = "http://dictionary.reference.com/browse/" + req.query.word;

    request(url, function(error, inner_resp, html){
        if(!error){
            var $ = cheerio.load(html);
            var difficulty = $('#difficulty-box').attr("data-difficulty");
            resp.json({"difficulty": difficulty});
        }
        else {
            resp.json({"error": error});
        }
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


