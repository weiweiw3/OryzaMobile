//**copy from firereader

(function (angular) {
    "use strict";
    var appServices = angular.module('myApp.services',
        ['firebase', 'firebase.utils', 'firebase.simpleLogin']);
    appServices.factory('myContact',
        function ($timeout, $q, $firebase, simpleLogin, $rootScope, syncData) {
            var currentUser = simpleLogin.user.uid;
            var myContactRef = syncData(['users', currentUser, 'contacts']);
            var PublicRef = syncData(['userList']);
            var sync = myContactRef.$asObject;
            var isContact = {};
            var myContacts = {
                ref: myContactRef,
                all: sync,
                findContact: function (contactId) {

                    myContactRef.once('value', function (snap) {

                        isContact = {
                            contactId: contactId,
                            isContact: snap.hasChild(contactId)
                        };

                        $rootScope.$broadcast('findContact.finish');
                    });
                },
                isContact: function (contactId) {
                    if (contactId === isContact.contactId) {
                        return isContact.isContact;
                    } else {
                        return 'error'
                    }
                },
                addContact: function (opt, contactId) {
                    var cb = opt.callback || function () {
                    };
                    var newContact;
                    var errorFn = function (err) {
                        $timeout(function () {
                            cb(err);
                        });
                    };
                    //promise process
                    isContact()
                        .then(findPublicContact)
                        .then(addIntoMyContacts)
                        // success
                        .then(function () {
                            cb && cb(null)
                        }, cb)
                        .catch(errorFn);
                    myContactRef.once('value', function (snap) {
                        if (snap.hasChild(contactId) !== true) {

                        }
                    }, function (err) {
                        // code to handle read error
                    });


                    function isContact() {//if existed, reject
                        var d = $q.defer();
                        myContactRef.once('value', function (snap) {
                            if (snap.hasChild(contactId) == true) {
                                d.reject();
                            } else {
                                d.resolve();
                            }
                        });
                        return d.promise;
                    }

                    function findPublicContact() {
                        var d = $q.defer();
                        PublicRef.child(contactId).once('value',
                            function (snap) {
                                newContact = snap.val();
                                console.log(contactId, newContact);
                                d.resolve();
                            },
                            function (err) {
                                console.log(err);
                                d.reject(err);
                            });
                        return d.promise;
                    }

                    function addIntoMyContacts() {
                        var d = $q.defer();
                        var ref = myContactRef.child(contactId);
                        var sync = $firebase(ref);
                        console.log(newContact);
                        sync.$set(newContact).then(function (ref) {
                                opt.pass(true);//set scope.pass as pass
                                d.resolve();
                            },
                            function (err) {
                                opt.pass(false);
                                d.reject(err);
                            });
                        return d.promise;
                    }
                }

            };
            return myContacts;
        });





    appServices.factory('disposeOnLogout', ['$rootScope', function ($rootScope) {
        var disposables = [];

        $rootScope.$on('authManager:beforeLogout', function () {
            angular.forEach(disposables, function (fn) {
                fn();
            });
            disposables = [];
        });

        return function (fnOrRef, event, callback) {
            var fn;
            if (arguments.length === 3) {
                fn = function () {
                    fnOrRef.off(event, callback);
                }
            }
            else if (angular.isObject(fnOrRef) && fnOrRef.hasOwnProperty('$off')) {
                fn = function () {
                    fnOrRef.$off();
                }
            }
            else {
                fn = fnOrRef;
            }
            disposables.push(fn);
            return fnOrRef;
        }
    }]);

})(angular);
