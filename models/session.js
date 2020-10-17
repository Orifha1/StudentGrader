var mongoose = require("mongoose");

var sessionsSchema = new mongoose.Schema({
   title: String,
   description: String,
   accesscode: String,
   admincode: String,
   created: { type: Date, default: Date.now },
   author: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   assignments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Assignment"
      } 
   ]
});

module.exports = mongoose.model("Session", sessionsSchema);