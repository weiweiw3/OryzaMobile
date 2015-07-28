//var isAuthenticated = false;
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
    'ngMessages',
    'elasticsearch',
    'LocalStorageModule',
    'ionic-datepicker',
    'ionic-timepicker',
    'ionic-material',
    'pascalprecht.translate',
    //'ionMdInput',
//    'ui.router',
    'angular-momentjs'];
var myAppComponents = [
    'myApp.routes',
//  'myApp.animate',
    'myApp.config',
    'myApp.filters',
    'myApp.directives.timepicker',
    'myApp.directives',
    'myApp.directives.favoriteMessage',
    'myApp.directives.createTask',
    'myApp.home',
    'myApp.services.ionic',
    'myApp.services.myTask',
    'myApp.login',
    'firebase.auth',
    'myApp.security',
    'myApp.purchaseOrder',
    'myApp.purchaseOrderList',
    'myApp.search',
    'myApp.sapValidation',
    'myApp.leaveRequest'
];

// Declare app level module which depends on filters, and services
angular.module('myApp',
    dependencyModules.concat(myAppComponents))

    //.run( function($rootScope, Auth) {
    //    // track status of authentication
    //    Auth.$onAuth(function(user) {
    //
    //        $rootScope.loggedIn = !!user;
    //        console.log(!!user);
    //    });
    //
    //})
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('myApp')
            .setNotify(true, true);
    })
    .config(function ($ionicConfigProvider) {
        $ionicConfigProvider.views.maxCache(5);
        //$ionicConfigProvider.platform.android.views.maxCache(5);
        $ionicConfigProvider.tabs.position('bottom'); //other values: top
        // note that you can also chain configs
        $ionicConfigProvider.backButton.text('Go Back').icon('ion-chevron-left');
    })
    .config(['$ionicAppProvider', function ($ionicAppProvider) {
        // Identify app
        $ionicAppProvider.identify({
            // The App ID (from apps.ionic.io) for the server
            app_id: 'a04798c7',
            // The public API key all services will use for this app
            api_key: '366d39f7b1ac4d8ebec00a989e44f7380483e53580fc350e71e35b03b0615825bdc6f813bb85b5d6e6f2e35fcd12e548',
            // The write key your app will use for analytics
            api_write_key: '5f6e17f6815844344b1d843ab9c4c1513ce379a8fa0ab2f329311f2646411c786e6ad5fd08b138cc3135b90c676b1f414090a1f494d2e67b7ef5c721cd58af597a826f07c3aa17b7f77a207bf852250b80cba251720bcc13b9a08581e0ac7ee12b8326c7457db36a30e61e075dea915001e0ce559d8635c41c16777967e935f39996b6cc067e467eeaeba0744d1bc5e9'
            // The GCM project ID (project number) from your Google Developer Console (un-comment if used)

        });
    }])
    .run(function($rootScope, $state,$stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.goBack = function() {
            // function to go back
            window.history.back();
        };

        $rootScope.$on('$stateChangeSuccess', function () {
            if ($state.$current == 'home' || $state.$current == 'setting') {
                $rootScope.showCustomBack = false;
            }else{
                $rootScope.showCustomBack = true;
            }
        });
    })


// do all the things ionic needs to get going
    .run(function ($ionicPlatform, $rootScope, FIREBASE_URL,$ionicPopup,
                   $firebaseAuth, $firebase, $window, $location, $ionicLoading) {

        $ionicPlatform.ready(function (simpleLogin) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            $rootScope.notify = function (text) {
                $rootScope.show(text);
                $window.setTimeout(function () {
                    $rootScope.hide();
                }, 1999);
            };

        });

    })

/** ROOT SCOPE AND UTILS *************************/
.run(['$rootScope', '$location', '$log', function ($rootScope, $location, $log) {
    $rootScope.$log = $log;
    $rootScope.keypress = function (key, $event) {
        $rootScope.$broadcast('keypress', key, $event);
    };
}]);




