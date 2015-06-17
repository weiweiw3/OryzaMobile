/**
 * Created by c5155394 on 2015/2/5.
 */
'use strict';

angular.module('myApp.controllers.login', [ ])

    .controller('LogoutCtrl',
    function (localStorageService,$scope, simpleLogin, $location, ionicLoading, $log, $ionicActionSheet) {
        $scope.$watch('action', function (data) {
            if (data !== true) {
                return
            }
            ionicLoading.load('logout......');
            localStorageService.remove('E0001', 'E0002','E0004', 'E0005');
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
