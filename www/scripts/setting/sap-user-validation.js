(function (angular) {
    "use strict";

    var app = angular.module('myApp.sapValidation', [ 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);

    app
    .controller('SAPUserValidationCtrl',
    function (SAPUserValidation,myTask, $scope, ionicLoading, myUser) {
        //TODO 如果密码已经存在，可以进行修改操作；如果不存在，进行密码验证。
        //create A0001 task with A0001 input parameters
        var inputParas = '';
        var componentId = 'A0001';
        $scope.languages = myUser.getLanguage();

        $scope.model = {};
        ionicLoading.load();
//        $scope.serverUser = myUser.getServerUser();
        $scope.serverUser = SAPUserValidation;
        $scope.$on('lock.update', function (event) {
            $scope.lock = myUser.getStatus('lock');
        });

        $scope.changedValue = function (language) {
            $scope.model.language = language;
        };

        //   {user/password/valid/language}
        SAPUserValidation.$bindTo($scope, "model").then(function () {
            console.log($scope.model);
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
        $scope.inputPObj = myTask.getInputP(componentId);

        myTask.getInputP('A0001').$loaded().then(
            function (data) {
                var inputParas = data.$value;
                inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
                //TODO replace P02 twice , in the furture use replace-all function
                inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                inputParas = inputParas.replace('$P03$', $scope.ServerUserID);//ServerUserID
                inputParas=inputParas+';FB_FROM_PATH='+$scope.purchaseOrderHeaderRefStr;
                $scope.inputParas = inputParas;
            }
        );


        $scope.inputPObj.$loaded().then(function (data) {
            inputParas = data.$value;
            $scope.serverUser.$loaded().then(function (data) {
                inputParas = inputParas.replace('$P00$', data.$value);
            });
            $scope.SAPSysArray.$loaded()
                .then(function () {
                    $scope.SAPSysArray.forEach(function (entry) {
                        if (entry.$id === 'SAP_SYSTEM_GUID') {
                            inputParas = inputParas.replace('$P01$', entry.$value);
                        } else if (entry.$id === 'SYSTEM_ID') {
                            inputParas = inputParas.replace('$P02$', entry.$value);
                        } else if (entry.$id === 'SERVER_NAME') {
                            inputParas = inputParas.replace('$P03$', entry.$value);
                        } else if (entry.$id === 'INSTANCE_NUMBER') {
                            inputParas = inputParas.replace('$P04$', entry.$value);
                        } else if (entry.$id === 'CLIENT') {
                            inputParas = inputParas.replace('$P05$', entry.$value);
                        }
                    });
                    ionicLoading.unload();
                });
        });

        $scope.tryValidation = function () {
            inputParas = inputParas.replace('$P06$', $scope.model.user);
            inputParas = inputParas.replace('$P07$', $scope.model.password);
            inputParas = inputParas.replace('$P08$', $scope.preflang);

            myTask.createTask(componentId, inputParas,
                'SAPValidation', $scope.clickEvent, buildParms());

        };
        function buildParms() {
            return {
                callback: function (err) {
                    if (err == null) {
                        myUser.markStatus('lock', true);
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
    });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('SAPUserValidation', {
            url: '/SAPUserValidation',
            templateUrl: 'scripts/setting/sap-user-validation.html',
            controller: 'SAPUserValidationCtrl',
            resolve: {
                SAPUserValidation: function (ionicLoading,$firebaseObject,fbutil,$rootScope) {

                    ionicLoading.load('Loading');
                    var obj = $firebaseObject(fbutil.ref(['users', $rootScope.authData.uid, 'setting/mapping/SAPUser']));
                    return obj
                        .$loaded().then(function(){
                            ionicLoading.unload();
                            return obj;
                        });
                }
            }
        });
    }]);
})(angular);