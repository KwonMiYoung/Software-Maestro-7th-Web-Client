var url = 'http://localhost:27018';

app.controller("ctrl", function ($scope, $timeout, $mdDialog, $sce) {
    $scope.ClientWidth = 0;
    $scope.ClientHeight = 0;
    $scope.admin = true;


    $scope.responseListColumn = 3;
    $scope.lang = {
        lang: ''
    };
    $scope.subnav = {};
    $scope.categorylist = [];
    $scope.peoples = [];
    $scope.input = {
        category_id: '',
        user_id: '',
        post_title: '',
        post_images: '',
        post_content: '',
    };
    $scope.click = {
        addCategory : function (ev){
            $scope.add_category_input = {meta_id : 'subnav', key_id : '', value : {}};

            $mdDialog.show({
                controller: AddCategoryDialogController,
                templateUrl: '/view/dialog/admin_add_category.html',
                scope: $scope.$new(),
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen
            });
        },
        saveLayout: function () {
            var list_id = ['#firstlist', '#secondlist', '#thirdlist'];
            var data = [];
            var lang_meta = [];
            var subnav_meta = [];

            for (var i = 0; i < list_id.length; i++) {
                var order = i;

                $(list_id[i]).find('.category').each(function () {
                    data.push({
                        id: $(this).attr('id'),
                        p: order
                    });
                    order += 3;
                });
            }

            $('#topnav').find('span').each(function () {
                lang_meta.push(
                    $(this).text()
                );
            });
            $('#subnav').find('.sub-nav').each(function () {
                subnav_meta.push(
                    $(this).attr('id')
                );
            });

            ajax(url + '/api/post/update/priority', "GET", {data: data}, function (res, err) {
                if (!res.status) {
                    console.log(res.err);
                    return;
                }

                ajax(url + '/api/post/update/meta', "GET", {meta_id : 'language', data: JSON.stringify(lang_meta)}, function (res, err) {
                    if (!res.status) {
                        console.log(res.err);
                        return;
                    }
                    ajax(url + '/api/post/update/meta', "GET", {meta_id : 'subnav', data: JSON.stringify(subnav_meta)}, function (res, err) {
                        if (!res.status) {
                            console.log(res.err);
                            return;
                        }

                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('알림')
                                .textContent('저장되었습니다.')
                                .ok('OK')
                        );
                    });
                });
            });
        },
        write: function (ev) {
            $mdDialog.show({
                controller: WriteDialogController,
                templateUrl: '/view/dialog/write_popup.html',
                scope: $scope.$new(),
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen
            });
        },
        changeLang: function (newLang) {
            $scope.lang.lang = newLang;
        },
        dialogOpen: function (ev, data) {
            //ajax(url + '/api/post/load/comment', "GET", data, function (res, err) {
            $scope.data = data;
            $scope.comment = [];

            // ajax(url + '/api/post/load/read', "GET", data, function (res, err) {
            // });

            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/view/dialog/board_popup.html',
                scope: $scope.$new(),
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
            });
            //});
        },
    }


    $scope.trustedHtml = function (plainText, defaultImage) {
        if (defaultImage && plainText.match(/<img src=/g) == undefined) {
            plainText = "<img src='" + defaultImage + "' />" + plainText;
        }
        return $sce.trustAsHtml(plainText);
    }
    $scope.trustedURL = function (url) {
        console.log(url);
        return $sce.trustAsResourceUrl(url);
    }
    $scope.loadData = function () {
        ajax(url + '/api/post/load/meta?meta_id=language', "GET", [], function (res, err) {
            if (err) {
                console.log(err);
                return;
            }

            $scope.lang = res.data;
            $scope.click.changeLang($scope.lang["kind"][0]);
            console.log($scope.lang["kind"]);
            $timeout();
        });
        ajax(url + '/api/post/load/meta?meta_id=subnav', "GET", [], function (res, err) {
            if (err) {
                console.log(err);
                return;
            }

            $scope.subnav = res.data;
            $scope.subnav.data = [];

            for (var i = 0; i < $scope.subnav.kind.length; i++) {
                for (var key in $scope.subnav) {
                    if (key == $scope.subnav.kind[i]) {
                        $scope.subnav.data.push({key : key, text : $scope.subnav[key]});
                        break;
                    }
                }
            }

            $timeout();
        });

        ajax(url + '/api/post/load/post', "GET", [], function (res, err) {
            if (err) {
                console.log(err);
                return;
            }

            $scope.categorylist = res.data;
            $timeout();
        });
    };

    $scope.loadData();

    setInterval(function () {

        $('#firstlist').css('min-height', '0px');
        $('#secondlist').css('min-height', '0px');
        $('#thirdlist').css('min-height', '0px');

        var categoryHeight = $('#categorylist').height();

        $('#firstlist').css('min-height', categoryHeight + 'px');
        $('#secondlist').css('min-height', categoryHeight + 'px');
        $('#thirdlist').css('min-height', categoryHeight + 'px');
    }, 500);
});

