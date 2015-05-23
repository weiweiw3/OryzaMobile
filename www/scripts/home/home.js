(function (angular) {
    "use strict";

    var app = angular.module('myApp.home', [ 'ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);
    app.controller('homeCtrl', function (localStorageService,$q, $localstorage, fbutil, homeFactory, purchaseOrderFactory,
                                         currentUser, simpleLogin, firebaseRef, $scope, $state, $log, ionicLoading) {

//        ionicLoading.load();
        var E0001 = localStorageService.get('E0001');
        if (typeof E0001 !== 'undefined' && E0001 !== null) {
            console.log(E0001);
            $scope.E0001 = E0001;
        } else {
            homeFactory.ready('E0001').then(function (data) {
                $scope.E0001 = data;
                localStorageService.set('E0001', $scope.E0001);
            });
        }
        var E0002 = localStorageService.get('E0002');
        if (typeof E0002 !== 'undefined' && E0002 !== null) {
            $scope.E0002 = E0002;
        } else {
            homeFactory.ready('E0002').then(function (data) {
                $scope.E0002 = data;
                localStorageService.set('E0002', $scope.E0002);
            });
        }
        $scope.$state = $state;

        $scope.$on('$viewContentLoaded', function () {
//            ionicLoading.load('Loading');
            $log.info('has loaded');
        });
        $scope.refresh = function () {
            homeFactory.ready('E0001').then(function (data) {
                $scope.E0001 = data;
                localStorageService.set('E0001', $scope.E0001);
            });
            homeFactory.ready('E0002').then(function (data) {
                $scope.E0002 = data;
                localStorageService.set('E0002', $scope.E0002);
            });
            console.log('$scope.refresh');
            $scope.$broadcast('scroll.refreshComplete');
        };
        $scope.$log = $log;



        $scope.$on('$destroy', function () {
//            ionicLoading.unload();
            $log.info('is no longer necessary');
        });
    });

    app.factory('homeFactory',
        function ($rootScope,currentUser, $firebaseObject, fbutil, $q) {
            var homeFactory = {};
            homeFactory.ready = function (event) {
                console.log(event);
                var promises = [];
                var deffered = $q.defer();
                currentUser.getUser().then(function (user) {
                    console.log(user);
                    $rootScope.serverUser=user;
                    fbutil.ref(['Event', event])
                        .startAt(user)
                        .endAt(user)
                        .once('value', function (snap) {
                            snap.child(user).ref().once('value', function (snap) {
                                var Array = [];
                                snap.forEach(function (childSnapshot) {
                                    Array.push({
                                        "name": childSnapshot.key(),
                                        "url": childSnapshot.ref().toString().replace(childSnapshot.ref().root().toString(), '')
                                    });
                                });
                                var node = {
                                    "name": event,
                                    "show": true,
                                    "url": snap.ref().toString().replace(snap.ref().root().toString(), ''),
                                    "array": Array
                                };
                                console.log(node);
                                deffered.resolve(node);
                            });
                        });
                });
                promises.push(deffered.promise);
                return $q.all(promises);
            };

            return  homeFactory;
        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('tab.messages', {
                url: '/messages',
                views: {
                    'messages-tab': {
                        templateUrl: 'scripts/home/home.html',
                        controller: 'homeCtrl'
                    }},
                resolve: {
                    // controller will not be loaded until $requireAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    "currentAuth": ["simpleLogin",
                        function (simpleLogin) {
                            // $requireAuth returns a promise so the resolve waits for it to complete
                            // If the promise is rejected, it will throw a $stateChangeError (see above)
                            return simpleLogin.auth.$requireAuth();
                        }]
                }
            });
    }]);
})(angular);