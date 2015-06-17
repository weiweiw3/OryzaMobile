(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrderList', ['ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);


    app.controller('purchaseRequestListCtrl',
        function (ionicLoading, list, $firebaseArray, $state,
                  $location, $timeout, $scope) {

            // create a scrollable reference
            $scope.condition = function (ref) {
                var deferred = $q.defer();
                fbutil.ref([ref]).once('value', function (snap) {
                    deferred.resolve(snap.val() === null);
                });
                return deferred.promise;
            };

            // create a scrollable reference
            var scrollRef = new Firebase.util.Scroll(list.ref, list.scroll);
            ionicLoading.load('loading');
            // create a synchronized array on scope
            $scope.messages = $firebaseArray(scrollRef);
            $scope.messagesRef = scrollRef.toString().replace(scrollRef.root().toString(), '');

            // load the first three contacts
            scrollRef.scroll.next(3);
            $scope.messages.$loaded()
                .then(function () {
                    ionicLoading.unload();
                });

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
        })
        .directive('eatClickIf', ['$parse', '$rootScope',
            function ($parse, $rootScope) {
                return {
                    priority: 100,
                    restrict: 'A',
                    compile: function ($element, attr) {
                        var fn = $parse(attr.eatClickIf);
                        return {
                            pre: function link(scope, element) {
                                var eventName = 'click';
                                element.on(eventName, function (event) {
                                    var callback = function () {
                                        if (fn(scope, {$event: event})) {
                                            event.stopImmediatePropagation();
                                            event.preventDefault();
                                            return false;
                                        }
                                    };
                                    if ($rootScope.$$phase) {
                                        scope.$evalAsync(callback);
                                    } else {
                                        scope.$apply(callback);
                                    }
                                });
                            },
                            post: function () {
                            }
                        }
                    }
                }
            }
        ]);
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
                controller: 'purchaseRequestListCtrl',
                resolve: {
                    list: function ($firebaseObject, fbutil, ionicLoading, $stateParams) {
                        return {
                            ref: fbutil.ref([$stateParams.index, 'PO_HEADERS']),
                            scroll: 'po_NUMBER'
                        };
                    }
                }
            })
            .state('purchaseOrdersApproveMessages', {
                url: '/purchaseOrdersApproveMessages/:index',
                templateUrl: 'scripts/purchase-orders/purchase-order-approve-messages.html',
                controller: 'purchaseRequestListCtrl',
                resolve: {
                    list: function ($firebaseObject, fbutil, ionicLoading, $stateParams) {
                        return {
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: 'key()'
                        };
                    }
                }
            })
            .state('purchaseRequests', {
                url: '/purchaseRequests/:index',
                templateUrl: 'scripts/purchase-orders/purchase-request-list.html',
                controller: 'purchaseRequestListCtrl',
                resolve: {
                    list: function ($firebaseObject, fbutil, ionicLoading, $stateParams) {
                        return {
                            ref: fbutil.ref([$stateParams.index, 'REQUIREMENT_ITEMS']),
                            scroll: '$priority'
                        };
                    }
                }
            })
            .state('purchaseRequestApproveList', {
                url: '/purchaseRequestApproveList:index',
                templateUrl: 'scripts/purchase-orders/purchase-request-approve-list.html',
                controller: 'purchaseRequestListCtrl',
                resolve: {
                    list: function ($firebaseObject, fbutil, ionicLoading, $stateParams) {
                        return {
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: 'key()'
                        };
                    }
                }
            })
            .state('purchaseRequestApproveMessage', {
                url: '/purchaseRequestApproveMessage/:index',
                templateUrl: 'scripts/purchase-orders/purchase-request-approve-message.html',
                controller: 'purchaseRequestListCtrl',
                resolve: {
                    list: function ($firebaseObject, fbutil, ionicLoading, $stateParams) {
                        return {
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: 'key()'
                        };
                    }
                }
            })
        ;
    }]);
})(angular);