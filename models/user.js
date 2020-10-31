var mongoose = require("mongoose");
var passportLocalMongoose =require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    personNumber:String,
    supervisor: String,
    projectTitle: String,
    isAdmin: {type: Boolean, default: false},
    accessValue: {type: Boolean, default: false},
    sessions: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Session"
        } 
     ]
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);