/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.directives.favoriteMessage', [])
    .directive('favoriteMessage', function ($rootScope, myMessage, $animate, ionicLoading) {
        return {
            restrict: "EA",
            scope: {
                component: "=",
                messageId: "="
            },
            replace: true,
            link: function ($scope, element, attrs) {
                var favorite = false;
                $scope.$watch('messageId', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    myMessage.markStatus($scope.component,$scope.messageId, 'favorite');
                });
                $scope.$on('favorite.update', function (event) {

                    favorite = myMessage.getStatus($scope.component,$scope.messageId, 'favorite');

                    if (typeof favorite == "boolean") {
                        ionicLoading.unload();
                        $scope.favorite = favorite;
                        toggleFavorite($scope.favorite);
                    }

                });
                function toggleFavorite(isFavorite) {
                    if (isFavorite) {
                        $animate.setClass(element, 'ion-star', 'ion-ios7-star-outline');
                    } else {
                        $animate.setClass(element, 'ion-ios7-star-outline', 'ion-star');
                    }
                }

                element.on('click', function () {
                    favorite = !favorite;
                    ionicLoading.load();
                    myMessage.markStatus($scope.component,$scope.messageId, 'favorite',favorite);

                });

            }
        };
    });