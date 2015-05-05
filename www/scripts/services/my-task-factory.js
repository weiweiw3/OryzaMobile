/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myTask',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])
    .factory('myTask',
    function ($rootScope, $q, syncArray, syncObject, $timeout, simpleLogin, myMessage, myUser) {
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
                return syncObject([taskDefaultRefStr, event, 'inputParas'])
                    ;
            },

            createTask: function (componentId, inputPStr, logId, nextAction, opt) {
                var self = this;
                var logRef = syncObject(['users', currentUser, 'log', componentId, logId]).$ref();
                var taskRef = syncObject(['tasks']).$ref();

                messageLog.action = nextAction;
                var cb = opt.callback || function () {
                };
                var errorFn = function (err) {
                    $timeout(function () {
                        cb(err);
                    });
                };

                //promise process
                var promise = addNewTask(taskRef, inputPStr, componentId, currentUser);
                promise
                    .then(log4task(logRef, componentId))
//                  // success
                    .then(function () {
                        cb && cb(null)
                    }, cb)
                    .catch(errorFn);


                function addNewTask(taskRef, inputP, componentId) {

                    var d = $q.defer();
                    var taskDataObj = syncObject([taskDefaultRefStr, componentId]);
                    var taskDataRef = taskDataObj.$ref();
                    var ServerUser = myUser.getServerUser();
                    var taskData;

                    taskDataRef.on("value", function (snap) {
                        taskData = snap.val();

                        ServerUser.$loaded().then(function (data) {
                            taskData.userId = data.$value;
                            taskData.inputParas = '';
                            var newTaskRef = taskRef.push(taskData, function (error) {
                                if (error) {
                                    d.reject(error);
                                    console.log("Error:", error);
                                }
                            });
                            inputP = inputP + '; task_FB=' + newTaskRef.key();
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
