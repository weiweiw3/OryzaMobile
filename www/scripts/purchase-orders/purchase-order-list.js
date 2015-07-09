(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrderList', ['ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);


    app.controller('ionListViewCtrl',
        function (ionicLoading, viewObject, $firebaseArray, $state,
                  $location, $timeout, $scope) {
            $scope.viewObject = viewObject;

            //$scope.viewTitle = ionList.key;
            // create a scrollable reference
            $scope.condition = function (ref) {
                var deferred = $q.defer();
                fbutil.ref([ref]).once('value', function (snap) {
                    deferred.resolve(snap.val() === null);
                });
                return deferred.promise;
            };

            // create a scrollable reference
            var scrollRef = new Firebase.util.Scroll(viewObject.ref, viewObject.scroll);
            ionicLoading.load('loading');
            // create a synchronized array on scope
            $scope.ionList ={
                array:$firebaseArray(scrollRef),
                ref:scrollRef.toString().replace(scrollRef.root().toString(), '')
            };
            //$scope.ionList = $firebaseArray(scrollRef);
            //$scope.ionListRef = scrollRef.toString().replace(scrollRef.root().toString(), '');
            //console.log($scope.ionListRef );

            // load the first three contacts
            scrollRef.scroll.next(3);
            $scope.ionList.array.$loaded()
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
    app.directive('e0001', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0001.html'
        };
    }).directive('e0001Item', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0001-item.html'
        };
    }).directive('e0004', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0004.html'
        };
    }).directive('e0004Item', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0004-item.html'
        };
    }).directive('e0002', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0002.html'
        };
    }).directive('e0005', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0005.html'
        };
    }).directive('e0005Item', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0005-item.html'
        };
    }).directive('e0022', function () {
        return {
            restrict: 'E',
            scope: {ionList: '='},
            templateUrl: 'scripts/purchase-orders/e0022.html'
        };
    });
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('ionListView', {
                url: '/:viewName/:index?key',
                templateUrl: 'scripts/hr/time-sheet-list.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    viewObject: function (fbutil, ionicLoading, $stateParams) {
                        if ($stateParams.viewName === 'E0001') {
                            return {
                                key: $stateParams.viewName,
                                title: 'Purchase Orders',
                                ref: fbutil.ref([$stateParams.index, 'PO_HEADERS']),
                                scroll: 'po_NUMBER'
                            };
                        }
                        if ($stateParams.viewName === 'E0001-item') {
                            return {
                                key: $stateParams.viewName,
                                title: 'Purchase Order ' + $stateParams.key,
                                ref: fbutil.ref([$stateParams.index]),
                                scroll: '-po_ITEM'
                            };
                        }
                        if ($stateParams.viewName === 'E0004') {
                            return {
                                key: $stateParams.viewName,
                                title: 'Purchase Requests',
                                ref: fbutil.ref([$stateParams.index, 'REQUIREMENT_ITEMS']),
                                scroll: '$priority'
                            };
                        }
                        if ($stateParams.viewName === 'E0004-item') {
                            return {
                                key: $stateParams.viewName,
                                title: 'Purchase Request ' + $stateParams.key,
                                ref: fbutil.ref([$stateParams.index]),
                                scroll: '-preq_ITEM'
                            };
                        }
                        if ($stateParams.viewName === 'E0002') {
                            return {
                                key: $stateParams.viewName,
                                title: 'PO Approve History Messages',
                                ref: fbutil.ref([$stateParams.index]),
                                scroll: 'key()'
                            };
                        }

                        if ($stateParams.viewName === 'E0005') {
                            return {
                                key: $stateParams.viewName,
                                title: 'PR Approve History Messages',
                                ref: fbutil.ref([$stateParams.index]),
                                scroll: 'key()'
                            };
                        }
                        if ($stateParams.viewName === 'E0005-item') {
                            return {
                                key: $stateParams.viewName,
                                title: 'Purchase Request ' + $stateParams.key,
                                ref: fbutil.ref([$stateParams.index]),
                                scroll: 'key()'
                            };
                        }
                        if ($stateParams.viewName === 'E0022') {
                            return {
                                key: $stateParams.viewName,
                                title: 'Time-Sheet',
                                ref: fbutil.ref(['Event/E0022/100001/CATSRECORDS_OUT']),
                                scroll: '$priority'
                            };
                        }
                    }
                }
            })


        ;
    }]);
})(angular);