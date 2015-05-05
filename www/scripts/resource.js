//change firebase object into Array
function objectToArray() {
    var keys = messageRef.$getIndex();
    $scope.messages = [];
    keys.forEach(function (key, i) {
        $scope.messages.push(messageRef [key]);
    });
}
