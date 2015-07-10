/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.directives.createTask', [])

    .directive('createTask', function (myMessage, $rootScope, myTask, $q, $animate, ionicLoading) {

        return {
            restrict: "E",
            scope: {
                message: "="// Use @ for One Way Text Binding;Use = for Two Way Binding;Use & to Execute Functions in the Parent Scope
            },
            controller: function ($scope) {
                $scope.btnText = '';
                $scope.btnshow = false;
            },
            template: '<a class="button button-block button-positive"' +
                'ng-disabled="isDisabled" ng-click="click()">{{ btnText }}</a>',
            replace: true,
            link: function ($scope, element) {
                var componentId = 'E0002';
                var inputParas = '';
                var P01, P02, P03;
                $scope.releaseGroup = '02_PU';
                ionicLoading.load();
                $scope.inputPObj = myTask.getInputP(componentId);
                $scope.inputPObj.$loaded().then(
                    function (data) {
                        inputParas = data.$value;
                        inputParas = inputParas.replace('$P01$', P01);//PO_REL_CODE
                        //TODO replace P02 twice , in the furture use replace-all function
                        inputParas = inputParas.replace('$P02$', P02);//PURCHASEORDER
                        inputParas = inputParas.replace('$P02$', P02);//PURCHASEORDER
                        inputParas = inputParas.replace('$P03$', P03);//ServerUserID

                    }
                );
                $scope.$watch('message', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    $scope.messageId = newVal.id;
                    $scope.componentId = newVal.component;
                    // P01,P02,P03 for replace inputP

                    //TODO support one purchase order : Multiple release group
                    P01 = $scope.releaseGroup.substr(3);
                    P02 = newVal.id;
                    P03 = newVal.serverUserid;
                    myMessage.markStatus($scope.componentId, $scope.messageId, 'lock');
                });
                $scope.$on('lock.update', function (event) {
                    $scope.lock = myMessage.getStatus($scope.componentId, $scope.messageId, 'lock');
                    console.log($scope.componentId, $scope.messageId, $scope.lock);
                    toggleLock($scope.lock);
                });

                function toggleLock(lock) {
                    if (typeof $scope.lock == "boolean" && lock) {
                        $scope.isDisabled = true;
                        $scope.btnText = 'SEND OUT';
                    } else {

                        $scope.btnText = 'Approve as ' + $scope.releaseGroup;
                        $scope.isDisabled = false;
                        $scope.clickEvent = 'Approve';
                    }
                    ionicLoading.unload();
                }

                $scope.click = function () {
                    $scope.btnText = 'processing...';
                    ionicLoading.load();
                    myTask.createTask(componentId,
                        inputParas, $scope.message.id, 'Approve', buildParms());
                };

                function buildParms() {
                    return {
                        callback: function (err) {
                            if (err == null) {
                                ionicLoading.load();
                                myMessage.markStatus($scope.componentId, $scope.messageId, 'lock', true);
                            }
                            if (err) {
                                $scope.err = err;
                            }
                            else {
                                $scope.msg = 'finished';
                            }
                        }
                    };
                }
            }
        };
    });