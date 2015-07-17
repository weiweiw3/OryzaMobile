(function (angular) {
    "use strict";

    var app = angular.module('myApp.sapValidation', [ 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);

    app
        .controller('SAPUserValidationCtrl',
        function ($firebaseObject, $rootScope, SAPUser, myTask, $scope, ionicLoading, myUser) {
            //TODO 如果密码已经存在，可以进行修改操作；如果不存在，进行密码验证。
            //create A0001 task with A0001 input parameters

            $scope.languages = myUser.getLanguage();
//        ionicLoading.load();
            $scope.$on('lock.update', function (event) {
                $scope.lock = myUser.getStatus('lock');
            });

            $scope.changedValue = function (language) {
                $scope.model.language = language;
            };
            $scope.change = function (user, nodeName) {
                if (!angular.isDefined(user[nodeName])) {
                    console.log(user[nodeName]);
                    user[nodeName] = null;
                }
            };
            //   {user/password/valid/language}
            SAPUser.$bindTo($scope, "model").then(function () {

                if (typeof $scope.model.language !== 'undefined') {
                    $scope.preflang = $scope.model.language;
                } else {
                    $scope.preflang = '1';
                }
                if (!$scope.model.valid) {
                    $scope.buttontext = 'validate';
                } else {
                    $scope.buttontext = 'update';
                }

                if (typeof $scope.model.lock !== 'undefined') {

                    $scope.lock = $scope.model.lock;
                } else {
                    $scope.lock = false;
                }
            });
            $scope.SAPSysArray = myUser.getSAPSys();
//            myTask.getInputP('A0001').$loaded().then(function (data) {
//
//                $scope.SAPSysArray.$loaded()
//                    .then(function () {
//                        var inputParas = data.$value;
//                        inputParas = inputParas.replace('$P00$', $rootScope.serverUser);//ServerUserID
//                        $scope.SAPSysArray.forEach(function (entry) {
//                            switch (entry.$id.toUpperCase()) {
//                                case 'SAP_SYSTEM_GUID':
//                                    inputParas = inputParas.replace('$P01$', entry.$value);
//                                    break;
//                                case 'SYSTEM_ID':
//                                    inputParas = inputParas.replace('$P02$', entry.$value);
//                                    break;
//                                case 'SERVER_NAME':
//                                    inputParas = inputParas.replace('$P03$', entry.$value);
//                                    break;
//                                case 'INSTANCE_NUMBER':
//                                    inputParas = inputParas.replace('$P04$', entry.$value);
//                                    break;
//                                case 'CLIENT':
//                                    inputParas = inputParas.replace('$P05$', entry.$value);
//                                    break;
//                            }
//                        });
//                        $scope.inputParas = inputParas;
//                        ionicLoading.unload();
//                    });
//            });
////
            $scope.tryValidation = function () {
                $scope.inputParas = $scope.inputParas.replace('$P06$', $scope.model.user);
                $scope.inputParas = $scope.inputParas.replace('$P07$', $scope.model.password);
                $scope.inputParas = $scope.inputParas.replace('$P08$', $scope.preflang);
                console.log($scope.inputParas);
//            myTask.createTask('A0001', $scope.inputParas,
//                'SAPValidation', $scope.clickEvent, buildParms());
                myTask.createTask('A0001', $rootScope.serverUser,
                    $scope.inputParas, 'A0001', 'Approve');
                $scope.model.lock = true;
            };

        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('SAPUserValidation', {
            url: '/SAPUserValidation',
            templateUrl: 'scripts/setting/sap-user-validation.html',
            controller: 'SAPUserValidationCtrl',
            resolve: {
                SAPUser: function (ionicLoading, $firebaseObject, fbutil, $rootScope) {

                    ionicLoading.load('Loading');
                    var obj = $firebaseObject(fbutil.ref(['users', $rootScope.authData.uid, 'setting/mapping/SAPUser']));
                    return obj
                        .$loaded().then(function () {
                            ionicLoading.unload();
                            return obj;
                        });
                }
            }
        });
    }]);
})(angular);