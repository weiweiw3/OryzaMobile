(function (angular) {
    "use strict";

    var app = angular.module('myApp.purchaseOrder', []);


    app.controller('purchaseRequestItemCtrl',
        function (myTask, ionicLoading, approveItem, $ionicPopup, $timeout, $scope) {

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

                var ref = approveItem.obj.$ref().toString();
                var res = ref.split("/");

                if (approveItem.event === 'E0005') {
                    $scope.ServerUserID = res[5];
                    $scope.PURCHASEREQUEST = res[8];
                    $scope.ITEM = res[9];
                    $scope.keyText = 'Purchase Request Approve';
                    $scope.keyID = $scope.PURCHASEREQUEST + ' ' + $scope.ITEM;
                }
                if (approveItem.event === 'E0002') {
                    $scope.ServerUserID = res[5];
                    $scope.PURCHASEORDER = res[8];
                    $scope.purchaseOrderItemsRef = ref.toString()
                        .replace('PO_HEADERS', 'PO_ITEMS');
                    $scope.keyText = 'Purchase Order Approve';
                    $scope.keyID = $scope.PURCHASEORDER;
                }
                $scope.popup={
                    title: $scope.keyText,
                    template: $scope.keyID
                };
                $scope.taskData={
                    event:approveItem.event,
                    serverUserID:$scope.ServerUserID,
                    inputParasRef:ref,
                    jsonContent:''
                };
            });
        });
    app.service('approveInfoService', function () {
        var approveInfo = [];

        var addApproveInfo = function (newObj) {
            //productList.push(newObj);
            approveInfo = newObj;
        };

        var getApproveInfo = function () {
            return approveInfo;
        };

        return {
            addApproveInfo: addApproveInfo,
            getApproveInfo: getApproveInfo
        };

    });
    app.controller('approveConformationCtrl', function ($scope, approveInfoService) {
        $scope.approveInfo = approveInfoService.getApproveInfo();
        console.log($scope.approveInfo);
        $scope.approveInfo.returnTime = new Date($scope.approveInfo.createTime + 1000 * 60 * 10)
        console.log($scope.approveInfo.returnTime);

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
            .state('approve-conformation', {
                url: '/approve-conformation',
                templateUrl: 'scripts/purchase-orders/approve-conformation.html',
                controller: 'approveConformationCtrl',
                cache: false
            })
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