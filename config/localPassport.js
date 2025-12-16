import User from "../models/users.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { comparePassword } from "../helpers/password.js";

passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    try{
        // Find user by email
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return done(null, false, {message: "Incorrect email or password."});
        }

        // Check if password is set (in case of google auth only accounts)
        if(!user.password) {
            return done(null, false, {message: "Password not set. Please login using Google or reset your password."})
        }

        // Check if user is registered via google
        if(user.authProvider === "google") {
            return done(null, false, {message: "Please log in using Google"});
        }

        // Compare password
        const isMatch = await comparePassword(password, user.password);
        if(!isMatch){
            return done(null, false, {message: "Incorrect email or password."});
        }

        // Remove password field before returning user
        user.password = undefined;
        return done(null, user);

    } catch (error){
        return done(error, null);
    }
}))

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user._id);
})

passport.deserializeUser(async (id, done) => {
    try{
        console.log('Deserializing user with id:', id);
        const user = await User.findById(id);
        if(!user){
            return done(new Error("User not found"), null);
        }

        done(null, user);
    } catch(error){
        console.log('Error deserializing user:', error);
        done(error, null);
    }
})