(function (angular) {
    "use strict";

    var app = angular.module('myApp.leaveRequest', []);

    //
    app.controller('timeSheetCtrl',
        function (myTask, timeSheet, ionicLoading, $ionicPopup, $timeout, $scope) {
            ionicLoading.load();
            timeSheet.obj.$bindTo($scope, "data").then(function () {
                console.log($scope.data);
                ionicLoading.unload();

                $scope.fromDate = new Date($scope.data.WORKDATE);
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


            });
        })
        .directive('mySubArea1', function () {
            return {
                restrict: 'E',
                scope: {
                    messages: '='
                },
                templateUrl: 'scripts/hr/time-sheet-part.html',
                controller: function ($scope) {
                    var object=$scope.messages;
                    console.log(object);

                    //controller for your sub area.
                }


            };
        })
        .controller('leaveRequestListItemCtrl',
        function (myTask, ionicLoading, $ionicPopup, $timeout, $scope, $q, fbutil, $state, approveInfoService) {

            $scope.delete = function (item) {
                $scope.COUNTER = item;
                var approveItem = {
                    event: 'E0025'
                };
                if (approveItem.event === 'E0025') {

                    $scope.ServerUserID = '100001';
                    //$scope.PO_REL_CODE = res[6].substr(3);
                    //$scope.PURCHASEORDER = res[8];
                    //$scope.purchaseOrderHeaderRefStr = ref.toString()
                    //    .replace(ref.root().toString(), '');
                    //$scope.purchaseOrderItemsRef = $scope.purchaseOrderHeaderRefStr
                    //    .replace('PO_HEADERS', 'PO_ITEMS');

                    //通过检查对应E0002,如果审批错误即返回值等于null，那么改变lock可以继续审批
                    //fbutil.ref(['Event/' + approveItem.event, $scope.ServerUserID])
                    //    .startAt($scope.PURCHASEORDER)
                    //    .endAt($scope.PURCHASEORDER)
                    //    .once('value', function (snap) {
                    //        snap.child($scope.PURCHASEORDER).child('TASK_INFO')
                    //            .ref().once('value', function (snap) {
                    //                if(snap.exportVal()!=null)$scope.history = snap.exportVal();
                    //
                    //                console.log(snap.exportVal());
                    //                if (snap.child('task_status').val() != null) {
                    //                    $scope.data.lock = true;
                    //                } else {
                    //                    $scope.data.lock = false;
                    //                }
                    //            });
                    //    });

                    //E0001->E0002
                    $q.all([
                        myTask.getjsonContent(approveItem.event).$loaded(),
                        myTask.getInputP(approveItem.event).$loaded()
                    ]).then(function (results) {

                        angular.forEach(results, function (data) {
                            if (data.$id === "jsonContent") {
                                $scope.jsonContent = data;
                                $scope.jsonContent.CATSRECORDS[0].COUNTER = $scope.COUNTER;
                                console.log($scope.jsonContent);
                            }
                            if (data.$id === "inputParas") {
                                var inputParas = data.$value;
                                //inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
                                //inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
                                ////TODO replace P02 twice , in the furture use replace-all function
                                //inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                                //inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                                //inputParas = inputParas.replace('$P03$', $scope.ServerUserID);//ServerUserID
                                //inputParas = inputParas + ';FB_FROM_PATH=' + $scope.purchaseOrderHeaderRefStr;
                                console.log(inputParas);
                                $scope.inputParas = inputParas;
                            }
                        })
                        $scope.keyText = 'Delete Timesheet';
                        $scope.keyID = $scope.COUNTER;

                        //if ($scope.data.lock) {
                        //    $scope.data.approveButtonText = 'Finished';
                        //} else {
                        //    $scope.data.approveButtonText = 'Approve';
                        //}
                        $scope.ionicPopup = {
                            title: $scope.keyText,
                            template: $scope.keyID,
                            cancelText: ' ',
                            cancelType: 'button icon ion-close button-assertive',
                            okText: ' ',
                            okType: 'button icon ion-checkmark-round button-balanced'
                        };
                        //$scope.showConfirm = function () {
                        //    console.log('x');
                        //
                        //};
                        $ionicPopup.confirm($scope.ionicPopup)
                            .then(function (res) {
                                if (res) {
                                    ionicLoading.load('Sending out');
                                    console.log($scope.inputParas);
                                    myTask.createTask(approveItem.event, $scope.ServerUserID,
                                        $scope.inputParas, $scope.keyID, 'Approve', $scope.jsonContent)
                                        .then(function (data) {
                                            // promise fulfilled
                                            console.log('Success!', data);
                                            ionicLoading.unload();
                                            //approveInfoService.addApproveInfo({
                                            //    keyText: $scope.keyText,
                                            //    keyID: $scope.keyID,
                                            //    createTime: new Date().getTime()
                                            //});
                                            //$state.go('approve-conformation');

                                        }, function (error) {
                                            ionicLoading.load(error);
                                            console.log(error);
                                            $timeout(function () {
                                                ionicLoading.unload();
                                            }, 1000);
                                            //approveInfoService.addApproveInfo({
                                            //    keyText: $scope.keyText,
                                            //    keyID: $scope.keyID,
                                            //    createTime: new Date().getTime()
                                            //});
                                            //$scope.approveInfo = approveInfoService.getApproveInfo();
                                            //console.log($scope.approveInfo);
                                            //$state.go('approve-conformation');
                                        })
                                        .finally(function () {
                                            //$scope.data.lock = true;

                                        });
                                    console.log('approve');
                                } else {
                                    console.log('cancel');
                                }
                            });
                    });


                    //
                    //console.log($scope.jsonContent);

                }


            };
        })

        .controller('leaveRequestCtrl',
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

            //ionicLoading.load('Loading');
            //$scope.$watch('data.lock', function (newVal) {
            //    if (typeof $scope.data != "undefined") {
            //        if (newVal) {
            //            $scope.data.approveButtonText = 'Finished';
            //        } else {
            //            console.log($scope.data);
            //
            //            $scope.data.approveButtonText = 'Approve';
            //        }
            //    }
            //
            //});
            //approveItem.obj.$bindTo($scope, "data").then(function () {
            //    ionicLoading.unload();
            //
            //    $scope.data.approveButtonText = 'Approve';
            //
            //    var ref = approveItem.obj.$ref();
            //    var res = ref.toString().split("/");
            //
            //    if (approveItem.event === 'E0005') {
            //
            //        $scope.ServerUserID = res[5];
            //        $scope.PR_REL_CODE = res[6].substr(3);
            //        $scope.PURCHASEREQUEST = res[8];
            //        $scope.ITEM = res[9];
            //        $scope.refStr = ref.toString()
            //            .replace(ref.root().toString(), '');
            //
            //        //通过检查对应E0005,如果审批错误即返回值等于null，那么改变lock可以继续审批
            //        fbutil.ref(['Event/' + approveItem.event, $scope.ServerUserID])
            //            .startAt($scope.PURCHASEREQUEST)
            //            .endAt($scope.PURCHASEREQUEST)
            //            .once('value', function (snap) {
            //                snap.child($scope.PURCHASEREQUEST).child($scope.ITEM).child('TASK_INFO')
            //                    .ref().once('value', function (snap) {
            //                        if(snap.exportVal()!=null)$scope.history = snap.exportVal();
            //                        if (snap.child('task_status').val() != null) {
            //                            $scope.data.lock = true;
            //                        } else {
            //                            $scope.data.lock = false;
            //                        }
            //                    });
            //            });
            //
            //        //E0004->E0005
            //        myTask.getInputP(approveItem.event).$loaded().then(
            //            function (data) {
            //                var inputParas = data.$value;
            //                inputParas = inputParas.replace('$P01$', $scope.PR_REL_CODE);//PO_REL_CODE
            //                // TODO replace P02 twice , in the furture use replace-all function
            //                inputParas = inputParas.replace('$P02$', $scope.PURCHASEREQUEST);//PURCHASEREQUEST
            //                inputParas = inputParas.replace('$P02$', $scope.PURCHASEREQUEST);//PURCHASEREQUEST
            //                inputParas = inputParas.replace('$P03$', $scope.ITEM);//ITEM
            //                inputParas = inputParas.replace('$P03$', $scope.ITEM);//ITEM
            //                inputParas = inputParas.replace('$P04$', $scope.ServerUserID);//ServerUserID
            //                inputParas = inputParas + ';FB_FROM_PATH=' + $scope.refStr;
            //                console.log(inputParas);
            //                $scope.inputParas = inputParas;
            //            }
            //        );
            //
            //        $scope.keyText='Purchase Request Approve';
            //        $scope.keyID = $scope.PURCHASEREQUEST + ' ' + $scope.ITEM;
            //
            //
            //
            //    }
            //
            //    if (approveItem.event === 'E0002') {
            //
            //        $scope.ServerUserID = res[5];
            //        $scope.PO_REL_CODE = res[6].substr(3);
            //        $scope.PURCHASEORDER = res[8];
            //        $scope.purchaseOrderHeaderRefStr = ref.toString()
            //            .replace(ref.root().toString(), '');
            //        $scope.purchaseOrderItemsRef = $scope.purchaseOrderHeaderRefStr
            //            .replace('PO_HEADERS', 'PO_ITEMS');
            //
            //        //通过检查对应E0002,如果审批错误即返回值等于null，那么改变lock可以继续审批
            //        fbutil.ref(['Event/' + approveItem.event, $scope.ServerUserID])
            //            .startAt($scope.PURCHASEORDER)
            //            .endAt($scope.PURCHASEORDER)
            //            .once('value', function (snap) {
            //                snap.child($scope.PURCHASEORDER).child('TASK_INFO')
            //                    .ref().once('value', function (snap) {
            //                        if(snap.exportVal()!=null)$scope.history = snap.exportVal();
            //
            //                        console.log(snap.exportVal());
            //                        if (snap.child('task_status').val() != null) {
            //                            $scope.data.lock = true;
            //                        } else {
            //                            $scope.data.lock = false;
            //                        }
            //                    });
            //            });
            //
            //        //E0001->E0002
            //        myTask.getInputP(approveItem.event).$loaded().then(
            //            function (data) {
            //                var inputParas = data.$value;
            //                inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
            //                inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
            //                //TODO replace P02 twice , in the furture use replace-all function
            //                inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
            //                inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
            //                inputParas = inputParas.replace('$P03$', $scope.ServerUserID);//ServerUserID
            //                inputParas = inputParas + ';FB_FROM_PATH=' + $scope.purchaseOrderHeaderRefStr;
            //                console.log(inputParas);
            //                $scope.inputParas = inputParas;
            //            }
            //        );
            //        $scope.keyText='Purchase Order Approve';
            //        $scope.keyID = $scope.PURCHASEORDER;
            //    }
            //    $scope.ionicPopup = {
            //        title: $scope.keyText,
            //        template: $scope.keyID,
            //        cancelText: ' ',
            //        cancelType: 'button icon ion-close button-assertive',
            //        okText: ' ',
            //        okType: 'button icon ion-checkmark-round button-balanced'
            //    };
            //    if ($scope.data.lock) {
            //        $scope.data.approveButtonText = 'Finished';
            //    } else {
            //        $scope.data.approveButtonText = 'Approve';
            //    }
            //    $scope.showConfirm = function () {
            //        var confirmPopup = $ionicPopup.confirm($scope.ionicPopup);
            //        confirmPopup.then(function (res) {
            //            if (res) {
            //                ionicLoading.load('Sending out');
            //                myTask.createTask(approveItem.event, $scope.ServerUserID,
            //                    $scope.inputParas, $scope.keyID, 'Approve')
            //                    .then(function (data) {
            //                        // promise fulfilled
            //                        console.log('Success!', data);
            //                        ionicLoading.unload();
            //                        approveInfoService.addApproveInfo({
            //                            keyText: $scope.keyText,
            //                            keyID: $scope.keyID,
            //                            createTime:new Date().getTime()
            //
            //                        });
            //                        $state.go('approve-conformation');
            //
            //                    }, function (error) {
            //                        ionicLoading.load(error);
            //                        console.log(error);
            //                        $timeout(function(){
            //                            ionicLoading.unload();
            //                        }, 1000);
            //                        approveInfoService.addApproveInfo({
            //                            keyText: $scope.keyText,
            //                            keyID: $scope.keyID,
            //                            createTime:new Date().getTime()
            //                        });
            //                        $scope.approveInfo = approveInfoService.getApproveInfo();
            //                        console.log($scope.approveInfo );
            //                        $state.go('approve-conformation');
            //                    })
            //                    .finally(function () {
            //                        //$scope.data.lock = true;
            //
            //                    });
            //                console.log('approve');
            //            } else {
            //                console.log('cancel');
            //            }
            //        });
            //    };
            //});
        });
    //app.service('approveInfoService', function() {
    //    var approveInfo = [];
    //
    //    var addApproveInfo = function(newObj) {
    //        //productList.push(newObj);
    //        approveInfo=newObj;
    //    };
    //
    //
    //    var getApproveInfo = function(){
    //        return approveInfo;
    //    };
    //
    //    return {
    //        addApproveInfo: addApproveInfo,
    //        getApproveInfo: getApproveInfo
    //    };
    //
    //});
    //app.controller('approveConformationCtrl', function($scope, approveInfoService) {
    //    $scope.approveInfo = approveInfoService.getApproveInfo();
    //    console.log($scope.approveInfo );
    //    $scope.approveInfo.returnTime= new Date($scope.approveInfo.createTime  + 1000*60*10)
    //    console.log($scope.approveInfo.returnTime );
    //
    //});
    //app.factory('purchaseOrderIndexFactory',
    //    function (fbutil, $firebaseObject) {
    //        return function (ref) {
    //            return $firebaseObject(fbutil.ref([ref]));
    //        };
    //    })
    //;

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            //.state('approve-conformation', {
            //    url: '/approve-conformation',
            //    templateUrl: 'scripts/purchase-orders/approve-conformation.html',
            //    controller: 'approveConformationCtrl',
            //    cache: false
            //})
            .state('timeSheet', {
                url: '/timeSheet/:index',
                templateUrl: 'scripts/hr/time-sheet-index.html',
                controller: 'timeSheetCtrl',
                resolve: {
                    timeSheet: function ($stateParams, fbutil, $firebaseObject) {
                        return {
                            //event: 'E0002',
                            obj: $firebaseObject(fbutil.ref([$stateParams.index]))
                        };
                    }
                }

            })
            .state('timeSheetList', {
                url: '/timeSheetList',
                templateUrl: 'scripts/hr/time-sheet-list.html',
                controller: 'ionListViewCtrl',
                resolve: {
                    list: function (fbutil, $stateParams) {
                        return {
                            title: 'Time-Sheet',
                            ref: fbutil.ref(['Event/E0022/100001/CATSRECORDS_OUT']),
                            scroll: '$priority'
                        };
                    }
                }
            })
            .state('timeSheetCreate', {
                url: '/timeSheetCreate',
                templateUrl: 'scripts/hr/leave-request.html',
                controller: 'timeSheetCtrl'
                //,
                //resolve: {
                //    approveItem: function ($stateParams, fbutil, $firebaseObject) {
                //        return {
                //            event: 'E0005',
                //            obj: $firebaseObject(fbutil.ref([$stateParams.ref]))
                //        };
                //    }
                //}

            });
    }]);
})(angular);