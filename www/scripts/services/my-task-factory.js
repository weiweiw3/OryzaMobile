/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myTask',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])
    .factory('myTask',
    function ($http, $q, ApiEndpoint, firebaseRef, $rootScope, syncArray, syncObject, $timeout, simpleLogin,config) {
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
                function httpRequestHandler (method,url,data,timeoutNum) {
                    var timeout = $q.defer(),
                        result = $q.defer(),
                        timedOut = false,
                        httpRequest;

                    setTimeout(function () {
                        timedOut = true;
                        timeout.resolve();
                    }, (1000 * timeoutNum));

                    httpRequest = $http({
                        method : method,
                        url: url,
                        data: data,
                        cache: false,
                        timeout: timeout.promise
                    });

                    httpRequest.success(function(data, status, headers, config) {
                        result.resolve(data);
                    });

                    httpRequest.error(function(data, status, headers, config) {
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
                    var httpRequest = httpRequestHandler('POST',ApiEndpoint.url + '/createTask',data,3);
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
