(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrderList', [ 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);

    app.controller('purchaseOrderListCtrl',
        function (ionicLoading,purchaseOrders, $firebaseArray, $state,
                   $location, $timeout, $scope) {
            // create a scrollable reference
            var scrollRef = new Firebase.util.Scroll(purchaseOrders, 'po_NUMBER');
            // create a synchronized array on scope
            $scope.messages = $firebaseArray(scrollRef);
            $scope.messagesRef = scrollRef.toString().replace(scrollRef.root().toString(),'');
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
//                if(!scrollRef.scroll.hasNext()){
//                    console.log('no more');
//                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
        });
    app.controller('purchaseOrdersApproveMessagesCtrl',
        function (ionicLoading,purchaseOrdersApproveMessages, $firebaseArray, $state,
                  $location, $timeout, $scope) {
            console.log('x');
            // create a scrollable reference

            var scrollRef = new Firebase.util.Scroll(purchaseOrdersApproveMessages, 'key()');
            // create a synchronized array on scope
            $scope.messages = $firebaseArray(scrollRef);
            $scope.messagesRef = scrollRef.toString().replace(scrollRef.root().toString(),'');
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
//                if(!scrollRef.scroll.hasNext()){
//                    console.log('no more');
//                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
        });
//    app.factory('purchaseOrderListFactory',
//        function (currentUser, $firebaseObject, fbutil, $q) {
//            return {
//                ready: function (component, rel_grp) {
//                    return currentUser.getUser().then(function (user) {
//                        return fbutil.ref(['Event', component, user, rel_grp, 'PO_HEADERS']);
//                    })
//                }
//            };
//        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('purchaseOrders', {
            url: '/purchaseOrders/:index',
            templateUrl: 'scripts/purchase-orders/purchase-order-list.html',
            controller: 'purchaseOrderListCtrl',
            resolve: {
                purchaseOrders: function ($firebaseObject,fbutil,ionicLoading, $stateParams) {
                    ionicLoading.load('Loading');
                    var ref = fbutil.ref([$stateParams.index, 'PO_HEADERS']);
                    return $firebaseObject(ref)
                        .$loaded().then(function(){
                            ionicLoading.unload();
                            return ref;
                        });
                }
            }
        })
            .state('purchaseOrdersApproveMessages', {
                url: '/purchaseOrdersApproveMessages/:index',
                templateUrl: 'scripts/purchase-orders/purchase-order-approve-messages.html',
                controller: 'purchaseOrdersApproveMessagesCtrl',
                resolve: {
                    purchaseOrdersApproveMessages: function ($firebaseObject,fbutil,ionicLoading, $stateParams) {
                        ionicLoading.load('Loading');
                        console.log($stateParams.index);
                        var ref = fbutil.ref([$stateParams.index]);
                        return $firebaseObject(ref)
                            .$loaded().then(function(){
                                ionicLoading.unload();
                                return ref;
                            });
                    }
                }
            })
        ;
    }]);
})(angular);