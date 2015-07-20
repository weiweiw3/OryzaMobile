(function (angular) {
    "use strict";

    var app = angular.module('myApp.search', ['ngResource', 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase', 'elasticsearch']);

    app.controller('searchOptionCtrl', function ($scope) {

        $scope.sideList = [
            {text: "customer", value: "view_customer_contact"},
            {text: "vendor", value: "view_vendor_contact"},
            {text: "material", value: "e0015_makt"}
        ];

    });
    //NOTE: We are including the constant `ApiEndpoint` to be used here.
    app.factory('Api', function ($http, $q, taskUrl) {
        var getApiData = function (table, where) {
            var q = $q.defer();
            var str = taskUrl.url + '/searchData?company_guid=40288b8147cd16ce0147cd236df20000&' +
                'table_name=' + table +
                '&str_where=' + where;
            console.log(str);
            $http.get(str)
                .success(function (jsonObj) {
                    if (typeof jsonObj == 'object' && jsonObj instanceof Array) {
                        for (var i = 0; i < jsonObj.length; i++) {
                            var o = jsonObj[i];
                        }
                    }
                    //console.log(jsonObj);
                    q.resolve(jsonObj);
                })
                .error(function (data, status, headers, config) {
                    console.log(data, status, headers, config);
                    q.reject(data);
                });
            return q.promise;
        };
        return {
            getApiData: getApiData
        };
    })
        .factory('ESService',
        ['$q', 'esFactory', '$location', '$localstorage', 'SearchUrl', function ($q, elasticsearch, $location, $localstorage, SearchUrl) {
            var client = elasticsearch({
                //host: "https://a1b5amni:7smeg06ujbchru2l@apricot-2272737.us-east-1.bonsai.io/"
                host: SearchUrl.url
            });
            var search = function (table, term, offset) {
                var deferred = $q.defer(), query, sort;

                function makeTerm(term, matchWholeWords) {
                    if (!matchWholeWords) {
                        if (!term.match(/^\*/)) {
                            term = '*' + term;
                        }
                        if (!term.match(/\*$/)) {
                            term += '*';
                        }
                    }
                    return term;
                }

                if (!term) {
//                    query = {
//                        "match_all": {}
//                    };
                } else {
                    query = {

                        "query_string": {query: makeTerm(term, false)}
                    }
                }

                console.log(table);
                client.search({
                    //   "index": 'firebase',
                    //"type": 'customer',
                    "index": '40288b8147cd16ce0147cd236df20000',
                    "type": table,
                    "body": {
                        "filter": {
                            "limit": {"value": 5}
                        },
                        "query": query
                        //,
                        //"sort": sort
                    }
                }).then(function (result) {
                    var ii = 0, hits_in, hits_out = [];
                    hits_in = (result.hits || {}).hits || [];
                    for (; ii < hits_in.length; ii++) {
                        var data = hits_in[ii]._source;
                        var distance = {};
                        if (hits_in[ii].sort) {
                            distance = {"distance": parseFloat(hits_in[ii].sort[0]).toFixed(1)}
                        }
                        angular.extend(data, distance);
                        hits_out.push(data);
                    }
                    deferred.resolve(hits_out);
                }, deferred.reject);

                return deferred.promise;
            };

            return {
                "search": search
            };
        }]
    )
        .controller('searchDetailCtrl', function ($scope, $q, $timeout, ionicLoading, $stateParams, Api, localStorageService) {
            ionicLoading.load();
            //console.log($stateParams.index);
            $scope.searchObj = $stateParams.key;
            $scope.title = $stateParams.key + ' ' + $stateParams.index;

            if (typeof  localStorageService.get($stateParams.key) !== 'undefined'
                && localStorageService.get($stateParams.key) !== null) {
                $scope.searchHistory = localStorageService.get($stateParams.key);
            } else {
                $scope.searchHistory = [];
            }
            if ($scope.searchHistory.indexOf($stateParams.index) === -1) {
                $scope.searchHistory.push($stateParams.index);
            }
            ;

            localStorageService.set($stateParams.key, $scope.searchHistory);
            var querys = [
                {
                    key: 'material',
                    name: 'info',
                    text: 'bacis information',
                    table: 'e0015_makt',
                    where: 'MATNR=/' + $stateParams.index + '/'
                }, {
                    key: 'material',
                    name: 'stock',
                    text: 'stock',
                    table: 'view_material_stock',
                    where: 'MATNR=/' + $stateParams.index + '/'
                }, {
                    key: 'customer',
                    name: 'info',
                    text: 'bacis information',
                    table: 'e0015_KNA1',
                    where: 'KUNNR=/' + $stateParams.index + '/'
                }
                , {
                    key: 'customer',
                    name: 'info',
                    text: 'contacts',
                    table: 'view_customer_contact',
                    where: 'KUNNR=/' + $stateParams.index + '/'
                }
                //TODO orderby 怎么写
                , {
                    key: 'customer',
                    name: 'info',
                    text: 'related SO',
                    table: 'e0015_vbak',
                    where: 'KUNNR=/' + $stateParams.index + '/ '
                }, {
                    key: 'vendor',
                    name: 'info',
                    text: 'bacis information',
                    table: 'e0015_LFA1',
                    where: 'LIFNR=/' + $stateParams.index + '/'
                }
                , {
                    key: 'vendor',
                    name: 'info',
                    text: 'contacts',
                    table: 'view_vendor_contact',
                    where: 'LIFNR=/' + $stateParams.index + '/'
                }
            ];
            $scope.results = [];
            console.log(querys.length);
            var i = 0;
            angular.forEach(querys, function (query) {

                i++;
                if ($stateParams.key === query.key) {
                    Api.getApiData(query.table, query.where)
                        .then(function (data) {
                            console.log(data);
                            $scope.results.push({
                                text: query.text,
                                data: data[0]
                            });
                        })
                        .catch(function () {
                            console.log('Assign only failure callback to promise');
                            // This is a shorthand for `promise.then(null, errorCallback)`
                        });
                }
                if (i == 7) {
                    $timeout(function () {
                        ionicLoading.unload();
                    }, 1000);
                }
            });

            $scope.refresh = function () {
                //TODO refresh event
                console.log('$scope.refresh');
                console.log($scope.results);
                $scope.$broadcast('scroll.refreshComplete');
            };

        })
        .
        controller('searchCtrl', function (searchObj, $http, $q, Api, $resource, $scope, ESService, localStorageService) {
            $scope.searchObj = searchObj;
            $scope.query = "";
            if (typeof  localStorageService.get($scope.searchObj.text) !== 'undefined'
                && localStorageService.get($scope.searchObj.text) !== null) {
                $scope.searchHistory = localStorageService.get($scope.searchObj.text);

            } else {
                $scope.searchHistory = [];

            }

            $scope.deleteHistory = function (result) {
                var index = $scope.searchHistory.indexOf(result);
                //console.log(index+' '+$scope.searchHistory.indexOf(index));
                if (index > -1) {
                    $scope.searchHistory.splice(index, 1);
                    localStorageService.set($scope.searchObj.text, $scope.searchHistory);
                }

            };
            console.log($scope.searchObj.text + ' ' + $scope.searchHistory);
            var doSearch = ionic.debounce(function (query) {
                ESService.search($scope.searchObj.value, query, 0).then(function (results) {
                    console.log(results);
                    $scope.results = results;

                });
            }, 500);

            $scope.search = function (query) {
                doSearch(query);
            }
        });


    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('search', {
                url: '/search/:text?value',
                templateUrl: 'scripts/search/search.html',
                controller: 'searchCtrl',
                cache: false,
                resolve: {
                    searchObj: function ($stateParams) {
                        return {
                            value: $stateParams.value,
                            text: $stateParams.text
                        };
                    }
                }
            })
            .state('searchDetail', {
                url: '/searchDetail/:key?index',
                templateUrl: 'scripts/search/search_detail.html',
                controller: 'searchDetailCtrl',
                resolve: {
                    searchObj: function ($stateParams) {
                        return {
                            key: $stateParams.key,
                            index: $stateParams.index
                        };
                    }
                }
            })

            .state('searchOption', {
                url: '/searchOption',
                templateUrl: 'scripts/search/search-option.html',
                controller: 'searchOptionCtrl'
            });
    }]);
})
(angular);