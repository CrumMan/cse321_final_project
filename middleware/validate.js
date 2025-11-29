const validator = require('../helpers/validate')
const saveUserInfo = (req,res,next) => {
    const validationRule = {
        firstName: "required|string",
        lastName: "required|string",
        favoriteColor: "required|string",
        gender: "required|string",
    }

    validator(req.body, validationRule, {}, (err,status) =>{
        if(!status){
            res.status(412).send({
                success: false,
                message: "Validation failed",
                data: err
            })
        } else {
            next();
        }
    })
}
const saveUserAuth = (req,res,next) => {
    const validationRule = {
        auth: "required|string"
    }
        validator(req.body, validationRule, {}, (err,status) =>{
        if(!status){
            res.status(412).send({
                success: false,
                message: "Validation failed",
                data: err
            })
        } else {
            next();
        }
    })

}
module.exports = {
    saveUserInfo,
    saveUserAuth
}