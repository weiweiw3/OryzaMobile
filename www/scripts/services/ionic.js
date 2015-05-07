"use strict";
angular.module('myApp.services.ionic', ['ionic'])
    .service('ionicLoading', function ($ionicLoading) {
        this.load = function (loadText) {
            loadText = loadText || 'Loading...';

            $ionicLoading.show({
                template: '<div ><ion-spinner icon="lines"></ion-spinner></div>' + loadText,
                noBackdrop: false
            });
        };
        this.unload = function () {
            $ionicLoading.hide();
        };

    });