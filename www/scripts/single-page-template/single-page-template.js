(function (angular) {
    "use strict";

    var app = angular.module('myApp.singlePageTemplate', []);

    app
        .controller('singlePageTemplateCtrl',
        function (jsonFactory, $scope, $q, $timeout, ionicLoading,
                  ESService, searchObj, localStorageService, $rootScope, searchHistory) {
            console.log(searchObj);
            $scope.viewKey = searchObj.value;
            $scope.keyName = searchObj.key;
            $scope.keyValue = searchObj.value;
            $scope.title = searchObj.table + ' ' + searchObj.value;

            ionicLoading.load();

            var getFieldValue = function (fieldFormatArray, searchResult) {
                var arr = [];
                var d = $q.defer();
                var i = 0;
                angular.forEach(fieldFormatArray, function (value) {
                    //如果要lookup
                    if (typeof value['LKP_KEYFIELD'] !== 'undefined' && value['LKP_KEYFIELD'] !== ''
                        && value['LKP_KEYFIELD'] !== null) {

                        //lookup: function (table, inputKey, inputValue, outputKey,languageKey,language,
                        //                  foreignKey1, foreignValue1, foreignKey2, foreignValue2)

                        ESService.lookup('E0015_' + value['LKP_TEXTTABLE'],
                            value['LKP_KEYFIELD'], searchResult[value['FIELDNAME']],
                            value['LKP_TEXTFIELD'],
                            value['LKP_LANGFIELD'], 'E',
                            value['LKP_FOREIGNKEY2'], searchResult[value['LKP_FOREIGNKEY1']])
                            .then(function (result) {
                                i++;
                                arr[value['FIELDNAME']] = result + '(' + searchResult[value['FIELDNAME']] + ')';
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
                        arr[value['FIELDNAME']] = searchResult[value['FIELDNAME']];
                        if (i == fieldFormatArray.length) {
                            d.resolve(arr);
                            console.log(arr);
                        }
                    }
                });
                return d.promise;
            };

            jsonFactory.hospitals('search-lists')
                .then(function (data) {
                    var currentObject = data[searchObj.table];
                    $scope.formatLink = currentObject['formatLink'];
                    $scope.searchLink = currentObject['searchLink'];
                    $scope.buttonFab = currentObject['buttonFab'];

                    if (typeof currentObject['popupLinks'] !== "undefined") {
                        $scope.popupLinks = currentObject['popupLinks'];
                    } else {
                        $scope.popupLinks = [];
                    }

                    $scope.popup = {
                        title: $scope.keyText,
                        template: $scope.title
                    };


                    searchHistory.updateHistory($scope.searchLink, searchObj.value);
                    jsonFactory.fromServer('view_user_screen', 'TABNAME=/' + $scope.formatLink + '/')
                        .then(function (fieldFormatArray) {
                            $scope.fieldFormatArray = fieldFormatArray;
                            console.log(fieldFormatArray);
                            jsonFactory.loadData($scope.searchLink, searchObj.key, searchObj.value)
                                .then(function (searchResult) {

                                    if (typeof currentObject['taskInputParas'] !== "undefined") {
                                        var inputPara = '';
                                        angular.forEach(currentObject['taskInputParas'], function (taskInputPara) {
                                            inputPara = inputPara + '/' + searchResult[taskInputPara];
                                        });
                                        inputPara = inputPara.substr(1)
                                        $scope.taskData = {
                                            event: currentObject['eventID'],
                                            serverUserID: searchResult['JCO_USER'],
                                            inputParasRef: inputPara,
                                            jsonContent: ''
                                        };

                                    } else {
                                        $scope.taskData = {};
                                    }

                                    getFieldValue(fieldFormatArray, searchResult)
                                        .then(function (data) {
                                            ionicLoading.unload();
                                            $scope.fieldValueArray = data;
                                            //console.log($scope.fieldValueArray);
                                        });
                                }).catch(function (err) {
                                    console.log(err);
                                    ionicLoading.unload();
                                });
                        });
                });
            $scope.refresh = function () {
                //TODO refresh event
                console.log('$scope.refresh');
                $scope.$broadcast('scroll.refreshComplete');
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
            .state('singlePageTemplate', {
                url: '/singlePageTemplate/:table?key?value',
                templateUrl: 'scripts/single-page-template/single-page-template.html',
                controller: 'singlePageTemplateCtrl',
                resolve: {
                    searchObj: function ($stateParams) {
                        return {
                            table: $stateParams.table,
                            key: $stateParams.key,
                            value: $stateParams.value
                        };
                    }
                }
            });
    }]);
})(angular);