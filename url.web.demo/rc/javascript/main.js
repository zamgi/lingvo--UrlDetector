
$(document).ready(function () {
    var MAX_INPUTTEXT_LENGTH = 100000;

    var textOnChange = function () {
        var _len = $("#text").val().length; 
        var len = _len.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        var $textLength = $("#textLength");
        $textLength.html("длина текста: " + len + " символов");
        if (MAX_INPUTTEXT_LENGTH < _len) $textLength.addClass("max-inputtext-length");
        else                             $textLength.removeClass("max-inputtext-length");
    };
    var getText = function ($text) {
        var text = trim_text($text.val().toString());
        if (is_text_empty(text)) {
            alert("Введите текст для обработки.");
            $text.focus();
            return (null);
        }

        if (text.length > MAX_INPUTTEXT_LENGTH) {
            if (!confirm('Превышен рекомендуемый лимит ' + MAX_INPUTTEXT_LENGTH + ' символов (на ' + (text.length - MAX_INPUTTEXT_LENGTH) + ' символов).\r\nТекст будет обрезан, продолжить?')) {
                return (null);
            }
            text = text.substr(0, MAX_INPUTTEXT_LENGTH);
            $text.val(text);
            $text.change();
        }
        return (text);
    };

    $("#text").focus(textOnChange).change(textOnChange).keydown(textOnChange).keyup(textOnChange).select(textOnChange).focus();

    $('#mainPageContent').on('click', '#processButton', function () {
        if($(this).hasClass('disabled')) return (false);

        var text = getText( $("#text") );
        if (!text) return (false);

        processing_start();

        $.ajax({
            type: "POST",
            url:  "RESTProcessHandler.ashx",
            data: {
                text: text
            },
            success: function (responce) {
                if (responce.err) {
                    if (responce.err == "goto-on-captcha") {
                        window.location.href = "Captcha.aspx";
                    } else {
                        processing_end();
                        $('.result-info').addClass('error').text(responce.err);
                    }
                } else {
                    $('.result-info').removeClass('error').text('');

                    if (responce.urls && responce.urls.length != 0) {
                        var html = '';
                        var startIndex = 0;
                        for (var i = 0, len = responce.urls.length; i < len; i++) {
                            var url = responce.urls[ i ];
                            //text = text.insert( url.startIndex + url.length, '</span>' ).insert( url.startIndex, '<span class="url">' );
                            var url_value = text.substr(url.startIndex, url.length);
                            html += text.substr(startIndex, url.startIndex - startIndex) +
                                    '<span class="url" title=' + url_value + '>' + url_value + '</span>';
                            startIndex = url.startIndex + url.length;
                        }
                        html += text.substr(startIndex, text.length - startIndex);
                        html = html.replaceAll('\r\n', '<br/>').replaceAll('\n', '<br/>').replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;');

                        processing_end();
                        $('#processResult').html( html );
                        $('#resultCount').text( 'найдено Url и E-mail адресов: ' + responce.urls.length );
                    } else {
                        processing_end();
                        $('#processResult').html('<div style="text-align: center; padding: 15px;"><b>Url и E-mail адресов</b> в тексте не найденно</div>');
                    }

                    //---$('#text').html( text );
                }
            },
            error: function () {
                processing_end();
                $('.result-info').addClass('error').text('ошибка сервера');
            }
        });
        
    });

    load_texts();

    function processing_start(){
        $('#text').addClass('no-change').attr('readonly', 'readonly').attr('disabled', 'disabled');
        $('.result-info').removeClass('error').html('<div style="text-align: center">Идет обработка...</div>');
        $('#processButton').addClass('disabled');
        $('#processResult,#resultCount').empty();
    };
    function processing_end(){
        $('#text').removeClass('no-change').removeAttr('readonly').removeAttr('disabled');
        $('.result-info').removeClass('error').text('');
        $('#resultCount').text('');
        $('#processButton').removeClass('disabled');
    };
    function trim_text(text) {
        return (text.replace(/(^\s+)|(\s+$)/g, ""));
    };
    function is_text_empty(text) {
        return (text.replace(/(^\s+)|(\s+$)/g, "") == "");
    };
    String.prototype.insert = function (index, str) {
        if (0 < index)
            return (this.substring(0, index) + str + this.substring(index, this.length));
        return (str + this);
    };
    String.prototype.replaceAll = function (token, newToken, ignoreCase) {
        var _token;
        var str = this + "";
        var i = -1;
        if (typeof token === "string") {
            if (ignoreCase) {
                _token = token.toLowerCase();
                while ((i = str.toLowerCase().indexOf(token, i >= 0 ? i + newToken.length : 0)) !== -1) {
                    str = str.substring(0, i) + newToken + str.substring(i + token.length);
                }
            } else {
                return this.split(token).join(newToken);
            }
        }
        return (str);
    };
    function isGooglebot() {
        return (navigator.userAgent.toLowerCase().indexOf('googlebot/') != -1);
    };
    function load_texts() {
        if (isGooglebot())
            return;
        processing_start();

        $.ajax({
            type: "GET",
            url:  "LoadTextHandler.ashx",
            success: function (responce) {
                if (responce.text) {
                    $('#text').text(responce.text);
                    textOnChange();
                }
                processing_end();
            },
            error: function () {
                processing_end();
            }
        });
    };
});