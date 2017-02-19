app.controller("ctrl", function ($scope, $timeout, $mdDialog, $sce) {
    $scope.ClientWidth = 0;
    $scope.ClientHeight = 0;
    $scope.responseListColumn = 3;

    $scope.session = {};
    $scope.lang = {
        lang: ''
    };
    $scope.subnav = {};
    $scope.categorylist = [];
    $scope.peoples = [];
    $scope.click = {
        signin: function (ev) {
            $mdDialog.show({
                controller: SignInDialogController,
                templateUrl: '/view/dialog/signin.html',
                scope: $scope.$new(),
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen
            });
        },
        signup: function (ev) {
            $mdDialog.show({
                controller: SignUpDialogController,
                templateUrl: '/view/dialog/signup.html',
                scope: $scope.$new(),
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen
            });
        },
        signout: function (ev) {
            $.ajax({
                method: 'POST', url: "/api/user/signout", data: data, success: function (res) {
                    $scope.session = {};

                    if (res.status) {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('알림')
                                .textContent('로그아웃 되었습니다.')
                                .ok('OK')
                        );
                    }
                    else {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('알림')
                                .textContent('로그아웃에 실패했습니다.')
                                .ok('OK')
                        );
                    }
                }
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
            ajax(url + '/api/post/load/comment', "GET", data, function (res, err) {
                $scope.data = data;
                $scope.comment = res.data;

                ajax(url + '/api/post/update/read', "GET", data, function (res, err) {
                });

                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/view/dialog/board_popup.html',
                    scope: $scope.$new(),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen
                });
            });
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
                        $scope.subnav.data.push($scope.subnav[key])
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
        ajax(url + '/api/user/session', "GET", [], function (res, err) {
            if (err) {
                console.log(err);
                return;
            }

            $scope.session.user = res.data;
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

function SignInDialogController($scope, $mdDialog) {
    $scope.dialog = {
        input: {
            signin: {
                email: '',
                password: '',
            },
            signup: {
                email: '',
                user_name: '',
                password: '',
                passwordConfirm: '',
                gender: '',
                age: '',

                dropdown: {
                    gender: ['Secret', 'Male', 'Female'],
                    age: ['Secret']
                },
            },
        },
        click: {
            basic: {
                hide: function () {
                    $mdDialog.hide();
                },
                cancel: function () {
                    $mdDialog.cancel();
                },
            },
            signin: {
                submit: function () {
                    var data = {
                        user_id: $scope.dialog.input.signin.email,
                        password: $scope.dialog.input.signin.password
                    };
                    $.ajax({
                        method: 'POST', url: "/api/user/signin", data: data, success: function (res) {
                            if (res.status) {
                                $scope.dialog.input.signin.email = '';
                                $scope.dialog.input.signin.password = '';
                                $scope.session.user = res.data;

                                alertDialog($mdDialog, "로그인", "환영합니다. " + $scope.session.user.id + "님.", "확인", function () {
                                });
                            }
                            else {
                                alertDialog($mdDialog, "로그인", "아이디 혹은 비밀번호가 잘못되었습니다." + res.err, "확인", function () {
                                });
                            }
                        }
                    });
                }
            },
            signup: {
                submit: function () {
                    if ($scope.dialog.input.signup.password == $scope.dialog.input.signup.passwordConfirm && $scope.dialog.input.signup.passwordConfirm.length >= 8) {
                        $.ajax({
                            method: 'POST',
                            url: "/api/user/signup",
                            data: $scope.dialog.input.signup,
                            success: function (res) {
                                if (res.status) {
                                    alertDialog($mdDialog, "회원가입", "회원가입이 완료되었습니다.", "확인", function () {
                                        $scope.dialog.input.signup.email = '';
                                        $scope.dialog.input.signup.user_name = '';
                                        $scope.dialog.input.signup.password = '';
                                        $scope.dialog.input.signup.passwordConfirm = '';
                                        $scope.dialog.input.signup.gender = '';
                                        $scope.dialog.input.signup.age = '';
                                    });
                                }
                                else {
                                    alertDialog($mdDialog, "회원가입", "회원가입을 실패하였습니다." + res.msg, "확인", function () {
                                    });
                                }
                            }
                        });
                    }
                    else {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('알림')
                                .textContent('패스워드가 일치하지 않습니다.')
                                .ok('OK')
                        );
                    }
                }
            },
            save: function () {
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
            },
        },
    };

    for (var i = 5; i <= 80; i++) {
        $scope.dialog.input.signup.dropdown.age.push(i + '');
    }
}

function DialogController($scope, $mdDialog, $timeout) {
    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.like = function (data) {
        data.post_like += 1;

        ajax(url + '/api/post/update/like', "GET", data, function (res, err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    }
    $scope.dislike = function (data) {
        data.post_dislike += 1;

        ajax(url + '/api/post/update/dislike', "GET", data, function (res, err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    }
    $scope.submit = function (data) {
        if (data.newcomment.comment_title == null || data.newcomment.comment_title.length < 1)
            return;
        if (data.newcomment.comment_content == null || data.newcomment.comment_content.length < 1)
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
        var confirm = $mdDialog.confirm()
            .title('이 댓글을 삭제하시겠습니까?')
            .textContent('비밀번호를 입력해주세요.')
            .targetEvent(ev)
            .ok('OK')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            let data = {
                comment_id: item.comment_id,
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