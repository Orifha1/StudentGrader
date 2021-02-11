
var mongoose = require("mongoose");

var assignmentsSchema = new mongoose.Schema({  
    text: String,
    description: String,
    created: {type: Date, default:Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    participants: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "User"
        }
     ],
    marks: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mark"
        },
    },
    
});
module.exports = mongoose.model("Assignment", assignmentsSchema);