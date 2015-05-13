/**
 * Created by c5155394 on 2015/2/5.
 */
"use strict";
angular.module('myApp.services.auth', ['firebase', 'firebase.utils','myApp.config'])
// constructor injection for a Firebase reference
.service('Root', ['FIREBASE_URL', Firebase])
// create a custom Auth factory to handle $firebaseAuth
//.factory('Auth', function($firebaseAuth, Root, $timeout){
//    var auth = $firebaseAuth(Root);
//    return {
//        // helper method to login with multiple providers
//        loginWithProvider: function loginWithProvider(provider) {
//            return auth.$authWithOAuthPopup(provider);
//        },
//        // convenience method for logging in with Facebook
//        loginWithFacebook: function login() {
//            return this.loginWithProvider("facebook");
//        },
//        // wrapping the unauth function
//        logout: function logout() {
//            auth.$unauth();
//        },
//        // wrap the $onAuth function with $timeout so it processes
//        // in the digest loop.
//        onAuth: function onLoggedIn(callback) {
//            auth.$onAuth(function(authData) {
//                $timeout(function() {
//                    callback(authData);
//                });
//            });
//        }
//    };
//})
;