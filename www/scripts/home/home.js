(function (angular) {
    "use strict";

    var app = angular.module('myApp.home', ['ionic', 'firebase.simpleLogin',
        'firebase.utils', 'firebase']);
    app.controller('homeCtrl', function (localStorageService, $q, $localstorage, fbutil, homeFactory, purchaseOrderFactory,
                                         simpleLogin, firebaseRef, $scope, $state, $log, ionicLoading) {

//        ionicLoading.load();
        function scopeInit() {
            var events = ['E0001', 'E0002', 'E0004', 'E0005'];
            angular.forEach(events, function (event) {

                    var str = localStorageService.get(event);
                    //var model = $parse(event);
                    //// Assigns a value to it
                    //model.assign($scope, 42);
                    //
                    //// Apply it to the scope
                    //$scope.$apply();
                    if (typeof  str !== 'undefined'
                        && str !== null) {
                        //console.log(str);
                        $scope[event] = str;
                    } else {
                        homeFactory.ready(event).then(function (data) {
                            console.log(data);
                            $scope[event] = data;
                            localStorageService.set(event, $scope[event]);
                        });
                    }
                    //console.log($scope.$eval(event));
                }
            );
        }

        scopeInit();

        $scope.$state = $state;

        $scope.$on('$viewContentLoaded', function () {
//            ionicLoading.load('Loading');
            $log.info('has loaded');
        });
        $scope.refresh = function () {
            scopeInit();

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
        function ($rootScope, currentUser, $firebaseObject, fbutil, $q) {
            var homeFactory = {};
            homeFactory.ready = function (event) {
                console.log(event);
                var promises = [];
                var deffered = $q.defer();
                //var user=$rootScope.currentUser;
                //console.log(user);
                currentUser.getUser().then(function (user) {
                    console.log(user+' '+event);
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
                                if(Array.length===0){node.show=false}
                                console.log(node);
                                deffered.resolve(node);
                            });
                        });
                });


                promises.push(deffered.promise);
                return $q.all(promises);
            };

            return homeFactory;
        });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('tab.messages', {
                url: '/messages',
                views: {
                    'messages-tab': {
                        templateUrl: 'scripts/home/home.html',
                        controller: 'homeCtrl'
                    }
                },
                //cache: false,

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