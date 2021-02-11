var mongoose = require("mongoose");

var ImageSchema = new mongoose.Schema(
    {
      filePath:String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Image", ImageSchema);