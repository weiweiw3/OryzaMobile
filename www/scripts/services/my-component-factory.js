/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myComponent',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])

    //get component information, and update unread number
    //ref sample: users/simplelogin%3A33/components/E0001
    .factory('myComponent', function (firebaseRef,$rootScope,
                                      syncArray,syncObject, simpleLogin, myMessage) {
            var currentUser = simpleLogin.user.uid;
            var syncedArray = syncArray(['users', currentUser, 'components']);
            var syncedObject = syncObject(['users', currentUser, 'components']);
            var ref = syncedObject.$ref();
            var unreadCountRefStr = 'users/' + currentUser + '/components/$componentId$/unreadCount';
            var componentRefStr =  'users/' + currentUser + '/components';
            syncedObject.$watch(function (event) {
                $rootScope.$broadcast('myComponent.update');
            });
            var messagesArray= new Array();
            var myComponent = {
                all: ref,
                array: syncedArray,
                object: syncedObject,
                getmessageList:function(componentId){
                    //TODO get more messages
                    var messageListRef = syncObject([componentRefStr, componentId,'messages']);
                    var numChildren;
                    var i=0;
                    messageListRef.$ref().once('value',function(snap){
                        numChildren= snap.numChildren();
                        messagesArray= new Array();
                        snap.forEach(function(childsnap) {
                                var messageId =childsnap.key();
                                var messageDate=childsnap.val();
                                var messageData;
                                if(componentId==='E0001'){
                                     messageData = myMessage.getMessageHeader(componentId,messageId);
                                }
                                if(componentId==='E0002'){
                                     messageData = myMessage.getE0002Header(messageId);
                                }
                                messageData.$loaded().then(function(snapdata){
                                    i++;
                                    messagesArray.push(snapdata);
                                    if(i==numChildren){
                                        $rootScope.$broadcast('messages.ready');
                                    }
//                                    messageData.$destroy();
                               });
                            });
                    });
                },
                getComponent: function(index){
                    return syncedArray[index]
                },

                messagesArray: function(){
                    return messagesArray;
                },
                UnreadCountMinus: function (componentId) {
                    unreadCountRefStr = unreadCountRefStr.replace('$componentId$', componentId);
                    var ref = syncObject(unreadCountRefStr);
                    ref.$ref().transaction(function (currentCount) {
                        if (!currentCount) return 1;   // Initial value for counter.
                        if (currentCount < 0) return;  // Return undefined to abort transaction.
                        return currentCount - 1;             // Increment the count by 1.
                    });
                }
            };
            return myComponent;
        });