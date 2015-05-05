'use strict';

/* Directives */
angular.module('myApp.directives', [])
    .directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])

    .directive('addContact', function (simpleLogin,$rootScope, myContact, $q, $animate, ionicLoading) {

        var currentUser = simpleLogin.user.uid;

        return {
            restrict: "E",
            scope: {
                contactId: "="// Use @ for One Way Text Binding;Use = for Two Way Binding;Use & to Execute Functions in the Parent Scope
            },

            template: '<a class="button button-small button-outline button-positive" ' +
                'ng-show="ngShow" ng-click="addContact()">{{ btnText }}</a>',
            replace: true,
            link: function ($scope, element) {
                $scope.$watch('contactId', function (newVal) {
                    console.log(newVal);
                    if (angular.isUndefined(newVal) || newVal == null) {
                        $scope.ngShow = false;


                        return;
                    }
                    if (newVal !== currentUser) {
                        ionicLoading.load();
                        myContact.findContact(newVal);
                        //angular.toJson() number to string

                    }
                });
                $scope.$on('findContact.finish', function (event) {
                    var isContact = myContact.isContact($scope.contactId);

                    if (typeof isContact == "boolean" && $scope.contactId !== currentUser) {

                        $scope.ngShow = !isContact;
                        $scope.btnText = 'toAdd';
                        ionicLoading.unload();
                        console.log($scope.ngShow, $scope.btnText);
                    }
                });
                $scope.addContact = function () {
                    $scope.btnText = 'adding...';
                    ionicLoading.load();
                    myContact.addContact(buildParms(), $scope.contactId);
                };

                //change the button information after the contact is added
                $scope.$watch('pass', function (newVal) {
                    if (newVal == true) {
                        $scope.btnText = 'added';
                        $animate.setClass(element, 'button-balanced', 'button-positive');
                        ionicLoading.unload();
                    }
                });

                function buildParms() {
                    return {
                        pass: function (p) {
                            $scope.pass = p;
                        },
                        callback: function (err) {
                            if (err) {
                                $scope.err = err;
                            }
                            else {
                                $scope.msg = 'contact added!';
                            }
                        }
                    };
                }

            }
        }
            ;
    })



;