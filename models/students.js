var mongoose = require("mongoose");

var studentsSchema = new mongoose.Schema({
   supervisor: String,
   projectTitle: String,
   marks: [{type:Number}],   
});

module.exports = mongoose.model("Student", studentsSchema);