(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrderList', ['ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);


    app.controller('ionListViewCtrl',
        function (ionicLoading, list, $firebaseArray, $state,
                  $location, $timeout, $scope) {
            $scope.viewTitle = list.title;
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
            $scope.ionList = $firebaseArray(scrollRef);
            $scope.messagesRef = scrollRef.toString().replace(scrollRef.root().toString(), '');

            // load the first three contacts
            scrollRef.scroll.next(3);
            $scope.ionList.$loaded()
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
app.directive('purchaseOrderList', function () {
    return {
        restrict: 'E',
        scope: {ionList: '='},
        templateUrl: 'scripts/purchase-orders/purchase-order-list.html'
    };
});
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('ionListView', {
                url: '/:viewName/:index?key',
                templateUrl: 'scripts/hr/time-sheet-list.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        console.log($stateParams.viewName);
                        return {
                            title: 'Purchase Orders',
                            ref: fbutil.ref([$stateParams.index, 'PO_HEADERS']),
                            scroll: 'po_NUMBER'
                        };
                    }
                }
            })

            .state('purchaseOrders', {
                url: '/purchaseOrders/:index',
                templateUrl: 'scripts/purchase-orders/purchase-order-list.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        return {
                            title: 'Purchase Orders',
                            ref: fbutil.ref([$stateParams.index, 'PO_HEADERS']),
                            scroll: 'po_NUMBER'
                        };
                    }
                }
            })
            .state('purchaseOrderItems', {
                url: '/purchaseOrderItems/:index?key',
                templateUrl: 'scripts/purchase-orders/purchase-order-items.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        return {
                            title: 'Purchase Order ' + $stateParams.key,
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: '-po_ITEM'
                        };
                    }
                }
            })
            .state('purchaseOrdersApproveMessages', {
                url: '/purchaseOrdersApproveMessages/:index',
                templateUrl: 'scripts/purchase-orders/purchase-order-approve-messages.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        return {
                            title: 'History Messages',
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: 'key()'
                        };
                    }
                }
            })
            .state('purchaseRequests', {
                url: '/purchaseRequests/:index',
                templateUrl: 'scripts/purchase-orders/purchase-request-list.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        return {
                            title: 'Purchase Requests',
                            ref: fbutil.ref([$stateParams.index, 'REQUIREMENT_ITEMS']),
                            scroll: '$priority'
                        };
                    }
                }
            })
            .state('purchaseRequest', {
                url: '/purchaseRequest/:index?key',
                templateUrl: 'scripts/purchase-orders/purchase-request-index.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        return {
                            title: 'Purchase Request ' + $stateParams.key,
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: '-preq_ITEM'
                        };
                    }
                }
            })
            .state('purchaseRequestApproveList', {
                url: '/purchaseRequestApproveList:index',
                templateUrl: 'scripts/purchase-orders/purchase-request-approve-list.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        return {
                            title: 'History Messages',
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: 'key()'
                        };
                    }
                }
            })
            .state('purchaseRequestApproveMessage', {
                url: '/purchaseRequestApproveMessage/:index?key',
                templateUrl: 'scripts/purchase-orders/purchase-request-approve-message.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, ionicLoading, $stateParams) {
                        return {
                            title: 'Purchase Request ' + $stateParams.key,
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: 'key()'
                        };
                    }
                }
            })
        ;
    }]);
})(angular);