angular.module('myApp.controllers.messagesIndex', [])

    //for messages.html
    //purpose: read data from myComponent, and show components list and unread number.
    .controller('messagesIndexCtrl', function (firebaseRef,$scope, $state,$log, ionicLoading, myComponent) {
        var ctrlName = 'messagesCtrl';
        var ref1 = new Firebase('https://40288b8147cd16ce0147cd236df20000.firebaseio.com/users/simplelogin%3A41/messages/E0001');
        var ref= firebaseRef(['users','simplelogin:41/messages/E0001']);
        console.log(ref.toString());
        console.log(ref1.toString());
        var authData = ref.getAuth();
        if (authData) {
            console.log("Authenticated user with uid:", authData.uid);
        }
        ref.limitToFirst(2).on("child_added", function(snapshot) {
            console.log(ref.toString());
            console.log(snapshot.key());
        });
        $scope.$state = $state;
        $scope.components = myComponent.array;
        $scope.$on('$viewContentLoaded', function () {
            ionicLoading.load('Loading');
            $log.info(ctrlName, 'has loaded');
        });
        $scope.refresh=function(){
            console.log('$scope.refresh');
            $scope.$broadcast('scroll.refreshComplete');
        };
        $scope.$log = $log;

        $scope.components.$loaded().then(function () {
            $log.info(ctrlName, "Initial data received!");
            ionicLoading.unload();
        });

        $scope.$on('myComponent.update', function (event) {
            $scope.components.$loaded().then(function () {
                $log.info(ctrlName, "myComponent.update");
            });
        });

        $scope.$on('$destroy', function () {
//            ionicLoading.unload();
            $log.info(ctrlName, 'is no longer necessary');
        });
    });
