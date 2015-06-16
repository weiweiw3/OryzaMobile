// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up authRequired for routeSecurity-ui-router: True states which the app can be in.

"use strict";

angular.module('myApp.routes', ['ionic', 'firebase.simpleLogin'])

    .config(
    function ($stateProvider) {
        $stateProvider
            .state('tab', {            // setup an abstract state for the tabs directive
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html",
                resolve: {
                    // controller will not be loaded until $requireAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    "currentAuth": ["simpleLogin",
                        function (simpleLogin) {
                            // $requireAuth returns a promise so the resolve waits for it to complete
                            // If the promise is rejected, it will throw a $stateChangeError (see above)
                            return simpleLogin.auth.$requireAuth();
                        }]
                }
            })

            // the setting tab has its own child nav-view and history
            .state('tab.setting', {
                url: '/setting',
                views: {
                    'setting-tab': {
                        templateUrl: 'scripts/setting/setting.html'
                    }
                }
            })
            ;


        // if none of the above states are matched, use this as the fallback
        //isAuthenticated is set below in the .run() command
        //$urlRouterProvider.otherwise(
        //    function () {
        //if (isAuthenticated) {
        //    console.log('isAuthenticated', isAuthenticated);
        //    return '/tab/setting'
        //} else {
        //    console.log('isAuthenticated', isAuthenticated);
        //    return '/login'
        //}
        //    }
        //);
    }
);
