const passport = require('passport')
const user = require('../auth/user')
const bcrypt = require('bcrypt')
const localStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github').Strategy;

passport.use(new localStrategy(
    {
        usernameField: 'email'
    },
    function(email, password, done){
        user.findOne({email}).then(user => {
            bcrypt.compare(password, user.password, function(err, result) {
                if(err) {return done(err)}
                if(result) {return done(null, user)}
            });
        }).catch(e => {return done(e)})
    }
))

passport.use(new GoogleStrategy({
    //INSERT YOUR ID AND SECRET
    clientID: 'id', 
    clientSecret: 'secret',
    callbackURL: "http://localhost:8000/api/auth/google",
    scope: ['openid', 'email', 'profile']
  },
  async function(accessToken, refreshToken, profile, cb) {
    const User = await user.find({ googleId: profile.id })
    const newUser = await new user({
        googleId: profile.id,
        full_name: profile.displayName,
        email: profile.emails[0].value,

    }).save()
    return cb(null, newUser);
  }
));

passport.use(new GitHubStrategy({
    //INSERT YOUR ID AND SECRET
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: "http://localhost:8000/api/auth/github",
    scope: ["user", "email"]
  },
  async function(accessToken, refreshToken, profile, cb) {
    const User = await user.find({ githubId: profile.id })
    console.log(profile)
    const newUser = await new user({
        githubId: profile.id,
        full_name: profile.displayName,
        email: profile.email,

    }).save()
    return cb(null, newUser);
    }
));

passport.serializeUser(function(user, done){
    done(null, user._id)
})

passport.deserializeUser(function(id, done){
    user.findById(id).then((user, err) => {
        done(err, user)
    })
})