//<div ng-controller="ExampleController" class="container">
//    <h1>Angular + Elasticsearch</h1>
//
//    <!-- if there is an error, display its message -->
//    <div ng-if="error" class="alert alert-danger" role="alert">{{error.message}}</div>
//
//    <!-- if clusterState is available, display it as formatted json -->
//    <div ng-if="clusterState" class="panel panel-default">
//        <div class="panel-heading">
//            <h3 class="panel-title">Cluster State</h3>
//        </div>
//        <div class="panel-body">
//            <pre>{{clusterState | json}}</pre>
//        </div>
//    </div>
//</div>
//app.service('client', function (esFactory) {
//    return esFactory({
//        host: 'localhost:9200',
//        apiVersion: '1.3',
//        log: 'trace'
//    });
//});
//app.controller('ExampleController', function ($scope, client, esFactory) {
//
//    client.cluster.state({
//        metric: [
//            'cluster_name',
//            'nodes',
//            'master_node',
//            'version'
//        ]
//    })
//        .then(function (resp) {
//            $scope.clusterState = resp;
//            $scope.error = null;
//        })
//        .catch(function (err) {
//            $scope.clusterState = null;
//            $scope.error = err;
//
//            // if the err is a NoConnections error, then the client was not able to
//            // connect to elasticsearch. In that case, create a more detailed error
//            // message
//            if (err instanceof esFactory.errors.NoConnections) {
//                $scope.error = new Error('Unable to connect to elasticsearch. ' +
//                    'Make sure that it is running and listening at http://localhost:9200');
//            }
//        });
//
//});