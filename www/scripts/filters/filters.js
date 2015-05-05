'use strict';

/* Filters */

angular.module('myApp.filters', [])
    .filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }])
    .filter('messageCountFilter', function () {
        return function (items) {
            var arrayToReturn = [];
            var keys = items.$getIndex();
            keys.forEach(function (key, i) {
                if (items[key].messageCount > 0) {
                    arrayToReturn.push(items[key]);
//                    console.log(i, items[key]); // Prints items in order they appear in Firebase.
                }
            });

            return arrayToReturn;
        };
    })
    .filter('unreadCountFilter', function () {
        return function (items) {
            var arrayToReturn = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].unreadCount > 1) {
                    arrayToReturn.push(items[i]);
                }
            }

            return arrayToReturn;
        };
    });
