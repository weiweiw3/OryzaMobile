(function (angular) {
    "use strict";

    angular.module('myApp.security', ['myApp.config', 'myApp.services.ionic'])


    /**
     * Apply some route security. Any route's resolve method can reject the promise with
     * { authRequired: true } to force a redirect. This method enforces that and also watches
     * for changes in auth status which might require us to navigate away from a path
     * that we can no longer view.
     */

        // do all the things ionic needs to get going
        .run(function ($rootScope, fbutil, Auth, $q,
                       loginRedirectPath, $firebaseAuth, $firebase, $window,
                       $location, $timeout, $firebaseObject) {

            Auth.$onAuth(function (authData) {
                if (authData) {
                    $rootScope.authData = authData;
                    console.log(authData);
                    console.log("Logged in as:", authData.uid);
                } else {
                    console.log("Logged out");
                    $location.path(loginRedirectPath);
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
                        $location.path(loginRedirectPath);
                    }
                });

        })


        .service("hiEventService",function($rootScope) {
            this.broadcast = function() {$rootScope.$broadcast("hi")}
            this.listen = function(callback) {$rootScope.$on("hi",callback)}
        })
    ;

})(angular);

