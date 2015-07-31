(function (angular) {
    "use strict";

    var app = angular.module('myApp.leaveRequest', []);
    app.controller('timeSheetCtrl',
        function (myTask, timeSheet, ionicLoading, $ionicPopup, $timeout, $scope) {
            ionicLoading.load();
            timeSheet.obj.$bindTo($scope, "data")
                .then(function () {
                    ionicLoading.unload();

                    $scope.editPopup = {
                        title: 'save changes',
                        template: $scope.data.COUNTER
                    };
                    $scope.editTaskData = {
                        event: 'E0024_CHANGE',
                        serverUserID: '100001',
                        inputParasRef: '',
                        jsonContent: {
                            "COUNTER": $scope.data.COUNTER,
                            "WORKDATE": $scope.data.WORKDATE,
                            "EMPLOYEENUMBER": $scope.data.EMPLOYEENUMBER,
                            "ABS_ATT_TYPE": $scope.data.ABS_ATT_TYPE,
                            "CATSHOURS": $scope.data.CATSHOURS,
                            "SHORTTEXT": $scope.data.SHORTTEXT

                        }
                    };
                    $scope.deletePopup = {
                        title: 'delete',
                        template: $scope.data.COUNTER
                    };
                    $scope.deleteTaskData = {
                        event: 'E0025',
                        serverUserID: '100001',
                        inputParasRef: '',
                        jsonContent: {
                            "COUNTER": $scope.data.COUNTER

                        }
                    };

                });
        })
        .controller('leaveRequestListItemCtrl',
        function (myTask, ionicLoading, $ionicPopup, $timeout, $scope, $q) {

            $scope.delete = function (item) {
                $scope.COUNTER = item;
                var approveItem = {
                    event: 'E0025'
                };
                if (approveItem.event === 'E0025') {
                    $scope.ServerUserID = '100001';
                    $scope.popup = {
                        title: 'Delete Timesheet',
                        template: $scope.COUNTER
                    };
                    $scope.taskData = {
                        event: approveItem.event,
                        serverUserID: $scope.ServerUserID,
                        inputParasRef: '',
                        jsonContent: $scope.COUNTER
                    };

                }
            };
        })

        .controller('e0023Ctrl',
        function (myTask, ionicLoading, $ionicPopup, $timeout, $scope, fbutil, $state, approveInfoService) {

            //$scope.fromDate = new Date();
            $scope.fromDatePickerCallback = function (val) {
                if (typeof(val) === 'undefined') {
                    console.log('Date not selected');
                } else {
                    console.log('Selected date is : ', val);
                    $scope.fromDate = val.getTime();
                    $scope.toDate = $scope.fromDate + 130000;
                    console.log($scope.toDate);
                }
            };
            $scope.toDatePickerCallback = function (val) {
                if (typeof(val) === 'undefined') {
                    console.log('Date not selected');
                } else {
                    console.log('Selected date is : ', val);
                    $scope.toDate = val.getTime();
                }
            };

            $scope.fromTimeslots = {epochTime: 0, format: 12, step: 15};
            $scope.fromTimePickerCallback = function (val) {
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    console.log('Selected time is : ', val);    // `val` will contain the selected time in epoch
                    $scope.fromTime = val;
                }
            };
            $scope.toTimeslots = {epochTime: 0, format: 12, step: 15};
            $scope.toTimePickerCallback = function (val) {
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    console.log('Selected time is : ', val);    // `val` will contain the selected time in epoch
                    $scope.toTime = val;
                }
            };

        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('e0024_change', {
                url: '/e0024_change/:index?key',
                templateUrl: 'scripts/purchase-orders/e0024_change.html',
                controller: 'timeSheetCtrl',
                cache: false,
                resolve: {
                    timeSheet: function ($stateParams, fbutil, $firebaseObject, $q) {
                        var ref = fbutil.ref([$stateParams.index]);
                        var d = $q.defer();
                        ref.once('value', function (data) {
                            var obj = {
                                COUNTER: data.key(),
                                WORKDATE: data.val().WORKDATE,
                                EMPLOYEENUMBER: data.val().EMPLOYEENUMBER,
                                ABS_ATT_TYPE: data.val().ABS_ATT_TYPE,
                                CATSHOURS: data.val().CATSHOURS,
                                SHORTTEXT: data.val().SHORTTEXT,
                                CREATIONDATE: data.val().CREATIONDATE,
                                ENTRYTIME: data.val().ENTRYTIME,
                                APPROVING_ADMIN: data.val().APPROVING_ADMIN,
                                DATE_OF_APPROVAL: data.val().DATE_OF_APPROVAL,
                                STATUS: data.val().STATUS
                            };
                            ref.child('draft').set(obj, function (error) {
                                if (error) {
                                    d.reject(error);
                                } else {
                                    d.resolve({
                                        obj: $firebaseObject(ref.child('draft'))
                                    });
                                }
                            });
                        });
                        return d.promise;
                    }
                }
            })
            .state('e0023', {
                url: '/e0023',
                templateUrl: 'scripts/purchase-orders/e0023.html',
                controller: 'e0023Ctrl'
            });
    }]);
})(angular);