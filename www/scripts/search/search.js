(function (angular) {
    "use strict";

    var app = angular.module('myApp.search', [ 'ngResource', 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase', 'elasticsearch']);


    //NOTE: We are including the constant `ApiEndpoint` to be used here.
    app.factory('Api', function ($http, $q, ApiEndpoint) {
        var getApiData = function (customerID) {
            var q = $q.defer();
            $http.get(ApiEndpoint.url +
                '/searchData?company_guid=40288b8147cd16ce0147cd236df20000&table_name=e0015_KNA1&str_where=KUNNR=/' + customerID + '/')
                .success(function (jsonObj) {
                    if (typeof jsonObj == 'object' && jsonObj instanceof Array) {
                        for (var i = 0; i < jsonObj.length; i++) {
                            var o = jsonObj[i];
                        }
                    }
                    console.log(jsonObj);
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

        .controller('searchCtrl', function ($http, $q, Api, $resource, $scope, ESService) {

            $scope.query = "";
            var doSearch = ionic.debounce(function (query) {
                ESService.search(query, 0).then(function (results) {
//                  console.log(results);
                    $scope.results = results;
                    angular.forEach(results, function (value, key) {
                        Api.getApiData(value.KUNNR)
                            .then(function (data) {
                                $scope.results[key].TELF1 = data[0].TELF1;
//                                console.log(data[0].TELF1);
                            })
                            .catch(function () {
                                console.log('Assign only failure callback to promise');
                                // This is a shorthand for `promise.then(null, errorCallback)`
                            });
//                        console.log(value.KUNNR, key);
                    });
                });
            }, 500);

            $scope.search = function (query) {
                doSearch(query);
            }
        });

//        .directive('pushSearch', function () {
//            return {
//                restrict: 'A',
//                link: function ($scope, $element, $attr) {
//                    var amt, st, header;
//
//                    $element.bind('scroll', function (e) {
//                        if (!header) {
//                            header = document.getElementById('search-bar');
//                        }
//                        st = e.detail.scrollTop;
//                        if (st < 0) {
//                            header.style.webkitTransform = 'translate3d(0, 0px, 0)';
//                        } else {
//                            header.style.webkitTransform = 'translate3d(0, ' + -st + 'px, 0)';
//                        }
//                    });
//                }
//            }
//        })
//
//        .directive('photo', function ($window) {
//            return {
//                restrict: 'C',
//                link: function ($scope, $element, $attr) {
//                    var size = ($window.outerWidth / 3) - 2;
//                    $element.css('width', size + 'px');
//                }
//            }
//        })


    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('search', {
            url: '/search',
            templateUrl: 'scripts/search/search.html',
            controller: 'searchCtrl'
        });
    }]);
})(angular);