(function (angular) {
    "use strict";

    var app = angular.module('myApp.search', ['ngResource', 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase', 'elasticsearch']);

    app.controller('searchOptionCtrl', function ($scope, $state) {

        $scope.sideList = [
            {text: "customer", value: "view_customer_contact"},
            {text: "vendor", value: "view_vendor_contact"},
            {text: "material", value: "e0015_makt"}
        ];


    });
    //NOTE: We are including the constant `ApiEndpoint` to be used here.
    app.factory('Api', function ($http, $q, ApiEndpoint) {
        var getApiData = function (table, where) {
            var q = $q.defer();
//            var str = 'http://114.215.185.243:8080/data-app/rs/task/searchData?company_guid=40288b8147cd16ce0147cd236df20000&table_name=e0015_KNA1&str_where=KUNNR=/' + customerID + '/';
            //elastic search的页面http://114.215.185.243:9200/_plugin/head/
            //var str = 'http://114.215.185.243:8080/data-app/rs/task/searchData?company_guid=40288b8147cd16ce0147cd236df20000&table_name=e0015_LFA1&str_where=LIFNR=/' + customerID + '/';
            var str = ApiEndpoint.url + '/searchData?company_guid=40288b8147cd16ce0147cd236df20000&' +
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
        ['$q', 'esFactory', '$location', '$localstorage', function ($q, elasticsearch, $location, $localstorage) {
            var client = elasticsearch({
//                host: "https://a1b5amni:7smeg06ujbchru2l@apricot-2272737.us-east-1.bonsai.io/"
                host: "http://114.215.185.243:9200"
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

//                var position = $localstorage.get('position');

//                if (position) {
//                    sort = [
//                        {
//                            "_geo_distance": {
//                                "location": position,
//                                "order": "asc",
//                                "unit": "km"
//                            }
//                        }
//                    ];
//                } else {
//                    sort = [];
//                }
                console.log(table);
                client.search({
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
        .controller('searchDetailCtrl', function ($scope, $stateParams, Api) {
            //console.log($stateParams.index);
            $scope.searchObj=$stateParams.key;
            $scope.title = $stateParams.key + ' ' + $stateParams.index;
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
                    },{
                        key: 'customer',
                        name: 'info',
                        text: 'bacis information',
                        table: 'e0015_KNA1',
                        where: 'KUNNR=/' + $stateParams.index + '/'
                    }
                    ,{
                        key: 'customer',
                        name: 'info',
                        text: 'contacts',
                        table: 'view_customer_contact',
                        where: 'KUNNR=/' + $stateParams.index + '/'
                    }
                    //TODO orderby 怎么写
                    ,{
                        key: 'customer',
                        name: 'info',
                        text: 'related SO',
                        table: 'e0015_vbak',
                        where: 'KUNNR=/' + $stateParams.index + '/ '
                    },{
                        key: 'vendor',
                        name: 'info',
                        text: 'bacis information',
                        table: 'e0015_LFA1',
                        where: 'LIFNR=/' + $stateParams.index + '/'
                    }
                    ,{
                        key: 'vendor',
                        name: 'info',
                        text: 'contacts',
                        table: 'view_vendor_contact',
                        where: 'LIFNR=/' + $stateParams.index + '/'
                    }
                ]
                ;
            $scope.results=[];
            angular.forEach(querys, function (query) {
                if ($stateParams.key === query.key) {

                    Api.getApiData(query.table, query.where)
                        .then(function (data) {
                            console.log(data);
                            $scope.results.push({
                                text:query.text,
                                data:data[0]
                            }) ;
                        })
                        .catch(function () {
                            console.log('Assign only failure callback to promise');
                            // This is a shorthand for `promise.then(null, errorCallback)`
                        });
                }
            });

            $scope.refresh = function () {
                //TODO refresh event
                console.log('$scope.refresh');
                $scope.$broadcast('scroll.refreshComplete');
            };

        })
        .controller('customerCtrl', function ($scope, $stateParams, Api) {
            //console.log($stateParams.index);
            $scope.title = 'material ' + $stateParams.index;
            var querys = [
                    {
                        name: 'info',
                        text: 'bacis information',
                        table: 'e0015_makt',
                        where: 'MATNR=/' + $stateParams.index + '/'
                    }, {
                        name: 'stock',
                        text: 'stock',
                        table: 'view_material_stock',
                        where: 'MATNR=/' + $stateParams.index + '/'
                    }
                ]
                ;

            angular.forEach(querys, function (query) {
                Api.getApiData(query.table, query.where)
                    .then(function (data) {
                        console.log(data[0]);
                        $scope[query.name] = data[0];
                    })
                    .catch(function () {
                        console.log('Assign only failure callback to promise');
                        // This is a shorthand for `promise.then(null, errorCallback)`
                    });
            });

            $scope.refresh = function () {
                //TODO refresh event
                console.log('$scope.refresh');
                $scope.$broadcast('scroll.refreshComplete');
            };

        })
        .controller('vendorCtrl', function ($scope, $stateParams, Api) {
            //console.log($stateParams.index);
            $scope.title = 'material ' + $stateParams.index;
            var querys = [
                    {
                        name: 'info',
                        text: 'bacis information',
                        table: 'e0015_makt',
                        where: 'MATNR=/' + $stateParams.index + '/'
                    }, {
                        name: 'stock',
                        text: 'stock',
                        table: 'view_material_stock',
                        where: 'MATNR=/' + $stateParams.index + '/'
                    }
                ]
                ;

            angular.forEach(querys, function (query) {
                Api.getApiData(query.table, query.where)
                    .then(function (data) {
                        console.log(data[0]);
                        $scope[query.name] = data[0];
                    })
                    .catch(function () {
                        console.log('Assign only failure callback to promise');
                        // This is a shorthand for `promise.then(null, errorCallback)`
                    });
            });

            $scope.refresh = function () {
                //TODO refresh event
                console.log('$scope.refresh');
                $scope.$broadcast('scroll.refreshComplete');
            };

        })
        .
        controller('searchCtrl', function (searchObj, $http, $q, Api, $resource, $scope, ESService) {
            $scope.searchObj = searchObj;
            $scope.query = "";
            var doSearch = ionic.debounce(function (query) {
                ESService.search($scope.searchObj.value, query, 0).then(function (results) {
                    console.log(results);
                    $scope.results = results;
//                    angular.forEach(results, function (value, key) {
//                        Api.getApiData(value.LIFNR)
//                            .then(function (data) {
//                                console.log(data);
//                                $scope.results[key].TELF1 = data[0].TELF1;
////                                console.log(data[0].TELF1);
//                            })
//                            .catch(function () {
//                                console.log('Assign only failure callback to promise');
//                                // This is a shorthand for `promise.then(null, errorCallback)`
//                            });
////                        console.log(value.KUNNR, key);
//                    });
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
                controller: 'searchDetailCtrl'
            })

            .state('searchOption', {
                url: '/searchOption',
                templateUrl: 'scripts/search/search-option.html',
                controller: 'searchOptionCtrl'
            });
    }]);
})
(angular);