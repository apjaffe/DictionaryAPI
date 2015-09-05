var express = require('express');
var request = require('request'); 
var cheerio = require('cheerio'); 
var async = require('async');
var app = express();
app.set('port', (process.env.PORT || 5000));

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

//app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});


var difficulty_cache = {};
var definition_cache = {};
var synonym_cache = {};

var dictionary_queue = async.queue(fetch_dictionary_data, 10); // Run ten simultaneous scrapes
var synonym_queue = async.queue(fetch_synonym, 10);

dictionary_queue.drain = function() {
    console.log("All dictionary data is fetched");
};
synonym_queue.drain = function() {
    console.log("All synonym data is fetched");
};

function fetch_dictionary_data(word, callback) {
    var url = "http://dictionary.reference.com/browse/" + word;
    request(url, function(error, inner_resp, html){
        if(!error){
            var $ = cheerio.load(html);
            var difficulty = $('#difficulty-box').attr("data-difficulty");
            var definition = $('.def-content').first().text();
            if(difficulty) {
                difficulty_cache[word] = difficulty;
            }
            if(definition) {
                definition_cache[word] = definition;
            }
            var data = {"difficulty": difficulty, "definition": definition};
            callback(data);
        }
        else {
            callback(null);
        }
    });
}

/* Input: word
 * Output: Callback on (synonym of word with low difficulty rating
 *                      OR empty string if no synonyms found)
 * TODO: Figure out better way to get best synonym -- for example, the word
 *       "hit" can be either a verb or a noun
 */
function fetch_synonym(word, callback) {
    url = 'http://www.thesaurus.com/browse/' + word;

    request(url, function(error, inner_resp, html){
        if(!error) {
            var $ = cheerio.load(html);
            var synonyms = [];

            /* Populate 'synonyms' with all synonyms of highest relevance */
            $('.relevancy-list ul').find('li a').filter(function(idx, elem) {
                return JSON.parse($(this).attr('data-category')).name === 'relevant-3';
            }).each(function(idx, elem) {
                synonyms[idx] = $(this).find('.text').text();
            });

            /* If no highly relevant synonyms found, just get any synonyms */
            if (synonyms.length === 0) {
                $('.relevancy-list ul').find('li .text').each(function(idx, elem) {
                    synonyms[idx] = $(this).text();
                });
            }

            /* If no synonyms found at all, return empty string */
            if (synonyms.length === 0) {
                callback(null);
            }

            /* Get least difficult synonym out of list. */
            /* JS, what the fuck? */
            var min_difficult_synonym;
            var min_difficulty = Infinity;
            var count = 0;
            for (i = 0; i < synonyms.length; i++) {
                get_difficulty(synonyms[i], (function(idx) { return function(difficulty) {
                    if (difficulty < min_difficulty) {
                        min_difficulty = difficulty;
                        min_difficult_synonym = synonyms[idx];
                    }

                    count++;
                    if (count === synonyms.length) {
                        synonym_cache[word] = min_difficult_synonym;
                        callback(min_difficult_synonym);
                    }
                }})(i));
            }
        }
        else {
            callback(null);
        }
    });
}

function get_definition(word, callback) {
    if(definition_cache[word] !== undefined) {
        callback(definition_cache[word]);
    }
    else {
        dictionary_queue.push(word, function(data) {
            callback(definition_cache[word]);
        });
    }
}


function get_difficulty(word, callback) {
    if(difficulty_cache[word] !== undefined) {
        callback(difficulty_cache[word]);
    }
    else {
        dictionary_queue.push(word, function(data) {
            callback(difficulty_cache[word]);
        });
    }
}

function get_synonym(word, callback) {
    if (synonym_cache[word] !== undefined) {
        callback(synonym_cache[word]);
    }
    else {
        synonym_queue.push(word, function(data) {
            callback(synonym_cache[word]);
        });
    }
}

app.get('/get_definition', function(req, resp) {
    get_definition(req.query.word, function(definition) {
        resp.json({"definition": definition});
    });
});

app.get('/get_difficulty', function(req, resp) {
    get_difficulty(req.query.word, function(difficulty) {
        resp.json({"difficulty": difficulty});
    });
});

//Use post requests to handle large numbers of words
app.post('/get_difficulties', function(req, resp) {
    var words = JSON.parse(req.body.words);
    var dict = {};
    var count = 0;
    for(var i=0; i<words.length; i++) {
        get_difficulty(words[i], (function(index) { return function(difficulty) {
            dict[words[index]] = difficulty;
            count++;
            if(count === words.length) {
                // all results ready
                resp.json(dict);
            }
        } })(i));
    }
});

app.get('/get_synonym', function(req, resp) {
    get_synonym(req.query.word, function(synonym) {
        resp.json({'synonym': synonym});
    });
});

app.post('/get_synonyms', function(req, resp) {
    var words = JSON.parse(req.body.words);
    var dict = {};
    var count = 0;
    for (var i = 0; i < words.length; i++) {
        get_synonym(words[i], (function(index) { return function(synonym) {
            dict[words[index]] = synonym;
            count++;
            if (count === words.length) {
                resp.json(dict);
            }
        }})(i));
    }
});

//Use post requests to handle large numbers of words
app.post('/get_definitions', function(req, resp) {
    var words = JSON.parse(req.body.words);
    var dict = {};
    var count = 0;
    for(var i=0; i<words.length; i++) {
        get_definition(words[i], (function(index) { return function(definition) {
            dict[words[index]] = definition;
            count++;
            if(count === words.length) {
                // all results ready
                resp.json(dict);
            }
        }})(i));
    }
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
