const jwt = require('jsonwebtoken');

function jwtCheck(req, res, next) {
    console.log("JWT CHECK MIDDLEWARE");
    if(req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err) {
                return res.status(401).json({message: 'Invalid token'});
            }else{
                req.user = decoded;
                next();
            }
        });
    }else{
        return res.status(401).json({message: 'No token provided'});
    }
}

module.exports = jwtCheck;