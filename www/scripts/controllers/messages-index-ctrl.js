angular.module('myApp.controllers.messagesIndex', [])

    //for messages.html
    //purpose: read data from myComponent, and show components list and unread number.
    .controller('messagesIndexCtrl', function (purchaseOrderFactory,CC,currentUser,simpleLogin,
                                               firebaseRef,$scope, $state,$log, ionicLoading, myComponent) {
//        purchaseOrderFactory.purchaseOrderList('E0001').then(function () {
//                console.log(purchaseOrderFactory.purchaseOrderArray);
//                return purchaseOrderFactory.purchaseOrderArray
//            }
//        );
        purchaseOrderFactory.ready('E0001','02_PU')
            .then(function () {
//                                ionicLoading.unload();
                return purchaseOrderFactory.purchaseOrderArray
            }
        );

        var ctrlName = 'messagesCtrl';
        var ref= firebaseRef(['users','simplelogin:41/messages/E0001/header']);
//        var currentUser = simpleLogin.user.uid;
//        var x1=currentUser;
        currentUser.getUser().then(function(data){
//            console.log(data);
        });
        CC.getC().then(function(ref){
//            console.log(ref.toString());
            ref.orderByKey().startAt('4500017504').limitToFirst(3).on("child_added", function(snapshot) {
//                console.log(snapshot.ref().toString());
//                console.log(snapshot.key());
            });
        });
        var ref1=firebaseRef(['UserList']);
        ref1.orderByChild('FBUser')
            .startAt('simplelogin:42')
            .endAt('simplelogin:42')
            .once('value', function(snap) {
                console.log('accounts matching email address', snap.val())
            });

        var authData = ref.getAuth();
        if (authData) {
            console.log("Authenticated user with uid:", authData.uid);
        }

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
