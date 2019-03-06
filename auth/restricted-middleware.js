const jwt = require('jsonwebtoken');
const secrets = require('../secret/secrets');

module.exports = (req, res, next) => {
    const token = req.headers.authorization;
  
    if ( token ) {
        jwt.verify(token, secrets.jwtSecret, (err, decodedToken) => {
            if(err){
                res.status(401).json('No RYAN SEACRESTS HERE!')
            } else {
                req.decodedJwt = decodedToken;
                console.log('decoded token', req.decodedJwt)//I didn't show this, but try it and see how it outputs - should be just like what you saw on the jwt website
                next();
            } 
        });
       
    }  else {
        //no token
        res.status(401).json('none shall pass')
    }
};