app.directive('resize', function ($window) {
    return function ($scope, element) {
        var w = angular.element($window);

        $scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        };
        $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
            $scope.ClientWidth = newValue.w;
            $scope.ClientHeight = newValue.h;

            if ($scope.ClientWidth > 1600)
                $scope.ClientWidth = 1600;

            if (newValue.w >= 1200)
                $scope.responseListColumn = 3;
            else if (newValue.w >= 992)
                $scope.responseListColumn = 2;
            else
                $scope.responseListColumn = 1;
        }, true);

        w.bind('resize', function () {
            $scope.$apply();
        });
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

function DialogController($scope, $mdDialog, $timeout) {
    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.submit = function (data) {
        if (data.newcomment.user == null || data.newcomment.user.length < 1)
            return;
        if (data.newcomment.password == null || data.newcomment.password.length < 1)
            return;
        if (data.newcomment.content == null || data.newcomment.content.length < 1)
            return;

        ajax(url + '/api/post/write/comment', "GET", data, function (res, err) {
            $scope.refresh(data);
        });
    };

    $scope.refresh = function (data) {
        data.newcomment = {};

        ajax(url + '/api/post/load/comment', "GET", data, function (res, err) {
            if (err) {
                console.log(err);
                return;
            }

            $scope.comment = res.data;
            $timeout();
        });
    };

    $scope.delete = function (ev, data) {
        var confirm = $mdDialog.confirm()
            .title('경고')
            .textContent('이 게시글을 삭제하시겠습니까?')
            .targetEvent(ev)
            .ok('OK')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            ajax(url + '/api/post/delete', "GET", data, function (res, err) {
                if (!res.status) {
                    console.log(res.err);
                }

                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('알림')
                        .textContent('삭제되었습니다.')
                        .ok('OK')
                );

                for (var i = 0; i < $scope.categorylist.length; i++) {
                    if ($scope.categorylist[i].post_id == data.post_id) {
                        $scope.categorylist.splice(i, 1);
                    }
                }
            });
        });
    };

    $scope.deletePost = function (ev, item) {
        var confirm = $mdDialog.prompt()
            .title('이 게시글을 삭제하시겠습니까?')
            .textContent('비밀번호를 입력해주세요.')
            .placeholder('Enter the password')
            .targetEvent(ev)
            .ok('OK')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function (result) {
            let data = {
                id: item.id,
                password: result,
            }

            if (item.password != result) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('알림')
                        .textContent('비밀번호가 일치하지 않습니다.')
                        .ok('OK')
                );
                return;
            }

            ajax(url + '/api/post/delete', "GET", data, function (res, err) {
                if (err) {
                    console.log(err);
                    return;
                }
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('알림')
                        .textContent('삭제되었습니다.')
                        .ok('OK')
                );
                $scope.click.loadData($scope.tag);
            });
        })
    }

    $scope.deleteComment = function (ev, item) {
        var confirm = $mdDialog.prompt()
            .title('이 댓글을 삭제하시겠습니까?')
            .textContent('비밀번호를 입력해주세요.')
            .placeholder('Enter the password')
            .targetEvent(ev)
            .ok('OK')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function (result) {
            let data = {
                id: item.id,
                password: result,
            }

            if (item.password != result) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('알림')
                        .textContent('비밀번호가 일치하지 않습니다.')
                        .ok('OK')
                );
                return;
            }

            ajax(url + '/api/post/delete/comment', "GET", data, function (res, err) {
                if (err) {
                    console.log(err);
                    return;
                }
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('알림')
                        .textContent('삭제되었습니다.')
                        .ok('OK')
                );
                $scope.refresh($scope.data);
            });
        })
    }
}

function WriteDialogController($scope, $mdDialog) {
    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.save = function () {
        var data = $scope.input;

        data.post_content = tinymce.get('elm1').getContent();
        data.post_images = data.post_content.match(/src\s*=\s*"(.+?)"/g);

        if (data.post_images) {
            data.post_images = data.post_images[0];
            data.post_images = data.post_images.slice(5, data.post_images.length - 1);
        }

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
            $scope.loadData();
        });

        $mdDialog.hide();
    };
}

function AddCategoryDialogController($scope, $mdDialog) {
    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.save = function () {
        var data = $scope.add_category_input;

        data.value = JSON.stringify(data.value);


        $scope.subnav[data.key_id] = data.value;
        $scope.subnav.data = [];
        $scope.subnav.kind.push(data.key_id);

        for (var i = 0; i < $scope.subnav.kind.length; i++) {
            for (var key in $scope.subnav) {
                if (key == $scope.subnav.kind[i]) {
                    $scope.subnav.data.push({key : key, text : $scope.subnav[key]});
                    break;
                }
            }
        }

        $timeout();

        ajax(url + '/api/post/write/meta', "GET", data, function (res, err) {
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
            $scope.$apply();
        });

        $mdDialog.hide();
    };
}
