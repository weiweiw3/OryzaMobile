/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myTask',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])
    .factory('myTask',
    function ($http, $q, ApiEndpoint, firebaseRef, $rootScope, syncArray, syncObject, $timeout, simpleLogin) {
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
            getInputP: function (event) {
                return syncObject([taskDefaultRefStr, event, 'inputParas']);
            },

            createTask: function (componentId, ServerUser, inputPStr, logId, nextAction, opt) {

                var logRef = firebaseRef(['users', currentUser, 'log', componentId, logId]);
                var taskRef = firebaseRef(['tasks']);
                messageLog.action = nextAction;
//                var cb = opt.callback || function () {
//                };
                var cb = function () {
                };
                var errorFn = function (err) {
                    $timeout(function () {
                        cb(err);
                    });
                };
                //promise process
//                promise
//                    .then(log4task(logRef, componentId))
////                  // success
//                    .then(function () {
//                        cb && cb(null)
//                    }, cb)
//                    .catch(errorFn);
                function postTask(data) {
                    console.log('Success!', data);
                    var d = $q.defer();
                    var headers = {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    };
                    $http({
                        method: "POST",
                        headers: headers,
                        url: ApiEndpoint.url + '/createTask',
//                        url: 'http://114.215.185.243:8080/data-app/rs/task/createTask',
                        data: data
//                        data: {"category": 0, "companyId": "40288b8147cd16ce0147cd236df20000", "eventType": "E0002", "inputParas": "PO_REL_CODE=PU;PURCHASEORDER=4500017437;FIRST_LOAD=X;FB_PUSH=X;FB_PATH=Event/E0002/100001/4500017437;FB_FROM_PATH=Event/E0001/100001/02_PU/PO_HEADERS/4500017437;SAP_SYSTEM=sap_system_guid_default;task_FB=-Jp6ZiCfhd1HpRmNuDPx", "taskPriority": 0, "taskStatus": 0, "triggerTime": "immediate", "userId": "100001"}
                    }).success(function (jsonObj) {
//                        if (typeof jsonObj == 'object' && jsonObj instanceof Array) {
//                            console.log(jsonObj);
//                            d.resolve(angular.toJson(snap.val()));
//                        }
                        d.resolve(jsonObj);
                    }).error(function (data, status, headers, config) {
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                        console.log(config);
                        d.reject(data);
                    });
                    return d.promise;
                }

                function addNewTask(taskRef, inputP, componentId, ServerUser) {
                    var d = $q.defer();
                    console.log(taskDefaultRefStr);
                    firebaseRef([taskDefaultRefStr, componentId])
                        .on("value", function (snap) {
                            var taskData = snap.val();
                            taskData.userId = ServerUser;
                            taskData.inputParas = '';
                            //push完新task后，把新生成的key也存下来。
                            var onComplete = function () {
                                inputP = inputP + ';task_FB=' + newTaskRef.key();
                                newTaskRef.child('inputParas').set(inputP, function (error) {
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

                function log4task(logRef, componentId) {
                    var ref = logRef;
                    var d = $q.defer();
                    messageLog.action = componentId;
                    ref.push(messageLog, function (error) {
                        if (error) {
                            d.reject(error);
                        } else {
                            d.resolve();
                        }
                    });
                    return d.promise;
                }

                return addNewTask(taskRef, inputPStr, componentId, ServerUser)
                    .then(function (data) {
                        return postTask(data);
                    });
            }
        };
        return myTask;
    });
