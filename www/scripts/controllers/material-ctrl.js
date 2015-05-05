/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.controllers.material', [])
    //for message.html
    .controller('materialCtrl',
    function ($scope, $location, syncObject, ionicLoading) {

        var params = $location.search();
        console.log(params);
        var ref = $scope.ref = params.ref;
        var back_url = $scope.back_url = params.back_url;
        var title = $scope.title = params.title;
        $scope.goback = function () {
            $location.path('/message').search(back_url);
        };
        var syncObject = syncObject(ref);
        ionicLoading.load();
        syncObject.$loaded()
            .then(function (data) {
                $scope.data = data;
                console.log(data); // true
            })
            .then(ionicLoading.unload());

    });

