/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myTask',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])
    .factory('myTask',
    function (firebaseRef, $rootScope, $q, syncArray, syncObject, $timeout, simpleLogin) {
        var currentUser = simpleLogin.user.uid;
        var date = Date.now();
        var messageLog = {
            action: '',
            user: currentUser,
            date: date
        };
        var taskDefaultRefStr = 'CompanySetting/EventDefaltValues';
        var createTask;
        createTask = {
            getInputP: function (event) {
                return syncObject([taskDefaultRefStr, event, 'inputParas']);
            },

            createTask: function (componentId, ServerUser, inputPStr, logId, nextAction, opt) {

                var logRef = firebaseRef(['users', currentUser, 'log', componentId, logId]);
                var taskRef = firebaseRef(['tasks']);
                messageLog.action = nextAction;
//                var cb = opt.callback || function () {
//                };
                var cb = function () {};
                var errorFn = function (err) {
                    $timeout(function () {
                        cb(err);
                    });
                };
                //promise process
                var promise = addNewTask(taskRef, inputPStr, componentId, ServerUser);
                promise
                    .then(log4task(logRef, componentId))
//                  // success
                    .then(function () {
                        cb && cb(null)
                    }, cb)
                    .catch(errorFn);

                function addNewTask(taskRef, inputP, componentId, ServerUser) {
                    var d = $q.defer();
                    console.log(taskDefaultRefStr);
                    firebaseRef([taskDefaultRefStr, componentId])
                        .on("value", function (snap) {
                            var taskData = snap.val();
                            taskData.userId = ServerUser;
                            taskData.inputParas = '';
                            var newTaskRef = taskRef.push(taskData, function (error) {
                                if (error) {
                                    d.reject(error);
                                    console.log("Error:", error);
                                }
                            });
                            inputP = inputP + ';task_FB=' + newTaskRef.key();
                            newTaskRef.child('inputParas').set(inputP, function (error) {
                                if (error) {
                                    d.reject(error);
                                    console.log("Error:", error);
                                } else {
                                    console.log('new Task' + newTaskRef.key());
                                    d.resolve();
                                }
                            });
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
            }
        };
        return createTask;
    });
