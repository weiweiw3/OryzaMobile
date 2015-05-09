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
    function (currentUser, firebaseRef, $rootScope, syncArray, syncObject, simpleLogin, $q) {

        var currentUser1 = simpleLogin.user.uid;
        var purchaseOrderListRef;
        var statusObj;
        var purchaseOrderArray = new Array();
        var MessageRefStr = 'users/' + currentUser1 + '/messages';
        var myMessages = {
            getPurchaseOrderList: function () {
                return currentUser.getUser().then(function (user) {
                    purchaseOrderListRef = firebaseRef(['Event/E0001', user, '02_PU/PO_HEADERS']).orderByKey().startAt('4500017504')
                        .limitToFirst(3);
                    return purchaseOrderListRef

                });
            },
            purchaseOrderArray: purchaseOrderArray,
            purchaseOrderList: function () {
                return purchaseOrderListRef.on("child_added", function (snapshot) {
                    console.log(snapshot.key());
                    purchaseOrderArray[snapshot.key()] = snapshot.val();
                    console.log(purchaseOrderArray);
                });
            },
            purchaseOrderList: $q.all({
//                    purchaseOrderList
            }),
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
    })
    .factory('purchaseOrderFactory',
    function (currentUser, firebaseRef, $rootScope, syncArray, syncObject, $q) {
        var purchaseOrderFactory = {};
//        var purchaseOrderListRef;


                purchaseOrderFactory.purchaseOrderArray = [];
//        purchaseOrderFactory.purchaseOrderListAdd= function(){
////            var purchaseOrders =new Array();
//             currentUser.getUser().then(function(user){
//                purchaseOrderListRef = firebaseRef(['Event',xx,user,'02_PU/PO_HEADERS'])
//                    .orderByKey().startAt(oo)
//                    .limitToFirst(3).on("child_added", function(snapshot) {
//                        purchaseOrderFactory.purchaseOrderArray.push(snapshot.val());
////                        purchaseOrderFactory.purchaseOrderArray[snapshot.key()]=snapshot.val();
//                    });
//            });
//            return $q.all(purchaseOrderFactory.purchaseOrderListAdd);
//        };
        purchaseOrderFactory.add = function (xx) {
            var promises = [];
            var deffered = $q.defer();
            purchaseOrderFactory.purchaseOrderArray = [];
            currentUser.getUser().then(function (user) {
                purchaseOrderListRef = firebaseRef(['Event', purchaseOrderFactory.component, user,
                purchaseOrderFactory.rel_grp, 'PO_HEADERS'])
//                    .orderByKey().startAt(xx)
                    .limitToFirst(xx).on("child_added", function (snapshot) {
                        purchaseOrderFactory.purchaseOrderArray.push(snapshot.val());
                        deffered.resolve(snapshot.val());
                    });
            });
            promises.push(deffered.promise);
            return $q.all(promises);
        };
        purchaseOrderFactory.refresh = function () {
            var promises = [];
            var deffered = $q.defer();
            purchaseOrderFactory.purchaseOrderArray = [];
            currentUser.getUser().then(function (user) {
                purchaseOrderListRef = firebaseRef(['Event', purchaseOrderFactory.component, user,
                    purchaseOrderFactory.rel_grp, 'PO_HEADERS'])
//                    .orderByKey().startAt(xx)
                    .limitToFirst(3).on("child_added", function (snapshot) {
                        purchaseOrderFactory.purchaseOrderArray.push(snapshot.val());
                        deffered.resolve(snapshot.val());
                    });
            });
            promises.push(deffered.promise);
            return $q.all(promises);
        };
        purchaseOrderFactory.ready = function (component, rel_grp) {
            var promises = [];
            var deffered = $q.defer();
            purchaseOrderFactory.component=component;
            purchaseOrderFactory.rel_grp=rel_grp;
            purchaseOrderFactory.purchaseOrderArray = [];
            currentUser.getUser().then(function (user) {
                purchaseOrderListRef = firebaseRef(['Event', component, user, rel_grp, 'PO_HEADERS'])
                    .limitToFirst(3).on("child_added", function (snapshot) {
                        purchaseOrderFactory.purchaseOrderArray.push(snapshot.val());
                        deffered.resolve(snapshot.val());
                    });
            });
            promises.push(deffered.promise);
            return $q.all(promises);
        };
        return purchaseOrderFactory
    });

