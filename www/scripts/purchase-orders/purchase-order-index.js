(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrder', ['ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);


    app.controller('purchaseRequestItemCtrl',
        function (myTask, ionicLoading, approveItem, $ionicPopup, $timeout, $scope, fbutil) {

            ionicLoading.load('Loading');
            $scope.$watch('data.lock', function (newVal) {
                if (typeof $scope.data != "undefined") {
                    if (newVal) {
                        $scope.data.approveButtonText = 'Finished';
                    } else {
                        console.log($scope.data);

                        $scope.data.approveButtonText = 'Approve';
                    }
                }

            });
            approveItem.obj.$bindTo($scope, "data").then(function () {
                ionicLoading.unload();

                $scope.data.approveButtonText = 'Approve';

                var ref = approveItem.obj.$ref();
                var res = ref.toString().split("/");

                if (approveItem.event === 'E0005') {

                    $scope.ServerUserID = res[5];
                    $scope.PR_REL_CODE = res[6].substr(3);
                    $scope.PURCHASEREQUEST = res[8];
                    $scope.ITEM = res[9];
                    $scope.refStr = ref.toString()
                        .replace(ref.root().toString(), '');

                    //通过检查对应E0005,如果审批错误即返回值等于null，那么改变lock可以继续审批
                    fbutil.ref(['Event/' + approveItem.event, $scope.ServerUserID])
                        .startAt($scope.PURCHASEREQUEST)
                        .endAt($scope.PURCHASEREQUEST)
                        .once('value', function (snap) {
                            snap.child($scope.PURCHASEREQUEST).child($scope.ITEM).child('TASK_INFO')
                                .ref().once('value', function (snap) {
                                    if(snap.exportVal()!=null)$scope.history = snap.exportVal();
                                    if (snap.child('task_status').val() != null) {
                                        $scope.data.lock = true;
                                    } else {
                                        $scope.data.lock = false;
                                    }
                                });
                        });

                    //E0004->E0005
                    myTask.getInputP(approveItem.event).$loaded().then(
                        function (data) {
                            var inputParas = data.$value;
                            inputParas = inputParas.replace('$P01$', $scope.PR_REL_CODE);//PO_REL_CODE
                            // TODO replace P02 twice , in the furture use replace-all function
                            inputParas = inputParas.replace('$P02$', $scope.PURCHASEREQUEST);//PURCHASEREQUEST
                            inputParas = inputParas.replace('$P02$', $scope.PURCHASEREQUEST);//PURCHASEREQUEST
                            inputParas = inputParas.replace('$P03$', $scope.ITEM);//ITEM
                            inputParas = inputParas.replace('$P03$', $scope.ITEM);//ITEM
                            inputParas = inputParas.replace('$P04$', $scope.ServerUserID);//ServerUserID
                            inputParas = inputParas + ';FB_FROM_PATH=' + $scope.refStr;
                            console.log(inputParas);
                            $scope.inputParas = inputParas;
                        }
                    );

                    $scope.ionicPopup = {
                        title: 'Purchase Request Approve',
                        template: $scope.PURCHASEREQUEST + ' ' + $scope.ITEM,
                        cancelText: ' ',
                        cancelType: 'button icon ion-close button-assertive',
                        okText: ' ',
                        okType: 'button icon ion-checkmark-round button-balanced'
                    };
                    $scope.orderID = $scope.PURCHASEREQUEST + ' ' + $scope.ITEM;
                }

                if (approveItem.event === 'E0002') {

                    $scope.ServerUserID = res[5];
                    $scope.PO_REL_CODE = res[6].substr(3);
                    $scope.PURCHASEORDER = res[8];
                    $scope.purchaseOrderHeaderRefStr = ref.toString()
                        .replace(ref.root().toString(), '');
                    $scope.purchaseOrderItemsRef = $scope.purchaseOrderHeaderRefStr
                        .replace('PO_HEADERS', 'PO_ITEMS');

                    //通过检查对应E0002,如果审批错误即返回值等于null，那么改变lock可以继续审批
                    fbutil.ref(['Event/' + approveItem.event, $scope.ServerUserID])
                        .startAt($scope.PURCHASEORDER)
                        .endAt($scope.PURCHASEORDER)
                        .once('value', function (snap) {
                            snap.child($scope.PURCHASEORDER).child('TASK_INFO')
                                .ref().once('value', function (snap) {
                                    if(snap.exportVal()!=null)$scope.history = snap.exportVal();

                                    console.log(snap.exportVal());
                                    if (snap.child('task_status').val() != null) {
                                        $scope.data.lock = true;
                                    } else {
                                        $scope.data.lock = false;
                                    }
                                });
                        });

                    //E0001->E0002
                    myTask.getInputP(approveItem.event).$loaded().then(
                        function (data) {
                            var inputParas = data.$value;
                            inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
                            inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
                            //TODO replace P02 twice , in the furture use replace-all function
                            inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                            inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                            inputParas = inputParas.replace('$P03$', $scope.ServerUserID);//ServerUserID
                            inputParas = inputParas + ';FB_FROM_PATH=' + $scope.purchaseOrderHeaderRefStr;
                            console.log(inputParas);
                            $scope.inputParas = inputParas;
                        }
                    );

                    $scope.ionicPopup = {
                        title: 'Purchase Order Approve',
                        template: $scope.data.po_NUMBER,
                        cancelText: ' ',
                        cancelType: 'button icon ion-close button-assertive',
                        okText: ' ',
                        okType: 'button icon ion-checkmark-round button-balanced'
                    };
                    $scope.orderID = $scope.PURCHASEORDER;

                }
                if ($scope.data.lock) {
                    $scope.data.approveButtonText = 'Finished';
                } else {
                    $scope.data.approveButtonText = 'Approve';
                }
                $scope.showConfirm = function () {
                    var confirmPopup = $ionicPopup.confirm($scope.ionicPopup);
                    confirmPopup.then(function (res) {
                        if (res) {
                            ionicLoading.load('Sending out');
                            myTask.createTask(approveItem.event, $scope.ServerUserID,
                                $scope.inputParas, $scope.orderID, 'Approve')
                                .then(function (data) {
                                    // promise fulfilled
                                    console.log('Success!', data);

                                }, function (error) {
                                    // promise rejected, could log the error with: console.log('error', error);
//                                prepareSundayRoastDinner();
                                })
                                .finally(function () {
                                    //$scope.data.lock = true;
                                    ionicLoading.unload();
                                });
                            console.log('approve');
                        } else {
                            console.log('cancel');
                        }
                    });
                };
            });
        });


    //app.factory('purchaseOrderIndexFactory',
    //    function (fbutil, $firebaseObject) {
    //        return function (ref) {
    //            return $firebaseObject(fbutil.ref([ref]));
    //        };
    //    })
    //;

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider

            .state('purchaseOrder', {
                url: '/purchaseOrder/:ref',
                templateUrl: 'scripts/purchase-orders/purchase-order-index.html',
                controller: 'purchaseRequestItemCtrl',
                resolve: {
                    approveItem: function ($stateParams, fbutil, $firebaseObject) {
                        return {
                            event: 'E0002',
                            obj: $firebaseObject(fbutil.ref([$stateParams.ref]))
                        };
                    }
                }

            })
            .state('purchaseRequestItem', {
                url: '/purchaseRequestItem/:ref',
                templateUrl: 'scripts/purchase-orders/purchase-request-item.html',
                controller: 'purchaseRequestItemCtrl',
                resolve: {
                    approveItem: function ($stateParams, fbutil, $firebaseObject) {
                        return {
                            event: 'E0005',
                            obj: $firebaseObject(fbutil.ref([$stateParams.ref]))
                        };
                    }
                }

            });
    }]);
})(angular);