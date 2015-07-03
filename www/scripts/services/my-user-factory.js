/**
 * Created by C5155394 on 2015/3/5.
 */
angular.module('myApp.services.myUser',
    [])
    .factory('myUser',
    function ($rootScope, $q, syncArray,syncObject, $timeout, simpleLogin) {
        var currentUser = simpleLogin.user.uid;
        var SAPSystemRefStr='CompanySetting/sap_system/sap_system_guid_default';
        var taskDefaultRefStr = 'CompanySetting/language';
        var userMapping;
        userMapping = {
            getLanguage: function () {
                return syncArray([taskDefaultRefStr])
                    ;
            },
            getServerUser: function () {
                return syncObject(['users', currentUser, 'setting/mapping/ServerUser']);
            },
            getSAPSys: function(){
                return syncArray([SAPSystemRefStr]);
            },
            getSAPUser: function () {
                return syncObject(['users', currentUser, 'setting/mapping/SAPUser'])
                    ;
            },
            markStatus: function (status, statusValue) {
                //statusValue is optionalArg
                var statusStr;
                statusValue = (typeof statusValue === "undefined")
                    ? "defaultValue" : statusValue;


                var obj = syncObject(['users', currentUser, 'setting/mapping/SAPUser', status]);

                if (statusValue === "defaultValue") {
                    // load statusValue from firebase
                    obj.$loaded().then(function (data) {
                        statusObj = {
                            status: status,
                            statusValue: data.$value
                        };
                    });
                } else {
                    //update statusValue in firebase
                    obj.$value = statusValue;
                    obj.$save().then(function () {
                        statusObj = {
                            status: status,
                            statusValue: statusValue
                        };
                    });
                }
                $rootScope.$broadcast('SAPvalidation.'+status);
            },
            getStatus: function (status) {
                if (status === statusObj.status) {
                    return statusObj.statusValue;
                } else {
                    return 'error'
                }
            }
        };
        return  userMapping;
    });