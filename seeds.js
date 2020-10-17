var mongoose = require("mongoose");
var Session = require("./models/session");
var Assignment = require("./models/assignment");
//var User = require("./models/user");

var data = [
    {
        title: "Computer Science Honours Project Session", 
        description: "This Session is for masters computer science students in the natural science faculty"
    },
    {
        title: "Mechanical Engineering", 
        description: "This Session is for all honours mechenical engineering students in the Engineering faculty"
    },
    {
        title: "Electrical engineering", 
        description: "This Session is for all Masters Electrical engineering students in the Engineering faculty"   
    },    

]
function seedDB() {
    //REMOVE ALL Sessions
    Session.remove({}, function (err) {
        if (err) {
            console.log(err);
        }
        console.log("removed Sessions!");
        //ADD A FEW CAMPGROUNDS
        // data.forEach(function (seed) {
        //     Session.create(seed, function (err, session) {
        //         if (err) {
        //             console.log(err);
        //         } else {
        //             console.log("Added a Session");
        //             // Create a comment inside each campground
        //             Assignment.create(
        //                 {
        //                     text: "Write a Literature review",
        //                     author: "Homer",
        //                     description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.",
        //                     //created: { type: Date, default: Date.now }
        //                 }, function(err, assignment){
        //                     if (err) {
        //                         console.log(err);
        //                     } else {
        //                     session.assignments.push(assignment);
        //                     session.save();
        //                     console.log("Created new assignment");
        //                     }
        //                 });
        //         }
        //     });
        // })
    });
    
    
}

module.exports = seedDB;