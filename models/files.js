var mongoose = require("mongoose");

var FileSchema = new mongoose.Schema(
    {
      filePath:String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("File", FileSchema);