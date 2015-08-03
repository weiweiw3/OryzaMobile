(function (angular) {
    "use strict";

    var app = angular.module('myApp.tasks', []);

    app.controller('taskDetailCtrl',
        function (returnMessage, ionicLoading, $state,
                  $location, $timeout, $scope, jsonFactory) {
            $scope.data = returnMessage;
        });

    app.factory('myTask',
        function ($http, $q, taskUrl, firebaseRef, $rootScope, ionicLoading,
                  $timeout, fbutil, fAsync, httpUtil, FIREBASE_URL) {

            var taskDefaultRefStr = 'CompanySetting/EventDefaltValues';
            var SAPSystemRefStr = 'CompanySetting/sap_system/sap_system_guid_default';
            var myTask;

            myTask = {
                getTaskDefaultValue: function (event) {
                    return fAsync([taskDefaultRefStr, event]);
                },
                getSAPSys: function () {
                    return fAsync([SAPSystemRefStr]);
                },
                createTaskData: function (event, defaultData, ServerUser, inputParasRef, jsonContent) {
                    //data.inputParas
                    //data.jsonContent
                    var d = $q.defer();
                    var taskData = defaultData;

                    taskData.userId = ServerUser;
                     if (typeof jsonContent === 'object') {
                        switch (event) {
                            case 'E0002' || 'E0003' :
                                taskData.jsonContent = jsonContent;
                                break;
                        }
                    }
                    if (typeof defaultData.jsonContent === 'object') {
                        taskData.jsonContent = defaultData.jsonContent;
                        switch (event) {
                            case 'A0001':
                                break;
                            case 'E0025':
                                taskData.jsonContent.CATSRECORDS[0] = jsonContent;
                                break;
                            case 'E0024_CHANGE':
                                taskData.jsonContent.CATSRECORDS_IN[0] = jsonContent;
                                break;

                        }

                    }

                    if (typeof defaultData.inputParas === 'string' && typeof inputParasRef === 'string') {

                        var array = inputParasRef.split("/");
                        var inputParas = defaultData.inputParas;

                        switch (event) {
                            case 'A0001':
                                myTask.getSAPSys().then(function (data) {
                                    angular.forEach(data, function (value, key) {
                                        switch (key.toUpperCase()) {
                                            case 'SAP_SYSTEM_GUID':
                                                inputParas = inputParas.replace('$P01$', value);
                                                break;
                                            case 'SYSTEM_ID':
                                                inputParas = inputParas.replace('$P02$', value);
                                                break;
                                            case 'SERVER_NAME':
                                                inputParas = inputParas.replace('$P03$', value);
                                                break;
                                            case 'INSTANCE_NUMBER':
                                                inputParas = inputParas.replace('$P04$', value);
                                                break;
                                            case 'CLIENT':
                                                inputParas = inputParas.replace('$P05$', value);
                                                break;
                                        }
                                    });

                                    inputParas = inputParas.replace('$P06$', array[0]);//SAP_USER
                                    inputParas = inputParas.replace('$P07$', array[1]);//SAP_PASSWORD
                                    inputParas = inputParas.replace('$P08$', array[2]);//SAP_LANGUAGE

                                    taskData.inputParas = inputParas;
                                    //inputParas = inputParas + ';FB_FROM_PATH=' + inputParasRef.replace(FIREBASE_URL, '');

                                    d.resolve(taskData);
                                });
                                break;
                            case 'E0005':
                                inputParas = inputParas.replace('$P01$', array[6].substr(3));//PO_REL_CODE
                                // TODO replace P02 twice , in the furture use replace-all function
                                inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEREQUEST
                                inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEREQUEST
                                inputParas = inputParas.replace('$P03$', array[9]);//ITEM
                                inputParas = inputParas.replace('$P03$', array[9]);//ITEM
                                inputParas = inputParas.replace('$P04$', array[5]);//ServerUserID
                                taskData.inputParas = inputParas;
                                d.resolve(taskData);
                                break;
                            case 'E0002'|| 'E0003':
                                inputParas = inputParas.replace('$P01$', array[2]);//PO_REL_CODE
                                inputParas = inputParas.replace('$P01$', array[2]);//PO_REL_CODE
                                //TODO replace P02 twice , in the furture use replace-all function
                                inputParas = inputParas.replace('$P02$', array[1]);//PURCHASEORDER
                                inputParas = inputParas.replace('$P02$', array[1]);//PURCHASEORDER
                                inputParas = inputParas.replace('$P03$', array[0]);//ServerUserID
                                taskData.inputParas = inputParas;
                                d.resolve(taskData);
                                break;
                        }

                    }
                    return d.promise;

                },
                addTaskKey: function (taskData, taskRef, event) {
                    var d = $q.defer();
                    //push完新task后，把新生成的key也存下来。
                    var onComplete = function () {
                        taskData.inputParas = taskData.inputParas + ';event=' + event +
                        ';FB_PATH=tasks/' + taskData.userId + '/' + newTaskRef.key();
                        newTaskRef.set({
                                event: event,
                                time: new Date(),
                                sendData: taskData
                            },
                            function (error) {
                                if (error) {
                                    d.reject(error);
                                    console.log("Error:", error);
                                }
                                console.log('new Task' + newTaskRef.key());
                                //newTaskRef.on("value", function (snap) {d.resolve(angular.toJson(snap.val()));});
                                d.resolve({
                                    ref: newTaskRef,
                                    taskData: taskData
                                });
                            });
                    };
                    var newTaskRef = taskRef
                        .push({
                            sendData: 'x'
                        }, onComplete);

                    return d.promise;
                },
                postTask: function (data) {
                    var d = $q.defer();
                    //timeout default value is 15
                    var httpRequest = httpUtil.httpRequestHandler('POST', taskUrl.url + '/createTask', data, 15);
                    httpRequest.then(function (jsonObj) {
                        console.log(jsonObj);
                        d.resolve(jsonObj);
                    }, function (error) {
                        console.log(error);
                        d.reject(error);
                    });
                    return d.promise;
                },
                monitorTask: function (ref) {
                    var d = $q.defer();
                    var onChildAdded = function (childSnapshot, prevChildKey) {
                        if (childSnapshot.key() === 'RETURN') {
                            ionicLoading.unload();
                            ref.once('value', function (snapshot) {
                                if (snapshot.child('TASK_INFO/task_status').val() == 3
                                    && snapshot.child('RETURN/TYPE').val() !== ('E' || 'A')) {
                                    console.log('successful');
                                    d.resolve('successful');
                                }
                                if (snapshot.child('TASK_INFO/task_status').val() == 9) {
                                    console.log('error');
                                    d.reject('error');
                                }
                            })
                        }
                    };
                    ionicLoading.load('wait for results');
                    $timeout(function () {
                        ionicLoading.unload();
                        ref.off('child_added', onChildAdded);
                        d.reject('timeout');
                        console.log('timeout')
                    }, 15000);
                    ref.on('child_added', onChildAdded);

                    return d.promise;
                },
                createTask: function (event, ServerUser, inputParasRef, jsonContent) {

                    var taskRef = fbutil.ref(['tasks', ServerUser]);
                    var d = $q.defer();
                    myTask.getTaskDefaultValue(event)
                        .then(function (defaultData) {
                            myTask.createTaskData(event,
                                defaultData, ServerUser, inputParasRef, jsonContent).then(
                                function (taskData) {
                                    myTask.addTaskKey(taskData, taskRef, event)
                                        .then(function (data) {
                                            console.log(data);
                                            var ref = data.ref;
                                            myTask.postTask(data.taskData)
                                                .then(function (data) {
                                                    //if(event==='A0001'){
                                                    myTask.monitorTask(ref).then(function (data) {
                                                        d.resolve(data);
                                                    }).catch(function (err) {
                                                        d.reject(err);
                                                    });
                                                    //}
                                                    //else{
                                                    //    d.resolve('send out');
                                                    //}

                                                }).catch(function (err) {
                                                    d.reject(err);
                                                });
                                        }).catch(function (err) {
                                            d.reject(err);
                                        });
                                }
                            );
                        });
                    return d.promise;
                }
            };
            return myTask;
        });

    app.directive('createTask', function ($rootScope, myTask, approveInfoService) {

        return {
            restrict: "EA",
            scope: {
                buttonText: '@',
                popup: '=',// Use @ for One Way Text Binding;Use = for Two Way Binding;Use & to Execute Functions in the Parent Scope
                taskData: '='
            },
            controller: function (ionicLoading, $ionicPopup, $timeout, $scope, $state) {
                $scope.$watch('popup', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    $scope.ionicPopup = {
                        title: $scope.popup.title,
                        cssClass: 'ionicPopup',
                        template: $scope.popup.template,
                        cancelText: 'CANCEL',
                        cancelType: 'button button-clear button-positive',
                        okText: 'APPROVE',
                        okType: 'button button-clear button-positive'
                    };
                });

                $scope.showConfirm = function () {
                    var confirmPopup = $ionicPopup.confirm($scope.ionicPopup);
                    confirmPopup.then(function (res) {
                        if (res) {
                            ionicLoading.load('Sending out');
                            console.log($scope.taskData);
                            myTask.createTask($scope.taskData.event, $scope.taskData.serverUserID,
                                $scope.taskData.inputParasRef, $scope.taskData.jsonContent)
                                .then(function (data) {
                                    // promise fulfilled
                                    //console.log('Success!', data);
                                    //ionicLoading.unload();
                                    //approveInfoService.addApproveInfo({
                                    //    keyText: $scope.popup.title,
                                    //    keyID: $scope.popup.template,
                                    //    createTime: new Date().getTime()
                                    //});
                                    $state.go('task-success');

                                }, function (error) {
                                    ionicLoading.load(error);
                                    console.log(error);
                                    $timeout(function () {
                                        ionicLoading.unload();
                                    }, 1000);

                                    $scope.approveInfo = approveInfoService.getApproveInfo();
                                    console.log($scope.approveInfo);
                                    //$state.go('approve-conformation');
                                })
                                .catch(function (err) {
                                    console.log('Success!', err);
                                    ionicLoading.unload();
                                    approveInfoService.addApproveInfo({
                                        keyText: $scope.popup.title,
                                        keyID: $scope.popup.template,
                                        createTime: new Date().getTime()
                                    });
                                    $state.go('approve-conformation');
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

            template: '<a  ng-click="showConfirm()">{{buttonText}}</a>',
            replace: true,
            link: function (ionicLoading, $ionicPopup, $timeout, $scope) {
            }
        };
    });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('task-success', {
                url: '/task-success',
                //controller: "taskSuccessCtrl",
                templateUrl: 'scripts/tasks/task-success.html'
            })
            .state('taskDetail', {
                url: '/taskDetail/:task',
                templateUrl: 'scripts/tasks/task-detail.html',
                controller: "taskDetailCtrl",
                resolve: {
                    returnMessage: function ($q, $firebaseObject, $rootScope, fbutil, $stateParams) {
                        var d = $q.defer();
                        console.log('x');
                        $firebaseObject(fbutil.ref(['tasks', $rootScope.serverUser, $stateParams.task, 'RETURN']))
                            .$loaded().then(function (data) {
                                d.resolve(data);
                            });
                        return d.promise;
                    }
                }
            })
            .state('approve-conformation', {
                url: '/approve-conformation',
                templateUrl: 'scripts/tasks/approve-conformation.html',
                controller: 'approveConformationCtrl',
                cache: false
            });
    }]);

})(angular);