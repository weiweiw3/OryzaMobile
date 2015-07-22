(function (angular) {
    "use strict";

    angular.module('myApp.security', ['firebase.auth', 'myApp.config','myApp.services.ionic'])


    /**
     * Apply some route security. Any route's resolve method can reject the promise with
     * { authRequired: true } to force a redirect. This method enforces that and also watches
     * for changes in auth status which might require us to navigate away from a path
     * that we can no longer view.
     */

        // do all the things ionic needs to get going
        .run(function ($rootScope, fbutil, FIREBASE_URL, Auth, loginRedirectPath, $firebaseAuth, $firebase, $window, $location, ionicLoading, $firebaseObject) {

            Auth.$onAuth(function (authData) {
                if (authData) {
//                    isAuthenticated = true;
                    $rootScope.authData = authData;

                    var ref = fbutil.ref(['users', $rootScope.authData.uid]);
                    ref.on('child_changed', function (childSnapshot, prevChildKey) {
                        //console.log($rootScope[childSnapshot.key()]);
                        //$rootScope[childSnapshot.key()].new=true;
                        ref.child(childSnapshot.key()+'_new').set(true);
                        console.log(prevChildKey);

                        console.log(childSnapshot.key());
                        // code to handle child data changes.
                    });
                    ref.on('child_added', function (childSnapshot, prevChildKey) {
                        if (childSnapshot.key() === 'A0001') {
                            $rootScope.A0001 = childSnapshot.val();
                            console.log($rootScope.A0001);
                        }
                        console.log(prevChildKey);
                        // code to handle new child.
                    });
                    ionicLoading.load();
                    $firebaseObject(ref)
                        .$bindTo($rootScope, 'firebaseSync').then(function (data) {
                            console.log('firebase setting is synced');

                            ionicLoading.unload();
                        }
                    );
                    $rootScope.$watch('firebaseSync', function (newValue, oldValue) {
                        if (typeof newValue !== "undefined") {
                            //if (newValue.E0002.priority === '3') {
                            //    $location.path(loginRedirectPath);
                            //}
                        }
                    });

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
