var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Session = require("./models/session");
var Assignment = require("./models/assignment");
var User = require("./models/user");
var seedDB = require("./seeds");
const { db } = require('./models/session');
const user = require('./models/user');
var app = express();

//APP CONFIG
mongoose.connect("mongodb://localhost:27017/student_grader", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//seedDB(); 
//Mongoose/Model Config

//Passport Configuration
app.use(require("express-session")({
    secret: "Once again Mpho is disturbing me",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//The current user 
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});


// RESTFUL ROUTES
app.get("/", function (req, res) {
    res.render("landing");
});
app.get("/sessions", isLoggedIn, function (req, res) {
    Session.find({}, function (err, allSessions) {
        if (err) {
            console.log(err);
        } else {
            res.render("sessions/index", { sessions: allSessions });
        }
    });
});

//Sessions - show all Sessions / Create add new session to DB
app.post("/sessions", isLoggedIn, function (req, res) {
    var title = req.body.title;
    var desc = req.body.description;
    var accesscode = req.body.accesscode;
    var admincode = req.body.admincode;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newSession = { title: title, description: desc, author: author, accesscode: accesscode, admincode: admincode }
    // Create a new Session and save to DB
    Session.create(newSession, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/sessions");
        }
    });
});

// New - Show new form to create Sessions 
app.get("/sessions/new", isLoggedIn, function (req, res) {
    res.render("sessions/new");
});

//SHOW THE ASSIGNMENTS ASSOCIATED TO THE LOGGED IN USER
app.get("/sessions/:id", isLoggedIn, function (req, res) {
    var title = req.body.title;
    var desc = req.body.description;
    var accesscode = req.body.accesscode;
    var admincode = req.body.admincode;
    //var id = req.body._id;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newSession = { title: title, description: desc, author: author, accesscode: accesscode, admincode: admincode }

    // Session.findById(req.params.id, function(err, session){
    //     console.log(session);
    // });
    //find the Session with the provided ID
    Session.findById(req.params.id).populate("assignments").exec(function (err, foundSession) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundSession);
            //render of that particular Session template 
            res.render("sessions/assignments", { session: foundSession });
        }
    });
    //render assignment template with that session
});


//==================
//Assignment Routes
//==================

app.get("/sessions/:id/assignments/new", isLoggedIn, function (req, res) {

    //find the session by id
    Session.findById(req.params.id, function (err, session) {
        if (err) {
            console.log(err);
        } else {
            res.render("assignments/new", { session: session });
        }
    });
});


// Create an assignment within the session.
app.post("/sessions/:id/assignments", isLoggedIn, function (req, res) {
    //lookup session using Id

    Session.findById(req.params.id, function (err, session) {

        console.log(session);
        if (err) {
            console.log(err);
            redirect("/sessions");
        } else {
            //console.log(req.body.assignment);
            Assignment.create(req.body.assignment, function (err, assignment) {
                if (err) {
                    console.log(err);
                } else {
                    //Add username and ID to assignment
                    assignment.author.id = req.user._id;
                    assignment.author.username = req.user.username;

                    //Save assignment created
                    assignment.save();
                    session.assignments.push(assignment);
                    session.save();
                    //console.log(assignment);
                    res.redirect('/sessions/' + session._id);

                }
            });
        }
    });
    //create assignment
    //connect new assignment to session

    //redirect to session show page
});

//Update the session
app.put("/:id", function(req, res){
    
});
 





// Show the assignment details.
app.get("/sessions/:id/assignments/show", function (req, res) {
    var title = req.body.title;
    var desc = req.body.description;
    var accesscode = req.body.accesscode;
    var admincode = req.body.admincode;
    //var id = req.body._id;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var participants = {
        id: req.user._id,
        username: req.user.username
    }
    var newSession = { title: title, description: desc, author: author, accesscode: accesscode, admincode: admincode, participants: participants}
    Session.findById(req.params.id).populate("participants").exec(function (err, foundSession) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundSession);
            //render of that particular show template 
            //res.render("sessions/assignments", { session: foundSession });
            res.render("show", { sessions: foundSession });
        }
    });
    
});

//===============
//AUTH ROUTE   
//===============
app.get("/register", function (req, res) {
    res.render("register");
});

//Handle sign-up logic
app.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username,  personNumber: req.body.personNumber, supervisor:req.body.supervisor,projectTitle:req.body.projectTitle });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/sessions"); //redirect to the profile 
        });
    });
});

// show login form
app.get("/login", function (req, res) {
    res.render("login");
});

// handling login logic
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/sessions",
        failureRedirect: "/login"
    }), function (req, res) {
    });

// logout route
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");  //This has to redirect to landing
});


//==================
// secret code route
//==================

app.get("/sessions/:id/usercode", isLoggedIn, function (req, res) {
    Session.findById(req.params.id, function (err, session) {
        //console.log(session);
        if (err) {
            console.log(err);
        } else {
            res.render("usercode", { session: session });
        }
    });

});

//Handle the secret code by comparing it to the admin code
app.post("/sessions/:id/usercode", isLoggedIn, function (req, res) {
    var newAdmin = new Session({ admincode: req.body.admincode });
    //var 
    var userRole = req.user._id;
    
    //var session = Session({})
    Session.findById(req.params.id, function (err, session) {
        console.log(session);
        if (err) {
            console.log(err);
        }
        else
            if (req.body.admincode === session.admincode) {
                //console.log(session);
                //console.log(userRole);
                db.collection("users").updateOne({ _id: userRole }, { "$set": { isAdmin: true } }, (err, res) => {
                    if (err) {
                        console.log("database error - can not update");
                        return;

                    }
                    //console.log(res);
                })
                //userRole = true;
                console.log("You are now an Admin");
                //console.log(userRole);
                res.redirect('/sessions/' + session._id);
            }
            else if (req.body.accesscode === session.accesscode) {
                db.collection("users").updateOne({ _id: userRole }, { "$set": { accessValue: true } }, (err, res) => {
                    if (err) {
                        console.log("database error - can not update");
                        return;
                    } else {
                        User.findById(userRole, function (err, foundUser) {
                            session.participants.push(foundUser);
                            session.save();
                            console.log(foundUser);
                            console.log("your access value is correct");
                        });
                    }
                    //console.log(res);
                });
                res.redirect('/sessions/' + session._id);

                /*
                Session.findById(userRole, function (err, session) {
                    user.save();
                    session.assignments.push(assignment);
                    session.save();
                });*/
                    
            } else {
                console.log("You do not have access")
            }
    });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function () {
    console.log("Server started......");
});