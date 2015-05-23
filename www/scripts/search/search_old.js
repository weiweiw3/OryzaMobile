(function (angular) {
    "use strict";

    var app = angular.module('myApp.search', [ 'ngResource', 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase', 'elasticsearch']);

    app
//NOTE: We are including the constant `ApiEndpoint` to be used here.
        .factory('Api', function($http, $q, ApiEndpoint) {
            console.log('ApiEndpoint', ApiEndpoint);

            var getApiData = function(customerID) {
                var q = $q.defer();
                var headers = {
                    'Access-Control-Allow-Origin' : '*',
                    'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };

                return $http({
                    method: "GET",
                    headers: headers,
                    url: ApiEndpoint.url+'/searchData?company_guid=40288b8147cd16ce0147cd236df20000&table_name=e0015_KNA1&str_where=KUNNR=/'+customerID+'/'
                }).success(function(jsonObj) {
                    if(typeof jsonObj == 'object' && jsonObj instanceof Array){
                        console.log(jsonObj) ;
                        console.log('-------------------------------------------------------------------------------------------------------')
                        console.log(jsonObj[0].ERNAM) ;

                        console.log('=======================================================================================================')
                        for(var i = 0; i < jsonObj.length; i++){
                            var o = jsonObj[i] ;
//                            for(var k in o){
//                                console.log(k + '----->' + o[k])
//                            }
                        }
                    }
                console.log(jsonObj);
                }).error(function(data, status, headers, config) {

                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
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
//                host: $location.host() + ":9200"
                host: "https://a1b5amni:7smeg06ujbchru2l@apricot-2272737.us-east-1.bonsai.io/"
            });

            var search = function (term, offset) {
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

                        "query_string": { query: makeTerm(term, false) }
                    }
                }

                var position = $localstorage.get('position');

                if (position) {
                    sort = [
                        {
                            "_geo_distance": {
                                "location": position,
                                "order": "asc",
                                "unit": "km"
                            }
                        }
                    ];
                } else {
                    sort = [];
                }

                client.search({
                    "index": 'firebase',
                    "type": 'customer',
                    "body": {
                        "filter": {
                            "limit": {"value": 5}
                        },
                        "query": query,
                        "sort": sort
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
//        .factory('customerData',function($resource,$q){
//            return {
//                getcustomerData: function() {
//                    // the $http API is based on the deferred/promise APIs exposed by the $q service
//                    // so it returns a promise for us by default
//                    return $resource( 'http://114.215.185.243:8080/data-app/rs/task/searchData?company_guid=40288b8147cd16ce0147cd236df20000&table_name=e0015_KNA1&str_where=KUNNR=/0000000001/',
//                        { callback: "JSON_CALLBACK", format:'jsonp' },
//                        {
//                            method1: {
//                                method: 'JSONP'
//                            }
//                        } );
//                }
//            };
//        })
        .service('customerData', function($http,$q) {

            var headers = {
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            return $http({
                host: 'localhost',
                port: '8100',
                method: "GET",
                headers: headers,
                url: '/data-app/rs/task/searchData?company_guid=40288b8147cd16ce0147cd236df20000&table_name=e0015_KNA1&str_where=KUNNR=/0000000001/'
            }).success(function(jsonObj) {
                if(typeof jsonObj == 'object' && jsonObj instanceof Array){
                    console.log(jsonObj) ;

                    console.log('-------------------------------------------------------------------------------------------------------')
                    console.log(jsonObj[0].ERNAM) ;

                    console.log('=======================================================================================================')
                    for(var i = 0; i < jsonObj.length; i++){
                        var o = jsonObj[i] ;
                        for(var k in o){
                            console.log(k + '----->' + o[k])
                        }
                    }
                }
//                console.log(result);
            }).error(function(data, status, headers, config) {

                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
            });

        })
        .factory('Flickr', function ($resource, $q) {
            var photosPublic = $resource('http://api.flickr.com/services/feeds/photos_public.gne',
                { format: 'json', jsoncallback: 'JSON_CALLBACK' },
                { 'load': { 'method': 'JSONP' } });

            return {
                search: function (query) {
                    var q = $q.defer();
                    photosPublic.load({
                        tags: query
                    }, function (resp) {
                        q.resolve(resp);
                    }, function (err) {
                        q.reject(err);
                    })

                    return q.promise;
                }
            }
        })

        .controller('searchCtrl', function ($http, $q,Api,$resource,$scope, ESService) {
//            var headers = {
//                'Access-Control-Allow-Origin' : '*',
//                'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
//                'Content-Type': 'application/json',
//                'Accept': 'application/json'
//            };
//            $http({
//                method: "GET",
//                headers: headers,
//                url: 'http://114.215.185.243:8080/data-app/rs/task/searchData?company_guid=40288b8147cd16ce0147cd236df20000&table_name=e0015_KNA1&str_where=KUNNR=/0000000001/'

//            }).success(function(jsonObj) {
//                if(typeof jsonObj == 'object' && jsonObj instanceof Array){
//                    console.log(jsonObj) ;
//                    console.log('-------------------------------------------------------------------------------------------------------')
//                    console.log(jsonObj[0].ERNAM) ;
//                    $scope.ll=jsonObj[0].ERNAM;
//                    console.log('=======================================================================================================')
//                    for(var i = 0; i < jsonObj.length; i++){
//                        var o = jsonObj[i] ;
////                            for(var k in o){
////                                console.log(k + '----->' + o[k])
////                            }
//                    }
//                }
//                console.log(result);
//            }).error(function(data, status, headers, config) {
//
//                console.log(data);
//                console.log(status);
//                console.log(headers);
//                console.log(config);
//            });
            Api.getApiData('0000000001')
                .then(function(result) {
//                    $scope.data1 = result.data;
                    console.log(result.data);
                });


//            var doSearch = ionic.debounce(function(query) {
//                Flickr.search(query).then(function(resp) {
//                    $scope.photos = resp;
//                });
//            }, 500);
//
//            $scope.search = function() {
//                doSearch($scope.query);
//            }
            $scope.query = "";
            var doSearch = ionic.debounce(function (query) {
                ESService.search(query, 0).then(function (results) {
                    console.log(results);
                    $scope.results = results;
                    angular.forEach(results, function(value, key){
                        Api.getApiData(value.KUNNR)
                            .then(function(customers) {
                                $scope.results[key].TELF1 = customers.data[0].TELF1;
                                console.log(customers.data[0].TELF1);
                            });
                        console.log(value.KUNNR,key);
                    });
                });
            }, 500);

            $scope.search = function (query) {
                doSearch(query);
            }

        })

        .directive('pushSearch', function () {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var amt, st, header;

                    $element.bind('scroll', function (e) {
                        if (!header) {
                            header = document.getElementById('search-bar');
                        }
                        st = e.detail.scrollTop;
                        if (st < 0) {
                            header.style.webkitTransform = 'translate3d(0, 0px, 0)';
                        } else {
                            header.style.webkitTransform = 'translate3d(0, ' + -st + 'px, 0)';
                        }
                    });
                }
            }
        })

        .directive('photo', function ($window) {
            return {
                restrict: 'C',
                link: function ($scope, $element, $attr) {
                    var size = ($window.outerWidth / 3) - 2;
                    $element.css('width', size + 'px');
                }
            }
        });

    app.config(['$httpProvider','$stateProvider', function ($httpProvider,$stateProvider) {
//        $httpProvider.defaults.useXDomain = true;
//        $httpProvider.defaults.headers.common = 'Content-Type: application/json';
//        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $stateProvider.state('search', {
            url: '/search',
            templateUrl: 'scripts/search/search.html',
            controller: 'searchCtrl'
        });
    }]);
})(angular);