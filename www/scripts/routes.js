// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up authRequired for routeSecurity-ui-router: True states which the app can be in.

"use strict";

angular.module('myApp.routes', ['ionic', 'firebase.simpleLogin'])

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.timeout = 5000;
    }])
    .config(['$translateProvider', function ($translateProvider,$rootScope) {
        $translateProvider.useStaticFilesLoader({
            files: [{
                prefix: 'resources/language/locale-',
                suffix: '.json'
            }]
        });
        $translateProvider.useLoaderCache(true);
        $translateProvider.preferredLanguage('E');
    }])
    .run(function ($ionicPlatform, $translate) {
        $ionicPlatform.ready(function () {
            if (typeof navigator.globalization !== "undefined") {
                navigator.globalization.getPreferredLanguage(function (language) {
                    $translate.use((language.value).split("-")[0]).then(function (data) {
                        console.log("SUCCESS -> " + data);
                    }, function (error) {
                        console.log("ERROR -> " + error);
                    });
                }, null);
            }
        });
    })
    .config(['$urlRouterProvider', function ($urlRouterProvider) {
        // routes which are not in our map are redirected to /tab/setting
        $urlRouterProvider.otherwise(
            function () {
                return '/'
            }
        );
    }])
    .config(
    function ($stateProvider) {
        $stateProvider
            //.state('tab', {            // setup an abstract state for the tabs directive
            //    url: "/tab",
            //    abstract: true,
            //    templateUrl: "templates/tabs.html",
            //    resolve: {
            //        // controller will not be loaded until $requireAuth resolves
            //        // Auth refers to our $firebaseAuth wrapper in the example above
            //        "currentAuth": ["simpleLogin",
            //            function (simpleLogin) {
            //                // $requireAuth returns a promise so the resolve waits for it to complete
            //                // If the promise is rejected, it will throw a $stateChangeError (see above)
            //                return simpleLogin.auth.$requireAuth();
            //            }]
            //    }
            //})

            // the setting tab has its own child nav-view and history
            .state('setting', {
                url: '/setting',
                templateUrl: 'templates/setting.html'
            })
            .state('addSAPUser', {
                url: '/addSAPUser',
                controller: "addSAPUserCtrl",
                templateUrl: 'scripts/setting/add-sap-user.html'
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
