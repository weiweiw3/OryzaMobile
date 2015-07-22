/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myTask',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])
    .factory('myTask',
    function ($http, $q, ApiEndpoint, firebaseRef, $rootScope, syncArray, syncObject, $timeout, simpleLogin, config, fbutil) {
        var currentUser = simpleLogin.user.uid;
        var date = Date.now();
        var messageLog = {
            action: '',
            user: currentUser,
            date: date
        };
        var taskDefaultRefStr = 'CompanySetting/EventDefaltValues';
        var SAPSystemRefStr = 'CompanySetting/sap_system/sap_system_guid_default';
        var myTask;
        myTask = {
            getTaskDefaultValue: function (event) {
                var d = $q.defer();
                fbutil.ref([taskDefaultRefStr, event]).once('value', function (snapshot) {
                    d.resolve(snapshot.exportVal());
                }, function (err) {
                    d.reject(err);
                });
                return d.promise;
            },
            getSAPSys: function () {
                var d = $q.defer();
                fbutil.ref([SAPSystemRefStr]).once('value', function (snapshot) {
                    d.resolve(snapshot.exportVal());
                }, function (err) {
                    d.reject(err);
                });
                return d.promise;

            },
            checkNodeLock: function (refArray, refWhere) {
                //var d=$q.defer();
                fbutil.ref(refArray).child(refWhere).child('TASK_INFO')
                    .once('value', function (snap) {
                        console.log(snap.val());
                        //if (snap.exportVal() != null)$scope.history = snap.exportVal();
                        if (snap.child('task_status').val() != null) {
                            $scope.data.lock = true;
                        } else {
                            $scope.data.lock = false;
                        }
                    });
                //return d.promise;
            },

            taskInformationCombine: function (event, defaultData, ServerUser, inputParasRef, jsonContent) {
                //data.inputParas
                //data.jsonContent
                var taskData = defaultData;
                console.log(ServerUser);
                taskData.userId = ServerUser;
                if (typeof defaultData.jsonContent === 'object') {
                    taskData.jsonContent = defaultData.jsonContent;
                    if (event === 'E0025') {
                        taskData.jsonContent.CATSRECORDS[0] = jsonContent;
                    }
                    if (event === 'E0024_CHANGE') {
                        taskData.jsonContent.CATSRECORDS_IN[0] = jsonContent;
                    }

                }
                if (typeof defaultData.inputParas === 'string' && typeof inputParasRef === 'string') {

                    //var d = $q.defer();
                    var array = inputParasRef.split("/");
                    var inputParas = defaultData.inputParas;

                    if (event === 'A0001') {
                        myTask.getSAPSys().then(function (data) {
                            angular.forEach(data,function (value, key) {
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

                            inputParas = inputParas.replace('$P06$', array[0]);//ITEM
                            inputParas = inputParas.replace('$P07$', array[1]);//ITEM
                            inputParas = inputParas.replace('$P08$', array[2]);//ServerUserID
                            console.log(data);
                            console.log(inputParas);
                        });

                    }
                    if (event === 'E0005') {
                        //E0004->E0005
                        inputParas = inputParas.replace('$P01$', array[6].substr(3));//PO_REL_CODE
                        // TODO replace P02 twice , in the furture use replace-all function
                        inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEREQUEST
                        inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEREQUEST
                        inputParas = inputParas.replace('$P03$', array[9]);//ITEM
                        inputParas = inputParas.replace('$P03$', array[9]);//ITEM
                        inputParas = inputParas.replace('$P04$', array[5]);//ServerUserID
                    }

                    if (event === 'E0002') {
                        //E0001->E0002
                        inputParas = inputParas.replace('$P01$', array[6].substr(3));//PO_REL_CODE
                        inputParas = inputParas.replace('$P01$', array[6].substr(3));//PO_REL_CODE
                        //TODO replace P02 twice , in the furture use replace-all function
                        inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEORDER
                        inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEORDER
                        inputParas = inputParas.replace('$P03$', array[5]);//ServerUserID
                    }
                    inputParas = inputParas + ';FB_FROM_PATH=' + inputParasRef.replace('https://', '');
                    taskData.inputParas = inputParas;

                }
                console.log(taskData);
                return taskData;
            },
            createTask: function (event, ServerUser, inputParasRef, jsonContent) {

                var taskRef = firebaseRef(['tasks']);

                return myTask.getTaskDefaultValue(event)
                    .then(function (defaultData) {
                        var taskData = myTask.taskInformationCombine(event,
                            defaultData, ServerUser, inputParasRef, jsonContent);
                        console.log(taskData);
                        taskNodeAdd(taskData, taskRef)
                            .then(function (data) {
                                console.log(data);
                                return postTask(data);
                            });
                    });

                //                    .catch(errorFn);;

                function httpRequestHandler(method, url, data, timeoutNum) {
                    var timeout = $q.defer(),
                        result = $q.defer(),
                        timedOut = false,
                        httpRequest;

                    setTimeout(function () {
                        timedOut = true;
                        timeout.resolve();
                    }, (1000 * timeoutNum));

                    httpRequest = $http({
                        method: method,
                        url: url,
                        data: data,
                        cache: false,
                        timeout: timeout.promise
                    });

                    httpRequest.success(function (data, status, headers, config) {
                        result.resolve(data);
                    });

                    httpRequest.error(function (data, status, headers, config) {
                        if (timedOut) {
                            //result.reject({
                            //    error: 'timeout',
                            //    message: 'Request took longer than ' + timeoutNum + ' seconds.'
                            //});
                            result.reject('Could not connect to server, Please try again later.');
                        } else {
                            result.reject(data);
                        }
                    });

                    return result.promise;
                }

                function postTask(data) {
                    var d = $q.defer();
                    //timeout default value is 15
                    var httpRequest = httpRequestHandler('POST', ApiEndpoint.url + '/createTask', data, 15);
                    httpRequest.then(function (jsonObj) {
                        //$scope.status = 'Complete';
                        console.log(jsonObj);
                        d.resolve(jsonObj);
                    }, function (error) {
                        //$scope.status = 'Error';
                        console.log(error);
                        d.reject(error);
                    });
                    return d.promise;
                }


                function taskNodeAdd(taskData, taskRef) {
                    var d = $q.defer();
                    //push完新task后，把新生成的key也存下来。
                    var onComplete = function () {
                        taskData.inputParas = taskData.inputParas + ';task_FB=' + newTaskRef.key();
                        newTaskRef.child('inputParas').set(taskData.inputParas + ';task_FB=' + newTaskRef.key(),
                            function (error) {
                                if (error) {
                                    d.reject(error);
                                    console.log("Error:", error);
                                }
                                console.log('new Task' + newTaskRef.key());
                                newTaskRef.on("value", function (snap) {
                                    d.resolve(angular.toJson(snap.val()));
                                });
                            });
                    };
                    var newTaskRef = taskRef.push(taskData, onComplete);

                    return d.promise;
                }

//                var cb = opt.callback || function () {
//                };
//                var cb = function () {
//                };
//                var errorFn = function (err) {
//                    $timeout(function () {
//                        cb(err);
//                    });
//                };
                //promise process
//                promise
//                    .then(log4task(logRef, componentId))
////                  // success
//                    .then(function () {
//                        cb && cb(null)
//                    }, cb)
//                    .catch(errorFn);
                //function log4task(logRef, componentId) {
                //    var ref = logRef;
                //    var d = $q.defer();
                //    messageLog.action = componentId;
                //    ref.push(messageLog, function (error) {
                //        if (error) {
                //            d.reject(error);
                //        } else {
                //            d.resolve();
                //        }
                //    });
                //    return d.promise;
                //}
            }
        };
        return myTask;
    });
