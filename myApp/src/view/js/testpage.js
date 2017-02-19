var url = 'http://localhost:27017';


app.controller("ctrl", function ($scope, $timeout, $mdDialog, $sce) {
    $scope.input = {
        category_id: '',
        user_id: '',
        post_title: '',
        post_images: '',
        post_content: 'ㅁㄴㅇㄹㅁㄴㅇ',
    }
    $scope.click = {
        save: function (ev) {
            var data = $scope.input;

            data.post_content = tinymce.get('elm1').getContent();
            console.log(data.post_content);

            ajax(url + '/api/post/write', "GET", data, function (res, err) {
                if (err) {
                    console.log(err);
                    return;
                }
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('알림')
                        .textContent('등록되었습니다.')
                        .ok('OK')
                );
                $scope.refresh($scope.data);
            });
        },
    }
});

var ajax = function (url, method, data, callback) {
    $.ajax({
        url: url,
        method: method,
        data: data,
        success: function (res) {
            callback(res, null);
        },
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
}
