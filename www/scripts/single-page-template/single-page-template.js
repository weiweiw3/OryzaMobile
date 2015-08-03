(function (angular) {
    "use strict";

    var app = angular.module('myApp.singlePageTemplate', []);

    app.controller('popoverCtrl',
        function ($q,
                  $ionicPopup, $timeout, $scope, $ionicPopover) {
            $scope.popupLinks = $scope.$parent.popupLinks;
            // .fromTemplate() method
            var template = '<ion-popover-view><ion-header-bar> ' +
                '<h1 class="title">My Popover Title</h1> </ion-header-bar> ' +
                '<ion-content> Hello! </ion-content></ion-popover-view>';

            $scope.popover = $ionicPopover.fromTemplate(template, {
                scope: $scope
            });

            // .fromTemplateUrl() method
            $ionicPopover.fromTemplateUrl('scripts/single-page-template/my-popover.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.popover = popover;
            });


            $scope.openPopover = function ($event) {
                $scope.popover.show($event);
            };
            $scope.closePopover = function () {
                $scope.popover.hide();
            };
            //Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.popover.remove();
            });
            // Execute action on hide popover
            $scope.$on('popover.hidden', function () {
                // Execute action
            });
            // Execute action on remove popover
            $scope.$on('popover.removed', function () {
                // Execute action
            });
        });
    app.controller('singlePageTemplateCtrl',
        function (jsonFactory, $scope, $q, $timeout, ionicLoading,
                  searchObj, $rootScope, searchHistory, $stateParams, $ionicPopover) {
            //

            $scope.selection = 'settings';
            console.log(searchObj);
            $scope.viewKey = $stateParams.value;
            $scope.keyName = $stateParams.key;
            $scope.keyValue = $stateParams.value;
            $scope.title = $stateParams.table + ' ' + $stateParams.value;
            var currentObject = $scope.viewConfigure = searchObj[0];
            $scope.formatArray = searchObj[2];
            $scope.valueArray = searchObj[1];
            $scope.formattedValueArray = searchObj[3];
            //ionicLoading.load();

            if (typeof currentObject['popupLinks'] !== "undefined") {
                $scope.popupLinks = currentObject['popupLinks'];
            } else {
                $scope.popupLinks = [];
            }

            $scope.buttonFab = currentObject['buttonFab'];

            if (typeof currentObject['AddToSearchHistory'] !== "undefined") {
                searchHistory.updateHistory(currentObject['searchLink'], $stateParams.value);
            }

            $scope.popup = {
                title: $scope.keyText,
                template: $scope.title
            };
            if (currentObject['buttonFab'] === "createTask") {
                var inputPara = '';
                var jsonContent = {};

                angular.forEach(currentObject['taskInputParas'], function (taskInputPara) {
                    inputPara = inputPara + '/' + $scope.valueArray[taskInputPara];
                    jsonContent[taskInputPara] = $scope.valueArray[taskInputPara];

                });
                inputPara = inputPara.substr(1);
                $scope.taskData = {
                    event: currentObject['eventID'],
                    serverUserID: $scope.valueArray['JCO_USER'],
                    inputParasRef: inputPara,
                    jsonContent: jsonContent
                };
                console.log($scope.taskData);

            } else {
                $scope.taskData = {};
            }

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
                templateUrl: function (stateParams) {
                    switch (stateParams.table) {
                        case 'task_message':
                            return 'scripts/single-page-template/task-message.html';
                            break;
                        default :
                            return 'scripts/single-page-template/single-page-template.html';
                            break;
                    }
                },

                controller: 'singlePageTemplateCtrl',
                resolve: {
                    searchObj: function ($state, $q, jsonFactory, $stateParams) {
                        var d = $q.defer();
                        var thenFn = function (value) {
                                console.log('resolved ', value);
                                return value;
                            },
                            q0 = $q.defer(), q1 = $q.defer(), q2 = $q.defer(), q3 = $q.defer(),
                            p0 = q0.promise, p1 = q1.promise, p2 = q2.promise, p3 = q3.promise;

                        $q.all([
                            p0.then(thenFn), p1.then(thenFn), p2.then(thenFn)
                        ])
                            .then(function (values) {
                                jsonFactory.formatFieldMapping(values[2], values[1])
                                    .then(function (data) {
                                        values.push(data);
                                        console.log(values);
                                        d.resolve(values);
                                    });
                            });

                        $q.all([
                            p0.then(thenFn), p1.then(thenFn), p3.then(thenFn)
                        ])
                            .then(function (values) {
                                console.log(values);
                                d.resolve(values);
                                //$state.go(values[2], {
                                //    table: $stateParams.table,
                                //    key: $stateParams.key,
                                //    value: $stateParams.value
                                //});
                                //return values;
                            });

                        jsonFactory.getSinglePageConfigure($stateParams.table)
                            .then(function (data) {
                                q0.resolve(data);

                                if (typeof data['viewScreen'] !== "undefined") {
                                    q3.resolve(data['viewScreen']);
                                }

                                if (typeof data['formatLink'] !== "undefined") {
                                    //本地不存在模板，去服务器取页面模板
                                    jsonFactory.fromServer('view_user_screen',
                                        'TABNAME=/' + data['formatLink'] + '/')
                                        .then(function (fieldFormatArray) {
                                            q2.resolve(fieldFormatArray);
                                        })
                                        .catch(function (err) {
                                        });
                                }

                                jsonFactory.loadData(data['searchLink'],
                                    $stateParams.key, $stateParams.value)
                                    .then(function (searchResult) {
                                        q1.resolve(searchResult);
                                    });
                            });
                        return d.promise;
                    }
                }
            });
    }]);
})(angular);