(function (angular) {
    "use strict";

    var app = angular.module('myApp.search', ['ngResource', 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase', 'elasticsearch']);

    app.controller('searchOptionCtrl', function ($scope, jsonFactory) {
        jsonFactory.hospitals('search-options').then(function (data) {
            $scope.data = data;
        });
    });
    //NOTE: We are including the constant `ApiEndpoint` to be used here.
    app.factory('jsonFactory', function ($q, $http, ESService, Api) {
        var jsonFactory = {
            fromServer: function (table, where) {
                var promise = Api.getApiData(table, where)
                    .then(function (response) {
                        return response;
                    }).catch(function (err) {
                        console.log(err);
                    });
                return promise;
            },
            hospitals: function (fileName) {
                var url = 'resources/format/' + fileName + '.json';
                var promise = $http.get(url).then(function (response) {
                    return response.data;
                });
                return promise;
            },
            loadData: function (table, key, value) {
                var arr = ['E0001_PO_HEADERS', 'E0001_PO_ITEMS'];
                var d = $q.defer();
                if (arr.indexOf(table) !== -1) {
                    var i = 0;
                    var query = '';
                    console.log(key);
                    angular.forEach(key, function (eachKey) {
                        if (i === (key.length - 1)) {
                            query = query + eachKey + '=/' + value[i] + '/';
                        } else {
                            query = query + eachKey + '=/' + value[i] + '/ and ';
                        }
                        i++;
                    });
                    console.log(table + ' ' + query);
                    this.fromServer(table, query)
                        .then(function (searchResult) {
                            console.log(searchResult);
                            switch (searchResult.length) {
                                case 0:
                                    d.reject('no data');
                                    break;
                                case 1:
                                    d.resolve(searchResult[0]);
                                    break;
                                default :
                                    d.resolve(searchResult);
                                    break;
                            }

                        }).catch(function (err) {
                            d.reject(err);
                        })
                } else {
                    ESService.lookup(table, key, value)
                        .then(function (searchResult) {
                            d.resolve(searchResult);
                        }).catch(function (err) {
                            d.reject(err);
                        });
                }
                return d.promise;
            }

        };
        return jsonFactory;
    })
        .factory('Api', function ($http, $q, taskUrl, COMPANY) {
            var getApiData = function (table, where) {
                var q = $q.defer();
                var str = taskUrl.url +
                    '/searchData?company_guid=' + COMPANY +
                    '&table_name=' + table +
                    '&str_where=' + where;
                $http.get(str)
                    .success(function (jsonObj) {
                        if (typeof jsonObj == 'object' && jsonObj instanceof Array) {
                            for (var i = 0; i < jsonObj.length; i++) {
                                var o = jsonObj[i];
                            }
                        }
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
        .factory('ESService', ['$q', 'esFactory', '$location', 'SearchUrl',
            function ($q, elasticsearch, $location, SearchUrl, COMPANY) {
                var client = elasticsearch({
                    //host: "https://a1b5amni:7smeg06ujbchru2l@apricot-2272737.us-east-1.bonsai.io/"
                    host: SearchUrl.url
                });
                var search;
                search = {
                    lookup: function (table, inputKey, inputValue, outputKey, languageKey, language,
                                      foreignKey, foreignValue) {
                        var d = $q.defer(), sort;
                        var query;
                        var multiQuery = [];
                        if (typeof inputKey === 'string') {
                            var obj = {};
                            obj[inputKey] = inputValue;
                            multiQuery.push({match_phrase: obj});
                        } else {
                            var i = 0;
                            angular.forEach(inputKey, function (eachKey) {
                                var obj = {};
                                obj[eachKey] = inputValue[i];
                                multiQuery.push({match_phrase: obj});
                                i++;
                            });
                        }
                        if (typeof languageKey !== 'undefined' && languageKey !== null) {
                            var obj = {};
                            obj[languageKey] = language;
                            multiQuery.push({match_phrase: obj});
                        }
                        if (typeof foreignKey1 !== 'undefined' && foreignKey1 !== null) {
                            var obj = {};
                            //console.log(foreignKey1+' '+foreignValue1);
                            obj[foreignKey1] = foreignValue1;
                            multiQuery.push({match_phrase: obj});
                        }
                        if (typeof foreignKey2 !== 'undefined' && foreignKey2 !== null) {
                            var obj = {};
                            //console.log(foreignKey2+' '+foreignValue2);
                            obj[foreignKey2] = foreignValue2;
                            multiQuery.push({match_phrase: obj});

                        }
                        query = {
                            "bool": {
                                "must": multiQuery
                            }
                        };
                        //console.log(query);

                        client.search({
                            "index": COMPANY,
                            "type": table,
                            "body": {
                                "filter": {
                                    "limit": {"value": 5}
                                    //,"_cache": true
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

                                hits_out.push(data);
                            }
                            switch (hits_in.length) {
                                case 0:
                                    d.reject('no data');
                                    break;
                                case 1:
                                    var result = hits_out[0];
                                    if (typeof  outputKey == "undefined") {
                                        d.resolve(result);
                                    }
                                    else {
                                        d.resolve(result[outputKey]);
                                    }
                                    break;
                                default :
                                    //由于搜索无法保证lookup时可以equail，只能contain，所以只好控制结果。100-805搜出"T-100-805"和"100-805"
                                    var arr = [], obj = {};
                                    var i = 0;
                                    angular.forEach(hits_out, function (result) {
                                        var flag = true;
                                        if (angular.isArray(inputValue)) {
                                            var j = 0;
                                            angular.forEach(inputKey, function (eachKey) {
                                                if (result[eachKey] !== inputValue[j]) {
                                                    flag = false;
                                                }
                                                j++;
                                            });
                                        } else {
                                            if (result[inputKey] !== inputValue) {
                                                flag = false;
                                            }
                                        }
                                        if (flag === true) {
                                            obj = result;
                                            console.log(result);
                                            i++;
                                            arr.push(result);
                                        }
                                    });
                                    if (i === 1) {
                                        d.resolve(obj);
                                    } else {
                                        d.resolve(arr);
                                    }
                                    break;
                            }
                        }, d.reject);

                        return d.promise;

                    },
                    multiSearch: function (table, term, offset, fields) {
                        var d = $q.defer(), query, sort;

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
                            query = {
                                "match_all": {}
                            };
                        } else {
                            query = {
                                //simple_query_string
                                "query_string": {
                                    "fields": fields,
                                    "query": makeTerm(term, true)
                                }
                            }
                        }
                        console.log(query);
                        client.search({
                            "index": COMPANY,
                            "type": table,
                            "body": {
                                "filter": {
                                    "limit": {"value": 20}
                                },
                                "query": query
                            }
                        }).then(function (result) {
                            var ii = 0, hits_in, hits_out = [];
                            hits_in = (result.hits || {}).hits || [];
                            for (; ii < hits_in.length; ii++) {
                                var data = hits_in[ii]._source;
                                hits_out.push(data);
                            }
                            switch (hits_in.length) {
                                case 0:
                                    d.reject('no data');
                                    break;
                                default:
                                    d.resolve(hits_out);
                                    break;
                            }

                        }, d.reject);

                        return d.promise;
                    }
                };

                return search;
            }])
        .factory('fAsync', function (fbutil, $q) {
            var fAsync = function (ref) {
                var d = $q.defer();
                fbutil.ref(ref).once('value', function (snapshot) {
                    d.resolve(snapshot.exportVal());
                }, function (err) {
                    d.reject(err);
                });
                return d.promise;
            };
            return fAsync;
        })
        .factory('httpUtil', function ($http, $q) {
            var httpUtil;
            httpUtil = {
                httpRequestHandler: function (method, url, data, timeoutNum) {
                    var timeout = $q.defer(),
                        result = $q.defer(),
                        timedOut = false,
                        httpRequest;

                    if (typeof timeoutNum == 'undefined') {
                        timeoutNum = 0
                    }

                    setTimeout(function () {
                        timedOut = true;
                        timeout.resolve();
                    }, (1000 * timeoutNum));

                    httpRequest = $http({
                        method: method,
                        url: url,
                        data: data,
                        cache: false,
                        timeout: timeout.promise
                    });

                    httpRequest.success(function (data, status, headers, config) {
                        result.resolve(data);
                    });

                    httpRequest.error(function (data, status, headers, config) {
                        if (timedOut) {
                            //result.reject({
                            //    error: 'timeout',
                            //    message: 'Request took longer than ' + timeoutNum + ' seconds.'
                            //});
                            result.reject('Could not connect to server, Please try again later.');
                        } else {
                            result.reject(data);
                        }
                    });

                    return result.promise;
                }
            }
            return httpUtil;
        })
        .factory('searchHistory', function (localStorageService) {
            var searchHistory;
            searchHistory = {
                getHistory: function (arrayName) {
                    if (typeof  localStorageService.get(arrayName) !== 'undefined'
                        && localStorageService.get(arrayName) !== null) {
                        return localStorageService.get(arrayName);
                    } else {
                        return [];
                    }
                },
                updateHistory: function (arrayName, key) {
                    var arr = this.getHistory(arrayName);
                    if (arr.indexOf(key) === -1) {
                        arr.push(key);
                    }
                    localStorageService.set(arrayName, arr);

                    return arr;
                }
            };
            return searchHistory;
        })
        .controller('searchCtrl', function (searchObj, $http, $q, Api, $resource,
                                           $scope, ESService, localStorageService, jsonFactory) {
            $scope.table = searchObj.value;
            jsonFactory.hospitals('search-lists').then(function (data) {
                $scope.searchLink = data[searchObj.value].searchLink;
                $scope.whereFields = data[searchObj.value].whereFields;
                $scope.selectFields = data[searchObj.value].selectFields;
                $scope.primaryKey = data[searchObj.value].primaryKey;
                if (typeof  localStorageService.get($scope.searchLink) !== 'undefined'
                    && localStorageService.get($scope.searchLink) !== null) {
                    $scope.searchHistory = localStorageService.get($scope.searchLink);
                } else {
                    $scope.searchHistory = [];
                }
            });
            //console.log(searchObj);
            $scope.searchObj = searchObj;
            $scope.deleteHistory = function (result) {
                var index = $scope.searchHistory.indexOf(result);
                //console.log(index+' '+$scope.searchHistory.indexOf(index));
                if (index > -1) {
                    $scope.searchHistory.splice(index, 1);
                    localStorageService.set($scope.table, $scope.searchHistory);
                }
            };
            var doSearch = ionic.debounce(function (query) {
                ESService.multiSearch($scope.searchObj.value, query, 0, $scope.whereFields)
                    .then(function (results) {
                        $scope.results = results;
                        $scope.err = null;
                    })
                    .catch(function (err) {
                        $scope.results = null;
                        $scope.err = err;
                        console.log(err);
                    });
            }, 500);

            $scope.search = function (query) {
                doSearch(query);
            }
        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('search', {
                url: '/search?text:value',
                templateUrl: 'scripts/search/search.html',
                controller: 'searchCtrl',
                cache: false,
                resolve: {
                    searchObj: function ($stateParams) {
                        return {
                            text: $stateParams.text,
                            value: $stateParams.value
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