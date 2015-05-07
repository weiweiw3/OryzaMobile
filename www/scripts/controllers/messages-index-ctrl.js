angular.module('myApp.controllers.messagesIndex', [])

    //for messages.html
    //purpose: read data from myComponent, and show components list and unread number.
    .controller('messagesIndexCtrl', function ($scope, $log, ionicLoading, myComponent) {
        var ctrlName = 'messagesCtrl';

        $scope.components = myComponent.array;
        $scope.$on('$viewContentLoaded', function () {
            ionicLoading.load('Loading');
            $log.info(ctrlName, 'has loaded');
        });
        $scope.refresh=function(){
            console.log('$scope.refresh');
            $scope.$broadcast('scroll.refreshComplete');
        };
        $scope.$log = $log;

        $scope.components.$loaded().then(function () {
            $log.info(ctrlName, "Initial data received!");
            ionicLoading.unload();
        });

        $scope.$on('myComponent.update', function (event) {
            $scope.components.$loaded().then(function () {
                $log.info(ctrlName, "myComponent.update");
            });
        });

        $scope.$on('$destroy', function () {
//            ionicLoading.unload();
            $log.info(ctrlName, 'is no longer necessary');
        });
    });
