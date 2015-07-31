
/**
 * Wraps ng-cloak so that, instead of simply waiting for Angular to compile, it waits until
 * Auth resolves with the remote Firebase services.
 *
 * <code>
 *    <div ng-cloak>Authentication has resolved.</div>
 * </code>
 */
angular.module('myApp')
  .config(['$provide', function($provide) {
    // adapt ng-cloak to wait for auth before it does its magic
    $provide.decorator('ngCloakDirective', ['$delegate', 'Auth','fbutil','$firebaseObject','$rootScope',
      function($delegate, Auth,fbutil,$firebaseObject,$rootScope) {
        var directive = $delegate[0];
        // make a copy of the old directive
        var _compile = directive.compile;
        directive.compile = function(element, attr) {
          Auth.$waitForAuth().then(function() {


              Auth.$onAuth(function (authData) {
                  //$rootScope.loggedIn = !!authData;
                  if (authData) {

                      var ref = fbutil.ref(['profiles', authData.uid]);

                      $firebaseObject(ref)
                          .$bindTo($rootScope, 'profiles').then(function () {

                              if(typeof $rootScope.profiles['SAPUser'] ==="undefined"){$location.path('/addSAPUser');}

                              $rootScope.serverUser=$rootScope.profiles.serverUser;

                              $rootScope.$broadcast('rootScopeInit',true);

                          }
                      );

                  }
              });




            // after auth, run the original ng-cloak directive
            _compile.call(directive, element, attr);
          });
        };
        // return the modified directive
        return $delegate;
      }]);
  }]);