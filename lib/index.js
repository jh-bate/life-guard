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

request = require('superagent');

module.exports = function(config,hostGetter) {

    function getAPIHost(){
        //we just want the first one in this instance
        var hostSpec = hostGetter.get();
        return hostSpec[0].host;
    }

    function checkToken(req, res, next) {

        var sessionToken = req.headers['x-tidepool-session-token'];

        request
            .get(getAPIHost()+'/token/'+req.params.usertoken)
            .set('X-Tidepool-Session-Token', sessionToken)
            .end(function(error,response){

                if (error != null) {
                    res.send(503);
                    return next(error);
                }

                if(response.status == 200){
                    //console.log('success for token check ',response.body.userid);
                    res.tidepool={};
                    res.tidepool.userid = response.body.userid;
                }else if(response.status ==401){
                    //console.log('no auth for token check');
                    res.send(401,'Tidepool user-api');
                }
                
                return next();
            });
    };

    function getToken(req, res, next) {

        if(req.headers['x-tidepool-session-token'] != null){
            //console.log('we all ready have a token');
            return next();
        }else{
            request
            .post(getAPIHost()+'/serverlogin')
            .set('X-Tidepool-Server-Name', config.serverName)
            .set('X-Tidepool-Server-Secret', config.serverSecret)
            .end(function(error,response){

                if (error != null) {
                    res.send(503);
                    return next(error);
                }

                if(response.status == 200){
                    //console.log('got a new token',response.headers['x-tidepool-session-token']);
                    req.header('x-tidepool-session-token', response.headers['x-tidepool-session-token']);
                }else if(response.status ==401){
                    res.send(401,'Tidepool user-api /serverlogin');
                }

                return next();
            });
        }
    };

    return {
        checkToken : checkToken,
        getToken : getToken
    };

}