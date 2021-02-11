var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Session = require("./models/session");
var Assignment = require("./models/assignment");
var User = require("./models/user");
var Image = require("./models/image");
var File = require("./models/files");
const uuid = require('uuid').v4;
var Mark = require("./models/mark")
var seedDB = require("./seeds");
const { db } = require('./models/session');
const user = require('./models/user');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
var session = require('express-session')
var flash = require('connect-flash');
var app = express();

//APP CONFIG
mongoose.connect("mongodb://localhost:27017/student_grader", { useNewUrlParser: true });
var conn = mongoose.connection;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname +'/uploads'));

let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
  });

//Passport Configuration
app.use(require("express-session")({
    secret: "Once again Mpho is disturbing me",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
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

//excel upload


// store excel files into one folder
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); 
        const id = uuid();
        const filePath = `images/${id}${ext}`;
        Image.create({filePath})
            .then( () => {
                cb(null, filePath);
            });
    
    }
  })
  
  var upload = multer({ storage: storage })
  

  


// For flash message
  app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
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
            //console.log(newlyCreated);
            req.flash("success", "You have successfully created a session!");
            res.redirect("/sessions" );
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

    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newSession = { title: title, description: desc, author: author, accesscode: accesscode, admincode: admincode }


    Session.findById(req.params.id).populate("assignments").exec(function (err, foundSession) {
        if (err) {
            console.log(err);  
        } else {
 
            Image.find({}, function (err, images) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(images);
                    res.render("sessions/assignments", { session: foundSession, images:images });
                }
            });
            
            
        }
    });
    
});

// User Profile 
app.get("/users/:id", function(req, res) {
    var userID = req.user._id;
    User.findById(userID, function(err, foundUser) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      Image.find({}, function (err, images) {
        if (err) {
            console.log(err);
        } else {
            console.log(images);
            res.render("users/show", {user: foundUser, images:images});
        }
    });
    
    });
  });
//==================
//Assignment Routes
//==================

app.get("/sessions/:id/assignments/new", isLoggedIn, function (req, res) {
    Session.findById(req.params.id, function (err, session) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "You have successfully created an assignment dashboard!");
            res.render("assignments/new", { session: session });
        }
    });   
});


// Create an assignment within the session.
app.post("/sessions/:id/assignments", isLoggedIn, upload.array('file'), function (req, res) {

    Session.findById(req.params.id, function (err, session) {
        
        if (err) {
            console.log(err);
            redirect("/sessions");
        } else {
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
                    res.redirect('/sessions/' + session._id );
                }
            });
        }
    });
});

// Submit the student mark
app.post("/sessions/:id/assignments/show", isLoggedIn, function (req, res) {
    //lookup session using Id
    var title = req.body.title;
    var desc = req.body.description;
    var accesscode = req.body.accesscode;
    var admincode = req.body.admincode;

    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var participants = {
        id: req.user._id,
        username: req.user.username,
        total: req.body.total
    }
    var newSession = { title: title, description: desc, author: author, accesscode: accesscode, admincode: admincode, participants: participants}

    Session.findById(req.params.id, function (err, session) {
        //console.log(session);
        User.findById(req.body.id, function (err, foundUser) {
            //console.log(foundUser.marks);
            if (err) {
                req.flash("error", "Something went wrong!");
                console.log(err);
            } else {
                //foundUsermoderatorMark = req.body.moderatorMark;
                foundUser.marks.push(req.body.mark);
                foundUser.save();
                req.flash("success", "The mark has been successfully submitted!");
                res.redirect('/sessions/' + session._id + '/assignments/show');
                //res.render("sessions/index", { sessions: allSessions });
            }
        });
    });  
});

//Delete session
app.delete("/sessions/:id", isLoggedIn, function(req, res) {
    Assignment.remove({
      _id: {
        $in: req.session.assignment
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.session.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Session deleted!');
            res.redirect('/sessions');
          });
      }
    })
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
            req.flash("error", "Something went wrong!");
            console.log(err);
        } else {
            Image.find({}, function (err, images) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("show", { sessions: foundSession, images:images });
                }
            })
            
        }
    });    
});

app.get("/students", function (req, res) {
    res.send("Success");
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
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
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
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
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
        if (err) {
            console.log(err);
        } else {
            
            res.render("usercode", { session: session});
        }
    });

});

//Handle the secret code by comparing it to the admin code
app.post("/sessions/:id/usercode", isLoggedIn, function (req, res) {
    var newAdmin = new Session({ admincode: req.body.admincode });

    var userRole = req.user._id;
    
    Session.findById(req.params.id, function (err, session) {
        //console.log(session);
        if (err) {
            console.log(err);
        }
        else
            if (req.body.admincode === session.admincode) {
                db.collection("users").updateOne({ _id: userRole }, { "$set": { isAdmin: true } }, (err, res) => {
                    if (err) {
                        req.flash("success", "Can not update");
                        return;
                    }
                })
                req.flash("success", "You are an admin!");
                res.redirect('/sessions/' + session._id);
            }
            else if (req.body.accesscode === session.accesscode) {
                db.collection("users").updateOne({ _id: userRole }, { "$set": { accessValue: true } }, (err, res) => {
                    if (err) {
                        req.flash("error", "something went wrong please check your entry!");
                        return;
                    } else {
                        User.findById(userRole, function (err, foundUser) {
                            session.participants.push(foundUser);
                            session.save();
                            req.flash("success", "You now have access!");
                        });
                        
                    }
                });
               
                res.redirect('/sessions/' + session._id);

                    
            } else {
                req.flash("error", "You do not have access!");
            }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be signed in to do that!");
    res.redirect("/login");
}

app.get('/images', (req, res) => {
    Image.find()
        .then((images) => {
            return res.json({ status: 'OK', images});
        })
});



function checkUserSession(req, res, next){
    Session.findById(req.params.id, function(err, foundSession){
      if(err || !foundSession){
          console.log(err);
          req.flash('error', 'Sorry, that campground does not exist!');
          res.redirect('/session');
      } else if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
          req.session = foundSession;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/sessions/' + req.params.id);
      }
    });
  }

app.listen(3000, function () {
    console.log("Server started......");
});