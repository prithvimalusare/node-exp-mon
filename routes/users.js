const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require('passport');

// Article Model
let User = require("../models/user");

router.get("/register", function(req, res) {
  res.render("register");
});

router.post("/register", function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "email is required").notEmpty();
  req.checkBody("email", "email is invalid").isEmail();
  req.checkBody("username", "username is required").notEmpty();
  req.checkBody("password", "password is required").notEmpty();
  req.checkBody("password2", "confirm password and password do not match.").equals(req.body.password);

  let errors = req.getValidationResult();

  if (errors) {
    res.render("register", {
      errors: errors
    });
  } else {
    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err) {
          if (err) {
            console.log(err);
            return;
          } else {
            req.flash("success", "You are now registered and can log in.");
            res.redirect("/users/login");
          }
        });
      });
    });
  }
});

router.get('/login', function (req, res) {
    res.render('login');
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);

});

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('login');
});

module.exports = router;
