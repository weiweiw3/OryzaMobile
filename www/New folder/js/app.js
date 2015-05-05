// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'ngCordova',
  'ionic.service.core',
  'ionic.service.push',
  'ionic.service.deploy',
  'ionic.service.analytics',
  'starter.controllers'
])

.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: 'a04798c7',
    // The public API key all services will use for this app
    api_key: '366d39f7b1ac4d8ebec00a989e44f7380483e53580fc350e71e35b03b0615825bdc6f813bb85b5d6e6f2e35fcd12e548',
    // The write key your app will use for analytics
    api_write_key: '5f6e17f6815844344b1d843ab9c4c1513ce379a8fa0ab2f329311f2646411c786e6ad5fd08b138cc3135b90c676b1f414090a1f494d2e67b7ef5c721cd58af597a826f07c3aa17b7f77a207bf852250b80cba251720bcc13b9a08581e0ac7ee12b8326c7457db36a30e61e075dea915001e0ce559d8635c41c16777967e935f39996b6cc067e467eeaeba0744d1bc5e9',
    // The GCM project ID (project number) from your Google Developer Console (un-comment if used)
    // gcm_id: '466583810362'
  });
}])

.run(function($rootScope, $ionicDeploy, $ionicPlatform, $cordovaStatusbar) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    // Color the iOS status bar text to white
    if (window.StatusBar) {
      $cordovaStatusbar.overlaysWebView(true);
      $cordovaStatusBar.style(1); //Light
    }

    // Default update checking
    $rootScope.updateOptions = {
      interval: 2 * 60 * 1000
    };

    // Watch Ionic Deploy service for new code
    $ionicDeploy.watch($rootScope.updateOptions).then(function() {}, function() {}, function(hasUpdate) {
      $rootScope.lastChecked = new Date();
      console.log('WATCH RESULT', hasUpdate);
    });
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  // Welcome tab
  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  // Ionic User tab
  .state('tab.user', {
    url: '/user',
    views: {
      'tab-user': {
        templateUrl: 'templates/tab-user.html',
        controller: 'UserCtrl'
      }
    }
  })

  // Ionic Push tab
  .state('tab.push', {
    url: '/push',
    views: {
      'tab-push': {
        templateUrl: 'templates/tab-push.html',
        controller: 'PushCtrl'
      }
    }
  })

  // Ionic Deploy tab
  .state('tab.deploy', {
    url: '/deploy',
    views: {
      'tab-deploy': {
        templateUrl: 'templates/tab-deploy.html',
        controller: 'DeployCtrl'
      }
    }
  })

  // Ionic Analytics tab
  .state('tab.analytics', {
    url: '/analytics',
    views: {
      'tab-analytics': {
        templateUrl: 'templates/tab-analytics.html',
        controller: 'AnalyticsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
