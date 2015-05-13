(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrderItems', [ 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);

    app.controller('purchaseOrderItemsCtrl',
        function (purchaseOrderItems, $firebaseArray, $state, $location, $timeout, $scope) {
            console.log(purchaseOrderItems.toString());
//            create a scrollable reference
            $scope.PURCHASEORDER = purchaseOrderItems.key();
            var scrollRef = new Firebase.util.Scroll(purchaseOrderItems, '-po_ITEM');
            // create a synchronized array on scope
            $scope.messages = $firebaseArray(scrollRef);
            $scope.messagesRef = scrollRef.toString().replace(scrollRef.root().toString(), '');

            // load the first three contacts
            scrollRef.scroll.next(3);
            $scope.refresh = function () {
                //TODO refresh event
                console.log('$scope.refresh');
                $scope.$broadcast('scroll.refreshComplete');
            };
            // This function is called whenever the user reaches the bottom
            $scope.loadMore = function () {
                // load the next contact
                scrollRef.scroll.next(1);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
        });

    app.factory('purchaseOrderItemsFactory',
        function ($firebaseObject, fbutil) {
            return function (ref) {
                return fbutil.ref(ref);
            };
        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('purchaseOrderItems', {
                url: '/purchaseOrderItems/:ref?index',
                templateUrl: 'scripts/purchase-orders/purchase-order-items.html',
                controller: 'purchaseOrderItemsCtrl',
                resolve: {
                    purchaseOrderItems: function (ionicLoading, $stateParams, fbutil) {
//                    ionicLoading.load('Loading');
                        return fbutil.ref($stateParams.ref);
                    }
                }
            })
            .state('purchaseOrderItemDetail', {
                url: '/purchaseOrderItem/:ref',
                templateUrl: 'scripts/purchase-orders/purchase-order-items.html',
                controller: 'purchaseOrderItemsCtrl',
                resolve: {
                    purchaseOrderItemDetail: function (ionicLoading, $stateParams,
                                                       purchaseOrderItemsFactory) {
//                    ionicLoading.load('Loading');
                        return purchaseOrderItemsFactory($stateParams.ref);
                    }
                }
            });
    }]);
})(angular);