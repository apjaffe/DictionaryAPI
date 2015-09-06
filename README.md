# DictionaryAPI

Backend for [this repository](https://github.com/erkyz/MyDictionary).

## Functionality
Finds difficulty ratings, definitions, and synonyms of words by DDOSing
dictionary.com.

## Endpoints
* GET `/get_definition`
  * key: word
  * returns: {definition: (string)}
* GET `/get_difficulty`
  * key: word
  * returns: {difficulty: (int)}
* GET `/get_synonym
  * key: word
  * returns: {difficulty: (string)}
* POST `/get_definitions`
  * key: words (array of strings)
  * returns: {(dict of key=word, val=(string))}
* POST `/get_difficulties`
  * key: words (array of strings)
  * returns: {(dict of key=word, val=(int))}
* POST `/get_synonyms`
  * key: words (array of strings)
  * returns: {(dict of key=word, val=(string))}

(the bulk endpoints are POST because GET urls become too long)

# node-js-getting-started

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:heroku/node-js-getting-started.git # or clone your own fork
$ cd node-js-getting-started
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
