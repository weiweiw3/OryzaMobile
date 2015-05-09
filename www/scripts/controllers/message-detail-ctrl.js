/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.controllers.messagesDetail', [])
    //for message.html
    .controller('messageHeaderCtrl_old',
    function (purchaseOrder, myMessage, $location, $log, $stateParams, $timeout, $scope, ionicLoading) {
        console.log(purchaseOrder);
        var params = $location.search();
        var messageId = $scope.messageId = params.key;
        var component = $scope.component = params.component;
        var returnComponent = params.return;
        returnComponent = (typeof returnComponent === "undefined")
            ? "undefined" : returnComponent;

        if (returnComponent === 'E0002') {
            console.log(returnComponent + messageId);
            $scope.returnComponent = myMessage.getE0002Header(messageId);
        }
        if (typeof $scope.returnComponent !== "undefined") {
            $scope.returnComponent.$loaded()
                .then(function (data) {
                    console.log(returnComponent, data);
                });
        }

        var ctrlName = 'messageHeaderCtrl';

        $scope.$log = $log;
        $scope.syncedHeaderData = myMessage.getMessageHeader(component, messageId);

        $scope.syncedHeaderData.$watch(function (data) {
            $log.info(data, ctrlName, 'data changed!');
        });

        $scope.syncedHeaderData.$loaded()
            .then(function (data) {
                $scope.message = data;//all the data in the scope are from here.
                $scope.releaseGroupArray = $scope.message.release_group.split("||");

            })
            .then(ionicLoading.unload());


        $scope.$on('$viewContentLoaded', function () {
            ionicLoading.load('Content Loading...');
            $log.info(ctrlName, 'has loaded');
        });

        $scope.$on('$destroy', function () {
            $scope.syncedHeaderData.$destroy();
            ionicLoading.unload();
            console.log(ctrlName, 'is no longer necessary');
        });

        $scope.goDetail = function () {
            //data is PurchaseOrderdata
            var title = 'Purchase Order ' + messageId + ' Head Information';

            var string = $location.url();
            string = string.substring(1);//把URL里的第一位"/"去掉

            $location.path('/material').search({
                'back_url': string,
                'ref': $scope.message.HeadRef,
                'title': title
            });
        };

    })
    .controller('messageHeaderCtrl',
    function (myTask, ionicLoading, purchaseOrder, $ionicPopup, $timeout, $scope) {

        ionicLoading.load('Loading');
        $scope.$watch('data.lock', function (newVal) {
            console.log(newVal);
            if(newVal){
                $scope.data.approveButtonText='SEND OUT';
            }else{
                $scope.data.approveButtonText='Approve';
            }
        });
        purchaseOrder.$bindTo($scope, "data").then(function () {
            $scope.data.read=true;
            ionicLoading.unload();
            $scope.component = purchaseOrder.$ref().parent().parent().parent().parent().key();
            $scope.ServerUserID = purchaseOrder.$ref().parent().parent().parent().key();
            $scope.PO_REL_CODE = purchaseOrder.$ref().parent().parent().key().substr(3);
            $scope.PURCHASEORDER = purchaseOrder.$ref().key();
            if($scope.data.lock){
                $scope.data.approveButtonText='SEND OUT';
            }else{
                $scope.data.approveButtonText='Approve';
            }

            //E0001->E0002
            myTask.getInputP('E0002').$loaded().then(
                function (data) {
                    inputParas = data.$value;
                    inputParas = inputParas.replace('$P01$', $scope.PO_REL_CODE);//PO_REL_CODE
                    //TODO replace P02 twice , in the furture use replace-all function
                    inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                    inputParas = inputParas.replace('$P02$', $scope.PURCHASEORDER);//PURCHASEORDER
                    inputParas = inputParas.replace('$P03$', $scope.ServerUserID);//ServerUserID
                    $scope.inputParas =inputParas;
                }
            );
            $scope.showConfirm = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Purchase Order Approve',
                    template: $scope.data.po_NUMBER,
                    cancelText: ' ',
                    cancelType: 'button icon ion-close button-assertive',
                    okText: ' ',
                    okType: 'button icon ion-checkmark-round button-balanced'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        myTask.createTask('E0002',$scope.ServerUserID,
                            inputParas, $scope.PURCHASEORDER, 'Approve');
                        $scope.data.lock = true;
                        console.log('approve');
                    } else {
                        console.log('cancel');
                    }
                });
            };
        });
    })
    .controller('messageItemCtrl',
    function (myMessage, $location, $timeout, $scope, ionicLoading) {
        ionicLoading.load();

        $scope.syncedItemStart = myMessage.getMessageItems($scope.$parent.component,
            $scope.$parent.messageId);

        $scope.syncedItemStart.$loaded()
            .then(ionicLoading.unload());

        $scope.isloaded = false;
        $scope.goDetail = function (data) {
            //data is PurchaseOrderItemdata
            var title = data.po_ITEM;

            var string = $location.url();
            string = string.substring(1);//把URL里的第一位"/"去掉

            $location.path('/material').search({
                'back_url': string,
                'ref': data.Ref,
                'title': title
            });
        };
        $scope.loadText = 'more items';

        $scope.loadingMore = function () {
            $scope.toLoad = true;
        };

        $scope.$watch('toLoad', function (newVal) {
            if (newVal === true) {
                $scope.loadText = 'loading';
                ionicLoading.load();
                $scope.continued = myMessage
                    .getMessageMoreItems($scope.$parent.component,
                    $scope.$parent.messageId);
                $scope.continued.$loaded()
                    .then($scope.isloaded = true)
                    .then(ionicLoading.unload());

            }
        });
    });
