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

                switch(response.status) {
                    case 200: 
                        req.tidepool={};
                        req.tidepool.userid = response.body.userid;
                        break;
                    case 401:
                        res.send(401,'Tidepool user-api: '+response.body);
                        break;
                    default:
                        res.send(response.status,'Tidepool user-api: '+response.body);
                        break;    
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

                switch(response.status) {
                    case 200: 
                        req.header('x-tidepool-session-token', response.headers['x-tidepool-session-token']);
                        break;
                    case 401:
                        res.send(401,'Tidepool user-api: '+response.body);
                        break;
                    default:
                        res.send(response.status,'Tidepool user-api: '+response.body);
                        break;    
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