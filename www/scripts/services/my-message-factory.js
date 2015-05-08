/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myMessage', ['firebase', 'firebase.utils', 'firebase.simpleLogin'])

    //functions:
    // 1, get message list with componentID
    // 2, get and update favorite
    .factory('myMessage_old', ['$rootScope', 'syncArray', 'syncObject', 'simpleLogin',
        function ($rootScope, syncArray, syncObject, simpleLogin) {
            var currentUser = simpleLogin.user.uid;
            var statusObj;
            var MessageRefStr = 'users/' + currentUser + '/messages';
            var myMessages = {

                getMessageMetadata: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, componentId, messageId, 'data/metadata']);
                },
                getMessageHeader: function (componentId, messageId) {
                    return  syncObject([MessageRefStr, componentId, messageId, 'data']);
                },
                getE0002Header: function (messageId) {
                    return  syncObject([MessageRefStr, 'E0002', messageId]);
                },
                getMessageHeaderArray: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, 'E0001', messageId, 'data']);
                },
                //startAtItems:1,limit: 5
                getMessageItems: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, 'E0001', messageId, 'items']);
                },

                //startAtItems:6
                getMessageMoreItems: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, 'E0001', messageId, 'moreItems']);
                },
                markStatus: function (componentId, messageId, status, statusValue) {
                    //statusValue is optionalArg
                    var statusStr;
                    statusValue = (typeof statusValue === "undefined")
                        ? "defaultValue" : statusValue;
                    if (componentId === 'E0001') {
                        statusStr = 'data/' + status;
                    } else {
                        statusStr = status;
                    }

                    var obj = syncObject([MessageRefStr, componentId, messageId, statusStr]);

                    if (statusValue === "defaultValue") {
                        // load statusValue from firebase
                        obj.$loaded().then(function (data) {
                            statusObj = {
                                componentId: componentId,
                                messageId: messageId,
                                status: status,
                                statusValue: data.$value
                            };
                            $rootScope.$broadcast(status + '.update');
                        });
                    } else {
                        //update statusValue in firebase
                        obj.$value = statusValue;
                        obj.$save().then(function () {
                            statusObj = {
                                componentId: componentId,
                                messageId: messageId,
                                status: status,
                                statusValue: statusValue
                            };
                            $rootScope.$broadcast(status + '.update');
                        });
                    }
                },
                getStatus: function (componentId, messageId, status) {
                    if (componentId === statusObj.componentId
                        && messageId === statusObj.messageId
                        && status === statusObj.status) {
                        return statusObj.statusValue;
                    } else {
                        return 'error'
                    }
                }

            };
            return myMessages;
        }])
    .factory('myMessage',
        function (firebaseRef, $rootScope, syncArray, syncObject, simpleLogin) {
            var currentUser = simpleLogin.user.uid;
            var statusObj;
            var MessageRefStr = 'users/' + currentUser + '/messages';
            var myMessages = {

                getMessageMetadata: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, componentId, messageId, 'data/metadata']);
                },
                getMessageHeader: function (componentId, messageId) {
                    return  syncObject([MessageRefStr, componentId, messageId, 'data']);
                },
                getE0002Header: function (messageId) {
                    return  syncObject([MessageRefStr, 'E0002', messageId]);
                },
                getMessageHeaderArray: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, 'E0001', messageId, 'data']);
                },
                purchaseOrderindexObject: function (messageId) {
                    console.log(messageId);
                    return  syncObject([MessageRefStr, 'E0001', messageId, 'data']);
                },
                //startAtItems:1,limit: 5
                getMessageItems: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, 'E0001', messageId, 'items']);
                },

                //startAtItems:6
                getMessageMoreItems: function (componentId, messageId) {
                    return  syncArray([MessageRefStr, 'E0001', messageId, 'moreItems']);
                },
                markStatus: function (componentId, messageId, status, statusValue) {
                    //statusValue is optionalArg
                    var statusStr;
                    statusValue = (typeof statusValue === "undefined")
                        ? "defaultValue" : statusValue;
                    if (componentId === 'E0001') {
                        statusStr = 'data/' + status;
                    } else {
                        statusStr = status;
                    }

                    var obj = syncObject([MessageRefStr, componentId, messageId, statusStr]);

                    if (statusValue === "defaultValue") {
                        // load statusValue from firebase
                        obj.$loaded().then(function (data) {
                            statusObj = {
                                componentId: componentId,
                                messageId: messageId,
                                status: status,
                                statusValue: data.$value
                            };
                            $rootScope.$broadcast(status + '.update');
                        });
                    } else {
                        //update statusValue in firebase
                        obj.$value = statusValue;
                        obj.$save().then(function () {
                            statusObj = {
                                componentId: componentId,
                                messageId: messageId,
                                status: status,
                                statusValue: statusValue
                            };
                            $rootScope.$broadcast(status + '.update');
                        });
                    }
                },
                getStatus: function (componentId, messageId, status) {
                    if (componentId === statusObj.componentId
                        && messageId === statusObj.messageId
                        && status === statusObj.status) {
                        return statusObj.statusValue;
                    } else {
                        return 'error'
                    }
                }

            };
            return myMessages;
        });

