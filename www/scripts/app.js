var dependencyModules = [
    'firebase.utils',
    'firebase.auth',
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
    'angular-momentjs'];
var myAppComponents = [
    'myApp.tasks',
    'myApp.routes',
    'myApp.config',
    'myApp.filters',
    'myApp.directives.timepicker',
    'myApp.directives',
    'myApp.directives.favoriteMessage',
    'myApp.home',
    'myApp.services.ionic',
    'myApp.login',
    'myApp.security',
    'myApp.purchaseOrder',
    'myApp.search',
    'myApp.sapValidation',
    'myApp.leaveRequest',
    'myApp.listTemplate',
    'myApp.singlePageTemplate'
];

// Declare app level module which depends on filters, and services
angular.module('myApp',
    dependencyModules.concat(myAppComponents))

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
    // rootScrop Initialization
    .run(function ($translate, $rootScope, $location, fbutil, Auth, $q,
                   loginRedirectPath, $firebaseAuth, $firebase, $timeout, $firebaseObject) {

        //$rootScope.fbConnection
        //$rootScope.serverUser
        var connectedRef = fbutil.ref(['.info/connected']);
        connectedRef.on("value", function (snap) {
            if (snap.val() === true) {
                $rootScope.fbConnection = true;
                console.log("fb connected");
            } else {
                $rootScope.fbConnection = false;
                console.log("not connected");
            }
        });
        Auth.$onAuth(function (authData) {
            var ref = fbutil.ref(['profiles', authData.uid]);

            $firebaseObject(ref)
                .$bindTo($rootScope, 'profiles').then(function () {
                    console.log(24);
                    if (typeof $rootScope.profiles['SAPUser'] === "undefined") {
                        $location.path('/addSAPUser');
                    }

                    $rootScope.serverUser = $rootScope.profiles.serverUser;
                    console.log($rootScope.serverUser);
                    $rootScope.$broadcast('rootScopeInit', true);
                }
            );
        });
        $rootScope.$watch('profiles.language', function (newValue, oldValue) {
            $translate.use(newValue);
        });
    })
    .run(function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.goBack = function () {
            // function to go back
            window.history.back();
        };

        $rootScope.$on('$stateChangeSuccess', function () {
            if ($state.$current == 'home' || $state.$current == 'setting') {
                $rootScope.showCustomBack = false;
            } else {
                $rootScope.showCustomBack = true;
            }
        });
    })

// do all the things ionic needs to get going
    .run(function ($ionicPlatform, $rootScope, FIREBASE_URL, $ionicPopup,
                   $firebaseAuth, $firebase, $window) {

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
    .run(function ($rootScope, $location, $log) {
        $rootScope.$log = $log;
        $rootScope.keypress = function (key, $event) {
            $rootScope.$broadcast('keypress', key, $event);
        };
    });




