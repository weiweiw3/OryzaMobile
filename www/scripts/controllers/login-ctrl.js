/**
 * Created by c5155394 on 2015/2/5.
 */
'use strict';

angular.module('myApp.controllers.login', [ ])

    .controller('loginCtrl', function
        ($localstorage, $scope, simpleLogin, $location,
         ionicLoading, $log, $state, $timeout) {

        $scope.data = {
            isLoading: false
        };
        var logindata = $localstorage.getObject('logindata');
        if (logindata === undefined || logindata === null) {
            $scope.logindata = {
                email: '',
                password: '',
                remember: true
            };
        } else
        {
            $scope.logindata = logindata;
        }

        $scope.$log = $log;
        $scope.tryLogin = function () {
            ionicLoading.load('Login...');
            simpleLogin.login($scope.logindata.email,
                $scope.logindata.password)
                .then(function (/* user */) {
                    $localstorage.setObject('logindata', {
                        email: $scope.logindata.email,
                        password: $scope.logindata.password,
                        remember: true
                    });
                    $state.go('tab.messages');
                }, function (err) {
                    $log.error(errMessage(err));
                    $scope.loginerror = errMessage(err);
                })
                .then(function(){
                    ionicLoading.unload();
                });
        };

        function assertValidAccountProps() {
            if (!$scope.logindata.email) {
                $scope.err = 'Please enter an email address';
            }
            else if (!$scope.logindata.pass) {
                $scope.err = 'Please enter a password';
            }
            console.log($scope.logindata.email, $scope.logindata.pass, $scope.logindata.remember, $scope.err);
            return !$scope.err;
        }

        function errMessage(err) {
            return angular.isObject(err) && err.code ? err.code : err + '';
        }
    })
    .controller('LogoutCtrl',
    function ($scope, simpleLogin, $location, ionicLoading, $log, $ionicActionSheet) {
        $scope.$watch('action', function (data) {
            if (data !== true) {
                return
            }
            ionicLoading.load('logout......');
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
