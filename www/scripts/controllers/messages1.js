angular.module('myApp.controllers.messages1', [])
    .controller('componentManagementCtrl', function
        ($scope, $log, ionicLoading, myComponent, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('my-popover1.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
        // Execute action on hide popover
        $scope.$on('popover.hidden', function () {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function () {
            // Execute action
        });
    })


    .controller("SampleCtrl", ["$scope", "$timeout", function ($scope, $timeout) {
        // create a Firebase reference
        var ref = new $window.Firebase("https://<your-firebase>.firebaseio.com/foo");
        // read data from Firebase into a local scope variable
        ref.on("value", function (snap) {
            // Since this event will occur outside Angular's $apply scope, we need to notify Angular
            // each time there is an update. This can be done using $scope.$apply or $timeout. We
            // prefer to use $timeout as it a) does not throw errors and b) ensures all levels of the
            // scope hierarchy are refreshed (necessary for some directives to see the changes)
            $timeout(function () {
                $scope.data = snap.val();
            });
        });
    }]);
