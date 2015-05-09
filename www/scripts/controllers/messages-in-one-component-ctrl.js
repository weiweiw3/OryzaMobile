/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.controllers.messagesInOneComponent', [])
//for message-list.html
    //get message list with factory myMessage
    //update unread number with factory myComponent
    .controller('messagesInOneComponentCtrl', function
        (component, myComponent, myMessage, $location, $timeout, $scope, ionicLoading) {

        $scope.component = component;
        var componentId = component.$id;

        var messageId;
        $scope.$on('$viewContentLoaded', function () {
            ionicLoading.load('Loading');

        });
//        $scope.messages = myComponent.messagesArray(componentId);
//        $scope.messages.$loaded().then(function () {
//
//            ionicLoading.unload();
//        });
        myComponent.getmessageList(componentId);


        $scope.$on('messages.ready', function (event) {
            $scope.messages = myComponent.messagesArray(componentId);
        });

        $scope.$watch('messages', function (newVal) {
            if (angular.isUndefined(newVal) || newVal == null) {
                return
            }
            console.log($scope.messages);
            ionicLoading.unload();
        });


        $scope.goDetail = function (key, read, origin) {
            messageId = key;
            if (!read) {
                myMessage.markStatus(componentId, messageId, 'read', true)
            }
            if (componentId === 'E0002') {
                ionicLoading.load();
                if (origin) {
                    ionicLoading.unload();
                    navigate(componentId, messageId);
                }
                else {
                    console.log(messageId + 'has been deleted');
                    ionicLoading.unload();
                }
            }
            if (componentId === 'E0001') {

                navigate(componentId, messageId);
            }

        };
        function navigate(componentId, messageId) {
            console.log(componentId);
            if (componentId === 'E0001') {

                $location.path('/message').search({
                    'key': messageId,
                    'component': componentId
                });
            }
            if (componentId === 'E0002') {

                $location.path('/message').search({
                    'key': messageId,
                    'component': 'E0001',
                    'return': componentId
                });

            }
        }

        $scope.$on('read.update', function (event) {
            var read = myMessage.getStatus(componentId, messageId, 'read');
            myComponent.UnreadCountMinus(componentId);
            navigate(componentId, messageId);

        });
//        $scope.predicate = 'favorite';
//        $scope.order = function (predicate, reverse) {
//            $scope.messages = orderBy($scope.messages, 'favorite', reverse);
//        };
    })
    .controller('purchaseOrdersCtrl', function
        (purchaseOrders,purchaseOrderFactory,$state, myComponent, myMessage, $location, $timeout, $scope, ionicLoading) {

        $scope.$state = $state;
        console.log($state.current.name);

//        ionicLoading.load('Loading');
        var componentId = $state.current.name;

        var messageId;
        $scope.$on('$viewContentLoaded', function () {
//            console.log(purchaseOrders);
//            ionicLoading.load('Loading');

        });
        messages=$scope.messages=purchaseOrders;
        console.log(messages[messages.length - 1].po_NUMBER);
        $scope.refresh=function(){
            purchaseOrderFactory.refresh().then(function(){
                $scope.messages=purchaseOrderFactory.purchaseOrderArray;
            });
            console.log('$scope.refresh');

            $scope.$broadcast('scroll.refreshComplete');
        };
        $scope.loadMore = function() {
            purchaseOrderFactory.add($scope.messages.length+1).then(function(){
                $scope.messages=purchaseOrderFactory.purchaseOrderArray;
            });
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        $scope.$on('$stateChangeSuccess', function() {
            $scope.loadMore();
        });
//        console.log($scope.messages['4500017504']);
//        myComponent.getmessageList(componentId);
//        $scope.$on('messages.ready', function (event) {
//            $scope.messages = myComponent.messagesArray(componentId);
//        });
//
        $scope.$watch('messages', function (newVal) {
            if (angular.isUndefined(newVal) || newVal == null) {
                return
            }
            console.log($scope.messages);
            ionicLoading.unload();
        });


        $scope.goDetail = function (key, read, origin) {
            messageId = key;
            if (!read) {
                myMessage.markStatus(componentId, messageId, 'read', true)
            }
            if (componentId === 'E0002') {
                ionicLoading.load();
                if (origin) {
                    ionicLoading.unload();
                    navigate(componentId, messageId);
                }
                else {
                    console.log(messageId + 'has been deleted');
                    ionicLoading.unload();
                }
            }
            if (componentId === 'E0001') {

                navigate(componentId, messageId);
            }

        };
        function navigate(componentId, messageId) {
            console.log(componentId);
            if (componentId === 'E0001') {

                $location.path('/message').search({
                    'key': messageId,
                    'component': componentId
                });
            }
            if (componentId === 'E0002') {

                $location.path('/message').search({
                    'key': messageId,
                    'component': 'E0001',
                    'return': componentId
                });

            }
        }

        $scope.$on('read.update', function (event) {
            var read = myMessage.getStatus(componentId, messageId, 'read');
            myComponent.UnreadCountMinus(componentId);
            navigate(componentId, messageId);

        });
//        $scope.predicate = 'favorite';
//        $scope.order = function (predicate, reverse) {
//            $scope.messages = orderBy($scope.messages, 'favorite', reverse);
//        };
    });
