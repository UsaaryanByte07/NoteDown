const requireAdmin = (req, res, next) => {
    if(!req.session.isLoggedIn || !req.session.user){
        return res.status(401).json({
            success: false,
            message: 'Not Aunthenticated'
        })
    }
    if(req.session.user.userType !== 'admin'){
        return res.status(401).json({
            success: false,
            message: 'Access Denied, Only Admins can Access'
        })
    }
    next()
}

const requireLogin = (req, res, next)=>{
    if(!req.session.isLoggedIn || !req.session.user){
        return res.status((401)).json({
            success: false,
            message: 'Not Aunthenticated'
        })
    }
    next()
}

const requireNotLoggedIn = (req, res, next)=>{
    if(req.session.isLoggedIn){
        return res.status(400).json({
            sucess: false,
            message: 'Already Logged In'
        })
    }       
    next()
}

const requireUser = (req, res, next)=>{
    if(!req.session.isLoggedIn || !req.session.user){
        return res.status(401).json({
            success: false,
            message: 'Not Aunthenticated'
        })
    }
    if(req.session.user.userType !== 'user'){
        return res.status(401).json({
            success: false,
            message: 'Access Denied, Only Users can Access'
        })
    }
    next()
}

module.exports = {
    requireAdmin,
    requireLogin,
    requireNotLoggedIn,
    requireUser
}