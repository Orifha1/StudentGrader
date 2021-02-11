
var mongoose = require("mongoose");

var marksSchema = new mongoose.Schema({
    score : Number,
    created: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Mark", marksSchema);