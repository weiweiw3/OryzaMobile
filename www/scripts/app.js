var isAuthenticated = false;
var dependencyModules = [
    'firebase.utils',
    'firebase.simpleLogin',
    'firebase',
    'ionic',
	  'ngCordova',
  'ionic.service.core',
  'ionic.service.push',
  'ionic.service.deploy',
  'ionic.service.analytics',
//    'ui.router',
//  'elasticsearch',
    'angular-momentjs'];
var myAppComponents = [
    'myApp.routes',
//  'myApp.animate',
    'myApp.config',
    'myApp.filters',
//  'appServices',
    'myApp.directives',
    'myApp.directives.favoriteMessage',
    'myApp.directives.createTask',
    'myApp.controllers.setting',
    'myApp.controllers.login',
    'myApp.controllers.SAPUserValidation',
    'myApp.controllers.contacts',
    'myApp.controllers.chatRoom',
    'myApp.controller.ionic',
    'myApp.controllers.messagesIndex',
    'myApp.controllers.messagesInOneComponent',
    'myApp.controllers.messagesDetail',
    'myApp.controllers.messages1',
    'myApp.controllers.material',
    'myApp.services.ionic',
    'myApp.services',
    'myApp.services.auth',
    'myApp.services.myComponent',
    'myApp.services.myMessage',
    'myApp.services.myTask',
    'myApp.services.myUser'
];

// Declare app level module which depends on filters, and services
var myApp = angular.module('starter', dependencyModules.concat(myAppComponents));

myApp.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: 'a04798c7',
    // The public API key all services will use for this app
    api_key: '366d39f7b1ac4d8ebec00a989e44f7380483e53580fc350e71e35b03b0615825bdc6f813bb85b5d6e6f2e35fcd12e548',
    // The write key your app will use for analytics
    api_write_key: '5f6e17f6815844344b1d843ab9c4c1513ce379a8fa0ab2f329311f2646411c786e6ad5fd08b138cc3135b90c676b1f414090a1f494d2e67b7ef5c721cd58af597a826f07c3aa17b7f77a207bf852250b80cba251720bcc13b9a08581e0ac7ee12b8326c7457db36a30e61e075dea915001e0ce559d8635c41c16777967e935f39996b6cc067e467eeaeba0744d1bc5e9',
    // The GCM project ID (project number) from your Google Developer Console (un-comment if used)
    // gcm_id: '466583810362'
  });
}]);
// do all the things ionic needs to get going
myApp.run(function ($ionicPlatform, $rootScope, FIREBASE_URL, $firebaseAuth, $firebase, $window, $location, $ionicLoading) {
    $ionicPlatform.ready(function (simpleLogin) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        $rootScope.userEmail = null;
        $rootScope.baseUrl = FIREBASE_URL;
        var authRef = new Firebase($rootScope.baseUrl);
        $rootScope.auth = $firebaseAuth(authRef);
        $rootScope.auth.$onAuth(function (authData) {
            if (authData) {
                isAuthenticated = true;
                $rootScope.authData = authData;
                console.log("Logged in email ", authData.password.email);
                console.log("Logged in as:", authData.uid);
            } else {
                isAuthenticated = false;
                console.log("Logged out");
                $ionicLoading.hide();
                $location.path('/login');
            }
        });

        $rootScope.notify = function (text) {
            $rootScope.show(text);
            $window.setTimeout(function () {
                $rootScope.hide();
            }, 1999);
        };

        $rootScope.$on("$stateChangeError",
            function (event, toState, toParams, fromState, fromParams, error) {

                // We can catch the error thrown when the $requireAuth promise is rejected
                // and redirect the user back to the home page
                if (error === "AUTH_REQUIRED") {
                    $location.path("/login");
                }
            });
    });

});

/** AUTHENTICATION***************/

myApp.run(function ($rootScope, $firebaseAuth, $firebase, $window, $ionicLoading) {

//    simpleLogin.addToScope($rootScope);

});

/** ROOT SCOPE AND UTILS *************************/
myApp.run(['$rootScope', '$location', '$log', function ($rootScope, $location, $log) {
    $rootScope.$log = $log;

    $rootScope.keypress = function (key, $event) {
        $rootScope.$broadcast('keypress', key, $event);
    };


}]);








