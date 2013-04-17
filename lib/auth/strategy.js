/*
 * Module dependencies
 */
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , mongoose = require('mongoose');

/**
 * Expose AuthStrategy
 */

module.exports = AuthStrategy;

/**
 * Register Auth Strategies for app
 */

function AuthStrategy (app) {
  /**
   * Citizen model
   */

  var Citizen = mongoose.model('Citizen');

  /**
   * Passport Serialization of logged
   * Citizen to Session from request
   */

  passport.serializeUser(function(citizen, done) {
    done(null, citizen._id);
  });

  /**
   * Passport Deserialization of logged
   * Citizen by Session into request
   */

  passport.deserializeUser(function(citizenId, done) {
    Citizen
    .findById(citizenId)
    .exec(function(err, citizen) {
      done(null, citizen);
    });
  });

  /**
   * Register Local Strategy
   */

  passport.use(new LocalStrategy(function(email, password, done) {
    Citizen.findByEmail(email, function(err, citizen) {
      if(err) return done(err);

      if(citizen) return citizen.authenticate(password, done);

      return done(null, false, { message: 'Not found Citizen with email provided!' })
    });
  }));

  /**
   * Register Facebook Strategy
   */

  passport.use(new FacebookStrategy({
        clientID: app.get('config').auth.facebook.clientID
      , clientSecret: app.get('config').auth.facebook.clientSecret
      , callbackURL: app.get('config').auth.facebook.callback
    } , function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      Citizen.findByProvider(profile.id, 'facebook', function(err, citizen) {
        if(err) {
          return done(err);
        }

        if(!citizen) {
          return done(null, false, { message: 'Not found Citizen with email provided!' });
        }
        done(null, citizen);
      }
    );
  }));


}