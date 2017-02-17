life-guard
===========

Repository for interations with the Tidepool [user-api](https://github.com/tidepool-org/user-api)

## Install

Requirements:

- [Node.js](http://nodejs.org/)
- [Grunt](http://gruntjs.com/getting-started)
- [Mocha](http://mochajs.org/)

Clone this repo then install dependencies:

```bash
$ npm install .
```

## Running Tests

The tests are run with a mocked version of the user Api that will be spun up

```bash
grunt test
```


## Usage

Setup
```
var envConfig = {
	serverName : 'the name',
	serverSceret : 'the secrect',
	userApiHost : 'http://localhost:1002',
	...
};

var hakkenSubscription = require('hakken')().client.make();
hakkenSubscription.start();
hostGetter = hakkenSubscription.randomWatch(config.userApiHost);
hostGetter.start();


var userApi = require('life-gaurd')(envConfig, hakkenSubscription);
```

Usage - add to routes you need to authenticate via Tidepool User Api
```

//health check
server.get('/status',groupApi.status);

//user membership
server.get('/membership/:userid', userApi.checkToken, userApi.getToken, groupApi.memberOf);

```
