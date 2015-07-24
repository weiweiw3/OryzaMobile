"use strict";
angular.module('myApp.login', ['firebase.utils', 'firebase.auth', 'ngRoute'])
//    .config(['$routeProvider', function ($routeProvider) {
//        $routeProvider.when('/login', {
//            controller: 'LoginCtrl',
//            templateUrl: 'login/login.html'
//        });
//    }])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {            // setup an login page
                url: "/login",
                templateUrl: "scripts/login/login.html",
                controller: 'LoginCtrl'
            });
    })

    .controller('LoginCtrl', function ($scope, Auth, $location, fbutil, ionicLoading, $log, $state) {
        $scope.data = {
            isLoading: false
        };
//        $scope.logindata = {
//            email: '',
//            password: ''
//        };
//        var loginemail = $localstorage.getObject('loginemail');
//        if (typeof loginemail !== 'undefined' ) {
//            $scope.logindata.email = loginemail;
//        }
        $scope.$log = $log;
        $scope.tryLogin = function () {
            console.log($scope.data.email, $scope.data.password);
            ionicLoading.load('Login...');
            $scope.err = null;
            Auth.$authWithPassword(
                {
                    email: $scope.data.email,
                    password: $scope.data.password
                },
                {rememberMe: true}
            )
                .then(function (/* user */) {
//                    $localstorage.setObject('loginemail', $scope.logindata.email);
                    $state.go('home', {
                        reload: true
                    });
                    ionicLoading.unload();
                }, function (err) {
                    $scope.loginerror = errMessage(err);
                });
        };

        $scope.createAccount = function () {
            $scope.err = null;
            if (assertValidAccountProps()) {
                var email = $scope.email;
                var pass = $scope.pass;
                // create user credentials in Firebase auth system
                Auth.$createUser({email: email, password: pass})
                    .then(function () {
                        // authenticate so we have permission to write to Firebase
                        return Auth.$authWithPassword({email: email, password: pass});
                    })
                    .then(function (user) {
                        // create a user profile in our data store
                        var ref = fbutil.ref('users', user.uid);
                        return fbutil.handler(function (cb) {
                            ref.set({email: email, name: name || firstPartOfEmail(email)}, cb);
                        });
                    })
                    .then(function (/* user */) {
                        // redirect to the account page
                        $location.path('/account');
                    }, function (err) {
                        $scope.err = errMessage(err);
                    });
            }
        };

        function assertValidAccountProps() {
            if (!$scope.email) {
                $scope.err = 'Please enter an email address';
            }
            else if (!$scope.pass || !$scope.confirm) {
                $scope.err = 'Please enter a password';
            }
            else if ($scope.createMode && $scope.pass !== $scope.confirm) {
                $scope.err = 'Passwords do not match';
            }
            return !$scope.err;
        }

        function errMessage(err) {
            return angular.isObject(err) && err.code ? err.code : err + '';
        }

        function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@')) || '');
        }

        function ucfirst(str) {
            // inspired by: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        }
    })
    .controller('LogoutCtrl',
    function (localStorageService, $scope, simpleLogin, $location, ionicLoading, $log, $ionicActionSheet) {
        $scope.$watch('action', function (data) {
            if (data !== true) {
                return
            }
            ionicLoading.load('logout......');
            localStorageService.remove('E0001', 'E0002', 'E0004', 'E0005');
            simpleLogin.logout();

        });

        $scope.tryLogout = function () {
            var destructiveText = 'Logout', cancelText = 'Cancel';
            $scope.action = false;
            $ionicActionSheet.show({
                destructiveText: destructiveText + ' <i class="icon ion-log-out">',
                cancelText: cancelText,
                cancel: function () {
                    $scope.action = false;
                },

                destructiveButtonClicked: function () {
                    $scope.action = true;
                }
            });

        };

    })
;