const Validator = require("validatorjs");
const validator =  (body, rules, customMessages, callback) => {
const validation = new Validator(body,rules, customMessages);
if(validation.passes()){
     callback(null,true)
}
else{
        callback(validation.errors.all(), false)
    }
};

module.exports = validator