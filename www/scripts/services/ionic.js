"use strict";
angular.module('myApp.services.ionic', ['ionic'])
    .service('ionicLoading', function ($ionicLoading) {
        this.load = function (loadText) {
            loadText = loadText || 'Loading...';

            $ionicLoading.show({
                template: '<i class="icon ion-loading-c"></i>\n<br/>\n' + loadText,
                noBackdrop: false
            });
        };
        this.unload = function () {
            $ionicLoading.hide();
        };
    });