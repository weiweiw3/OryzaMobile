(function (angular) {
    "use strict";

    var app = angular.module('myApp.listTemplate', []);

    app
        .controller('ionListESViewCtrl',
        function (ionicLoading, stateParamsObject, $state,
                  $location, $timeout, $scope, jsonFactory) {
            console.log(stateParamsObject);
            $scope.results = stateParamsObject.array;
            jsonFactory.hospitals('search-lists').then(function (data) {
                if (typeof data[stateParamsObject.table].primaryKey === 'string') {

                    $scope.primaryKey = data[stateParamsObject.table].primaryKey;
                } else {
                    $scope.primaryKeys = [];
                    angular.forEach(data[stateParamsObject.table].primaryKey, function (key) {
                        $scope.primaryKeys.push(key);
                    });
                }

                $scope.searchLink = data[stateParamsObject.table].searchLink;
            });
            $scope.go = function (data) {
                var valueArr = [];
                angular.forEach($scope.primaryKeys, function (key) {
                    valueArr.push(data[key]);

                });
                //console.log(valueArr);
                //console.log($scope.primaryKeys);
                $state.go('singlePageTemplate',
                    {table: $scope.searchLink, key: $scope.primaryKeys, value: valueArr});

            }
        })

        .controller('ionListFBViewCtrl',
        function (ionicLoading, stateParamsObject, $firebaseArray, $state,jsonFactory,
                  $location, $timeout, $scope) {
            $scope.stateParamsObject = stateParamsObject;
            $scope.lowercase_viewName = angular.lowercase(stateParamsObject.viewName);

            $scope.condition = function (ref) {
                var deferred = $q.defer();
                fbutil.ref([ref]).once('value', function (snap) {
                    deferred.resolve(snap.val() === null);
                });
                return deferred.promise;
            };

            var scrollRef = new Firebase.util
                .Scroll($scope.stateParamsObject.ref, $scope.stateParamsObject.scroll);

            ionicLoading.load('loading');
            // create a synchronized array on scope
            $scope.ionList = {
                array: $firebaseArray(scrollRef),
                ref: scrollRef.toString().replace(scrollRef.root().toString(), '')
            };
            // load the first three records
            scrollRef.scroll.next(2);
            $scope.ionList.array.$loaded()
                .then(function () {
                    ionicLoading.unload();
                });
            $scope.ionList.array.$watch(function (data) {
                if (data === "child_added") {
                    ionicLoading.load();
                    //TODO lookup字段
                    //jsonFactory.lookup('',)
                }
                console.log(event);
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
                if (!scrollRef.scroll.hasNext()) {
                    console.log('no more');
                }
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


    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('ionListFBView', {
                url: '/ionListFBView/:viewName/:index?key',
                templateUrl: 'scripts/list-template/fb-list-template.html',
                controller: 'ionListFBViewCtrl',
                resolve: {
                    stateParamsObject: function (fbutil, ionicLoading, $stateParams) {
                        var obj = {
                            viewName: $stateParams.viewName,
                            key: $stateParams.key,
                            ref: fbutil.ref([$stateParams.index]),
                            scroll: 'key()'
                        };
                        console.log($stateParams.viewName);
                        switch ($stateParams.viewName) {
                            case 'E0001':
                                return angular.extend(obj, {
                                    ref: fbutil.ref([$stateParams.index, 'PO_HEADERS'])
                                });
                                break;
                            case 'E0004':
                                return angular.extend(obj, {
                                    ref: fbutil.ref([$stateParams.index, 'REQUIREMENT_ITEMS'])
                                });
                                break;
                            case 'E0022':
                                console.log('x');
                                return angular.extend(obj, {
                                    ref: fbutil.ref(['Event/E0022/100001/CATSRECORDS_OUT'])
                                });
                                break;
                            default:              //'E0001-item' || 'E0002' || 'E0004-item' || 'E0005' || 'E0005-item'
                                return obj;
                                break;

                        }
                    }
                }
            })
            .state('ionListESView', {
                url: '/ionListESView/:table/?key?value',
                templateUrl: 'scripts/list-template/es-list-template.html',
                controller: 'ionListESViewCtrl',
                resolve: {
                    stateParamsObject: function (jsonFactory, $state, ESService,
                                                 ionicLoading, $q, $stateParams) {
                        var d = $q.defer();
                        console.log($stateParams.key);

                        console.log($stateParams.value);
                        jsonFactory.loadData($stateParams.table, $stateParams.key, $stateParams.value)
                            .then(function (results) {
                                console.log(results);
                                //列表才显示，只有一条跳转其他
                                if (!angular.isArray(results)) {
                                    console.log('1 row');

                                    $state.go('singlePageTemplate',
                                        {
                                            table: $stateParams.table,
                                            key: $stateParams.key, value: $stateParams.value
                                        });
                                    d.reject('1 row');
                                } else {
                                    d.resolve({
                                        array: results,
                                        table: $stateParams.table
                                    });
                                }
                            }).catch(function (err) {
                                console.log(err);
                                d.reject(err);
                            });

                        return d.promise;

                    }
                }
            });
    }]);
})(angular);