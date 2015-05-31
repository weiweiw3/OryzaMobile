(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrder', [ 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);

    app.controller('purchaseOrderIndexCtrl',
        function (myTask, ionicLoading, purchaseOrder, $ionicPopup, $timeout, $scope, fbutil) {

            ionicLoading.load('Loading');
            $scope.$watch('data.lock', function (newVal) {
                if (typeof $scope.data != "undefined"){
                    if (newVal ) {
                        $scope.data.approveButtonText = 'SEND OUT';
                    } else {
                        console.log($scope.data);

                        $scope.data.approveButtonText = 'Approve';
                    }
                }

            });
            purchaseOrder.$bindTo($scope, "data").then(function () {
                $scope.data.read = true;
                ionicLoading.unload();
                $scope.data.approveButtonText = 'Approve';
                $scope.component = purchaseOrder.$ref().parent().parent().parent().parent().key();
                $scope.ServerUserID = purchaseOrder.$ref().parent().parent().parent().key();
                $scope.PO_REL_CODE = purchaseOrder.$ref().parent().parent().key().substr(3);
                $scope.PURCHASEORDER = purchaseOrder.$ref().key();
                $scope.purchaseOrderHeaderRefStr = purchaseOrder.$ref().toString()
                    .replace(purchaseOrder.$ref().root().toString(), '');
                $scope.purchaseOrderItemsRef = $scope.purchaseOrderHeaderRefStr
                    .replace('PO_HEADERS', 'PO_ITEMS');

                //通过检查对应E0002,如果审批错误即返回值等于9，那么改变lock可以继续审批
                fbutil.ref(['Event/E0002', $scope.ServerUserID])
                    .startAt($scope.PURCHASEORDER)
                    .endAt($scope.PURCHASEORDER)
                    .once('value', function (snap) {
                        snap.child($scope.PURCHASEORDER).child('TASK_INFO').child('task_status')
                            .ref().once('value', function (snap) {
                                if (snap.val() == 9) {
                                    $scope.data.lock = false;
                                }
                            });
                    });

                if ($scope.data.lock) {
                    $scope.data.approveButtonText = 'SEND OUT';
                } else {
                    $scope.data.approveButtonText = 'Approve';
                }
                //E0001->E0002
                myTask.getInputP('E0002').$loaded().then(
                    function (data) {
                        var inputParas = data.$value;
                        inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
                        //TODO replace P02 twice , in the furture use replace-all function
                        inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                        inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                        inputParas = inputParas.replace('$P03$', $scope.ServerUserID);//ServerUserID
                        inputParas = inputParas + ';FB_FROM_PATH=' + $scope.purchaseOrderHeaderRefStr;
                        $scope.inputParas = inputParas;
                    }
                );
                $scope.showConfirm = function () {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Purchase Order Approve',
                        template: $scope.data.po_NUMBER,
                        cancelText: ' ',
                        cancelType: 'button icon ion-close button-assertive',
                        okText: ' ',
                        okType: 'button icon ion-checkmark-round button-balanced'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            ionicLoading.load('Sending out');
                            myTask.createTask('E0002', $scope.ServerUserID,
                                $scope.inputParas, $scope.PURCHASEORDER, 'Approve')
                                .then(function (data) {
                                    // promise fulfilled
                                    console.log('Success!', data);
                                    //$scope.data.lock = true;
//                                if (data.forecast==='good') {
//                                    prepareFishingTrip();
//                                } else {
//                                    prepareSundayRoastDinner();
//                                }
                                }, function (error) {
                                    // promise rejected, could log the error with: console.log('error', error);
//                                prepareSundayRoastDinner();
                                })
                                .finally(function(){
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

    app.factory('purchaseOrderIndexFactory',
        function (fbutil, $firebaseObject) {
            return function (ref) {
                return $firebaseObject(fbutil.ref([ref]));
            };
        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('purchaseOrder', {
            url: '/purchaseOrder/:ref',
            templateUrl: 'scripts/purchase-orders/purchase-order-index.html',
            controller: 'purchaseOrderIndexCtrl',
            resolve: {
                purchaseOrder: function ($stateParams, purchaseOrderIndexFactory) {
                    return purchaseOrderIndexFactory($stateParams.ref);
                }
            }
        });
    }]);
})(angular);