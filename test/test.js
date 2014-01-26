/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
 */

'use strict';
var expect = require('chai').expect,
    supertest = require('supertest'),
    restify = require('restify');
/*
    ============

    Running the user API helper 

    - user API has been mocked

    =============
*/
describe('User API Helper', function() {

    var mockUserApi,
        usersAPIHelper,
        sessionToken = '99406ced-8052-49c5-97ee-547cc3347da6',
        userToken = '88888ced-8888-88c8-88ee-888cc8888da8',
        mockUserAPIPort = 10088;

    var setupUsersAPIHelper=function(){

        var config = {
            serverName : 'mock users api',
            serverSecret : 'a secrect'
        };

        var fakeHakkenWatcher = {};
        
        fakeHakkenWatcher.get = function(){
            return [{host:'http://localhost:'+mockUserAPIPort}];
        };
        
        var server = restify.createServer({name:'User Api Helper Tests'});
        
        server.use(restify.queryParser());
        server.use(restify.bodyParser());

        var userApi = require('../lib/index')(config,fakeHakkenWatcher);

        server.get('/getToken',userApi.getToken,function(req,res){

            //pass through result
            if(res.headers['x-tidepool-session-token'] == null && req.headers['x-tidepool-session-token'] != null){
                res.send(200,{askForToken:false});
            }else{
                res.send(200,{askForToken:true});   
            }
            next();
        });

        server.get('/checkToken/:usertoken',userApi.checkToken,function(req,res,next){

            //pass through result
            if(req.tidepool.userid == null){
                res.send(res.statusCode);
            }else{
                res.send(200,{idGiven:true});  
            }
            next();
        });

        return server;

    };

    beforeEach(function(done){

        //start mock user api
        mockUserApi = require('./mockUserApi');
        mockUserApi.listen(mockUserAPIPort);
        usersAPIHelper = setupUsersAPIHelper();
        done();
    });

    afterEach(function(done){
        mockUserApi.close();
        done();
    });

    it('valid token returns us the user id', function(done) {

        supertest(usersAPIHelper)
        .get('/checkToken/'+userToken)
        .set('x-tidepool-session-token', sessionToken)
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);

            expect(res.body.idGiven).to.be.true;
            done();
        });
        
    });

    it('invalid token means 401 and no userid', function(done) {

        supertest(usersAPIHelper)
        .get('/checkToken/123-bad-1')
        .set('x-tidepool-session-token', sessionToken)
        .expect(401)
        .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.idGiven).to.not.exist;
            done();
        });
        
    });

    it('do not ask for token if we are already sorted with one', function(done) {

        supertest(usersAPIHelper)
        .get('/getToken')
        .set('x-tidepool-session-token', sessionToken)
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.askForToken).to.be.false;
            done();
        });
        
    });

    it('ask for token if we need one', function(done) {

        supertest(usersAPIHelper)
        .get('/getToken')
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.askForToken).to.be.true;
            done();
        });
        
    });
});