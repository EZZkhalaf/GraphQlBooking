const jwt = require('jsonwebtoken')

module.exports = (req,res,next) => {
    //for validation of the token 
    const authHeader = req.get('Authorization')
    if(!authHeader){
        req.isAuth = false ;
        return next();
    }

    const token = authHeader.split(' ')[1];
    if(!token || token === ""){
        req.isAuth = false ;
        return next()
    }

    let decToken
    try {
        decToken = jwt.verify(token , 'secretKey');
        
    } catch (error) {
        req.isAuth = false ;
        return next()
    }
    if(!decToken){//check if the token is valid
        req.isAuth = false ;
        return next()
    }


    //finally the user is authenticated 
    req.isAuth = true ;
    req.userId = decToken.userId;
    next();

}