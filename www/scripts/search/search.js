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
    app.factory('jsonFactory', function ($http, Api) {
        var jsonFactory = {
            fromServer: function () {
                var promise = Api.getApiData('view_user_screen', 'SCREEN_ID=/E0001_HEADER/')
                    .then(function (response) {

                        $http.post('scripts/resources/e0001_header.json', response).then(function (data) {
                            console.log('Data saved');
                        });
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
        ['$q', 'esFactory', '$location', 'SearchUrl',
            function ($q, elasticsearch, $location, SearchUrl, COMPANY) {
                var client = elasticsearch({
                    //host: "https://a1b5amni:7smeg06ujbchru2l@apricot-2272737.us-east-1.bonsai.io/"
                    host: SearchUrl.url
                });
                var search;
                search = {
                    lookup: function (table, inputKey, inputValue, outputKey,
                                      foreignKey1, foreignValue1, foreignKey2, foreignValue2) {
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
                        console.log(query);

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
            }]
    )
        .controller('searchDetailCtrl', function (jsonFactory, $scope, $q, $timeout, ionicLoading,
                                                  ESService, searchObj, localStorageService) {
            console.log(searchObj);
            $scope.viewKey = searchObj.value;
            ionicLoading.load();
            ESService.lookup(searchObj.table, searchObj.key, searchObj.value)
                .then(function (results) {
                    $scope.results = results;
                    jsonFactory.hospitals('search-lists').then(function (data) {
                        if (typeof data[searchObj.table].popupLinks !== "undefined") {
                            $scope.popupLinks = data[searchObj.table].popupLinks;
                        } else {
                            $scope.popupLinks = [];
                        }
                        $scope.searchLink = data[searchObj.table].searchLink;
                        jsonFactory.hospitals($scope.searchLink).then(function (data) {

                            $scope.fieldList = data;
                            console.log(data);
                            $scope.getFieldValue(data).then(function (data) {
                                ionicLoading.unload();
                                $scope.fieldValueArray = data;
                                console.log($scope.fieldValueArray);
                            });

                        });
                    });

                });

            $scope.getFieldValue = function (fieldFormatArray) {
                var arr = [];
                var d = $q.defer();
                var i = 0;
                angular.forEach(fieldFormatArray, function (value) {
                    //如果要lookup

                    if (typeof value['LKP_KEYFIELD'] !== 'undefined' && value['LKP_KEYFIELD'] !== '' && value['LKP_KEYFIELD'] !== null) {
                        console.log($scope.results[value['LKP_FOREIGNKEY1']]);
                        ESService.lookup(value['LKP_TEXTTABLE'], value['LKP_KEYFIELD'],
                            $scope.results[value['FIELDNAME']], value['LKP_TEXTFIELD'],
                            value['LKP_FOREIGNKEY1'], $scope.results[value['LKP_FOREIGNKEY1']],
                            value['LKP_FOREIGNKEY2'], $scope.results[value['LKP_FOREIGNKEY2']])
                            .then(function (result) {
                                i++;
                                arr[value['FIELDNAME']] = result + '(' + $scope.results[value['FIELDNAME']] + ')';
                                //console.log(key);
                                if (i == fieldFormatArray.length) {
                                    d.resolve(arr);
                                    console.log(arr);
                                }
                            }).catch(function (err) {
                                i++;
                                if (i == fieldFormatArray.length) {
                                    d.resolve(arr);
                                    console.log(arr);
                                }
                                console.log(err);
                            })
                    } else {
                        i++;
                        arr[value['FIELDNAME']] = $scope.results[value['FIELDNAME']];
                        if (i == fieldFormatArray.length) {
                            d.resolve(arr);
                            console.log(arr);
                        }
                    }
                });
                return d.promise;
            };


            //ionicLoading.load();
            $scope.keyName = searchObj.key;
            $scope.keyValue = searchObj.value;
            $scope.title = searchObj.table + ' ' + searchObj.value;

            if (typeof  localStorageService.get(searchObj.table) !== 'undefined'
                && localStorageService.get(searchObj.table) !== null) {
                $scope.searchHistory = localStorageService.get(searchObj.table);
            } else {
                $scope.searchHistory = [];
            }
            if ($scope.searchHistory.indexOf(searchObj.value) === -1) {
                $scope.searchHistory.push(searchObj.value);
            }
            ;

            localStorageService.set(searchObj.table, $scope.searchHistory);

            $scope.refresh = function () {
                //TODO refresh event
                console.log('$scope.refresh');
                $scope.$broadcast('scroll.refreshComplete');
            };

        })
        .
        controller('searchCtrl', function (searchObj, $http, $q, Api, $resource,
                                           $scope, ESService, localStorageService, jsonFactory) {

            $scope.table = searchObj.value;

            jsonFactory.hospitals('search-lists').then(function (data) {

                //console.log($scope.table);
                $scope.searchLink = data[searchObj.value].searchLink;
                $scope.whereFields = data[searchObj.value].whereFields;
                $scope.selectFields = data[searchObj.value].selectFields;
                $scope.primaryKey = data[searchObj.value].primaryKey;
                if (typeof  localStorageService.get($scope.searchLink) !== 'undefined'
                    && localStorageService.get($scope.searchLink) !== null) {
                    $scope.searchHistory = localStorageService.get($scope.searchLink);
                    //console.log($scope.searchHistory);
                    //console.log(localStorageService.get($scope.table));
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
            .state('searchDetail', {
                url: '/searchDetail/:table?key?value',
                templateUrl: 'scripts/search/search_detail.html',
                controller: 'searchDetailCtrl',
                resolve: {
                    searchObj: function ($stateParams) {
                        return {
                            table: $stateParams.table,
                            key: $stateParams.key,
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