(function (angular) {
    "use strict";

    angular.module('myApp.security', ['firebase.auth', 'myApp.config'])

        .config(['$urlRouterProvider', function ($urlRouterProvider) {
            // routes which are not in our map are redirected to /tab/setting
            $urlRouterProvider.otherwise(
                function () {
                    return '/tab/setting'
                }
            );
        }])

    /**
     * Apply some route security. Any route's resolve method can reject the promise with
     * { authRequired: true } to force a redirect. This method enforces that and also watches
     * for changes in auth status which might require us to navigate away from a path
     * that we can no longer view.
     */

        // do all the things ionic needs to get going
        .run(function ($rootScope, FIREBASE_URL, Auth, loginRedirectPath, $firebaseAuth, $firebase, $window, $location, ionicLoading,firebaseRef,$firebaseObject) {

//            $rootScope.userEmail = null;
            Auth.$onAuth(function (authData) {
                if (authData) {
//                    isAuthenticated = true;
                    $rootScope.authData = authData;


                    console.log("Logged in email ", authData.password.email);
                    console.log("Logged in as:", authData.uid);
                } else {
//                    isAuthenticated = false;
                    console.log("Logged out");
                    ionicLoading.unload();
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

        });


})(angular);
