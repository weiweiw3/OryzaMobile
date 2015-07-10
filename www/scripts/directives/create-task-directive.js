/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.directives.createTask', [])

    .directive('createTask', function ($rootScope, myTask, approveInfoService) {

        return {
            restrict: "EA",
            scope: {
                popup: '=',// Use @ for One Way Text Binding;Use = for Two Way Binding;Use & to Execute Functions in the Parent Scope
                taskData: '='
            },
            controller: function (ionicLoading, $ionicPopup, $timeout, $scope) {
                $scope.$watch('popup', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    $scope.ionicPopup = {
                        title: $scope.popup.title,
                        template: $scope.popup.template,
                        cancelText: ' ',
                        cancelType: 'button icon ion-close button-assertive',
                        okText: ' ',
                        okType: 'button icon ion-checkmark-round button-balanced'
                    };
                });

                $scope.showConfirm = function () {
                    var confirmPopup = $ionicPopup.confirm($scope.ionicPopup);
                    confirmPopup.then(function (res) {
                        if (res) {
                            ionicLoading.load('Sending out');
                            console.log($scope.taskData);
                            myTask.createTask($scope.taskData.event, $scope.taskData.serverUserID, $scope.taskData.inputParasRef,$scope.taskData.jsonContent)
                                .then(function (data) {
                                    // promise fulfilled
                                    console.log('Success!', data);
                                    ionicLoading.unload();
                                    approveInfoService.addApproveInfo({
                                        keyText: $scope.keyText,
                                        keyID: $scope.keyID,
                                        createTime: new Date().getTime()

                                    });
                                    //$state.go('approve-conformation');

                                }, function (error) {
                                    ionicLoading.load(error);
                                    console.log(error);
                                    $timeout(function () {
                                        ionicLoading.unload();
                                    }, 1000);
                                    approveInfoService.addApproveInfo({
                                        keyText: $scope.keyText,
                                        keyID: $scope.keyID,
                                        createTime: new Date().getTime()
                                    });
                                    $scope.approveInfo = approveInfoService.getApproveInfo();
                                    console.log($scope.approveInfo);
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
                };
            },
            template: '<a class="button button-block button-positive" ng-click="showConfirm()">approve</a>',
            replace: true,
            link: function (ionicLoading, $ionicPopup, $timeout, $scope) {
            }
        };
    });