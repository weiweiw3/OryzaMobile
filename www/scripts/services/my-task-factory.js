/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myTask',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])
    .factory('myTask',
    function ($http, $q, ApiEndpoint, firebaseRef, $rootScope, syncArray, syncObject, $timeout, simpleLogin, config, fbutil, $q) {
        var currentUser = simpleLogin.user.uid;
        var date = Date.now();
        var messageLog = {
            action: '',
            user: currentUser,
            date: date
        };
        var taskDefaultRefStr = 'CompanySetting/EventDefaltValues';
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
            getInputP: function (event) {
                return syncObject([taskDefaultRefStr, event, 'inputParas']);
            },
            getjsonContent: function (event) {
                var d = $q.defer();
                fbutil.ref([taskDefaultRefStr, event, 'jsonContent']).once('value', function (snapshot) {
                    d.resolve(snapshot.exportVal());
                }, function (err) {
                    d.reject(err);
                });
                return d.promise;
            },
            taskInformationCombine: function (event, defaultData, inputParasRef,jsonContent) {
                //data.inputParas
                //data.jsonContent
                var taskData = defaultData;
                if (typeof defaultData.jsonContent === 'object') {
                    taskData.jsonContent = defaultData.jsonContent;
                    if (event === 'E0025') {
                        taskData.jsonContent.CATSRECORDS[0].COUNTER = jsonContent;
                    }

                }
                if (typeof defaultData.inputParas === 'string') {

                    //var d = $q.defer();
                    var array = inputParasRef.toString().split("/");
                    var inputParas = defaultData.inputParas;
                    if (event === 'E0005') {
                        //E0004->E0005
                        inputParas = inputParas.replace('$P01$', array[6].substr(3));//PO_REL_CODE
                        // TODO replace P02 twice , in the furture use replace-all function
                        inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEREQUEST
                        inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEREQUEST
                        inputParas = inputParas.replace('$P03$', array[9]);//ITEM
                        inputParas = inputParas.replace('$P03$', array[9]);//ITEM
                        inputParas = inputParas.replace('$P04$', array[5]);//ServerUserID
                        inputParas = inputParas + ';FB_FROM_PATH=' + ref.toString().replace(ref.root().toString(), '');
                    }

                    if (event === 'E0002') {
                        //E0001->E0002
                        inputParas = inputParas.replace('$P01$', array[6].substr(3));//PO_REL_CODE
                        inputParas = inputParas.replace('$P01$', array[6].substr(3));//PO_REL_CODE
                        //TODO replace P02 twice , in the furture use replace-all function
                        inputParas = inputParas.replace('$P02$', array[8]);//PURCHASEORDER
                        inputParas = inputParas.replace('$P02$', res[8]);//PURCHASEORDER
                        inputParas = inputParas.replace('$P03$', res[5]);//ServerUserID
                        inputParas = inputParas + ';FB_FROM_PATH=' + ref.toString().replace(ref.root().toString(), '');
                    }
                    taskData.inputParas = inputParas;
                    return taskData;
                }
            },
            createTask: function (event, ServerUser, inputParasRef, logId, nextAction, jsonContent) {

                var taskRef = firebaseRef(['tasks']);
                messageLog.action = nextAction;

                myTask.getTaskDefaultValue(event).then(function(defaultData){
                    console.log(inputParasRef.toString());
                    var dd=myTask.taskInformationCombine(event, defaultData, inputParasRef,jsonContent);
                    console.log(dd);
                });


                return taskNodeAdd(taskRef, inputParasRef, event, ServerUser, jsonContent)
                    .then(function (data) {
                        console.log(data);
                        return postTask(data);
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


                function taskNodeAdd(taskRef, inputPStr, event, ServerUser, jsonContent) {
                    var d = $q.defer();
                    firebaseRef([taskDefaultRefStr, event])
                        .once("value", function (snap) {
                            var taskData = snap.val();
                            taskData.userId = ServerUser;
                            if (typeof jsonContent === 'object') {
                                taskData.jsonContent = jsonContent;
                            }
                            taskData.inputParas = '';
                            //push完新task后，把新生成的key也存下来。
                            var onComplete = function () {
                                inputPStr = inputPStr + ';task_FB=' + newTaskRef.key();
                                newTaskRef.child('inputParas').set(inputPStr, function (error) {
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
                        });
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
