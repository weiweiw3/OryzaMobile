angular.module('myApp.controllers.messagesIndex', [])

    //for messages.html
    //purpose: read data from myComponent, and show components list and unread number.
    .controller('messagesIndexCtrl', function ($scope, $log, ionicLoading, myComponent) {
        var ctrlName = 'messagesCtrl';

        $scope.components = myComponent.array;

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
        $scope.$on('$viewContentLoaded', function () {
            ionicLoading.load('loading Message');
            $log.info(ctrlName, 'has loaded');
//            $log.log();
//            $log.warn(message)
//            $log.info(message)
//            $log.error(message)
        });
        $scope.$on('$destroy', function () {
            ionicLoading.unload();
            $log.info(ctrlName, 'is no longer necessary');
        });

        $scope.data = {
            showDelete: false
        };

        $scope.edit = function (item) {
            alert('Edit Item: ' + item.id);
        };
        $scope.share = function (item) {
            alert('Share Item: ' + item.id);
        };

        $scope.moveItem = function (item, fromIndex, toIndex) {
            $scope.components.splice(fromIndex, 1);
            $scope.components.splice(toIndex, 0, item);
        };

        $scope.onItemDelete = function (item) {
            $scope.components.splice($scope.components.indexOf(item), 1);
        };
//        $scope.$on("$routeChangeStart",
//            function (event, current, previous, rejection) {
//                console.log('$routeChangeStart');
//                //console.log($scope, $rootScope, $route, $location);
//            });
//        $scope.$on("$routeChangeSuccess",
//            function (event, current, previous, rejection) {
//                console.log('$routeChangeSuccess');
////                console.log($scope, $rootScope, $route, $location);
//            });
    })
