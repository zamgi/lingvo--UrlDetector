$(document).ready(function () {
    var MAX_INPUTTEXT_LENGTH  = 100000,
        LOCALSTORAGE_TEXT_KEY = 'url-text',
        DEFAULT_TEXT          = 'http://ru.wikipedia.org/wiki/Harley-Davidson\n' +
'Газета.ru\n' +
'Газета.ру\n' +
'...тильных предприятий, сообщает vb.kg.ru. Сейчас в Кыргызстане необходимо развивать те...\n' +
'...обычи платины в стране, пишет КаталогМинералов.ру со ссылкой на Дэвида Бинни, генерального менеджер...\n' +
'\n' +
'http - http://ab/cde; https://ab/cde\n' +
'ftp - ftp://ab/cde; sftp://ab/cde; tftp://ab/cde; \n' +
'javascript - javascript:window.document; \n' +
'mailto - mailto:xz@xz.ru; \n' +
'irc - irc://xz; \n' +
'mms - mms://1.2.3.4/5.mp3; \n' +
'ms-help - ms-help://MS.VSCC/MS.MSDNQTR.2002JUL.1033; \n' +
'xmpp - xmpp:alice@example.com?message\n' +
'rtmp - rtmp://oijqodbttndn.rtmphost.com/hostelworld/paris_hipotelbellville.flv\n' +
'ssh - ssh://username@hostname\n' +
'file - file://C:\Windows\Microsoft.NET\n' +
'skype - skype:echo123?call\n' +
'\n' +
'МоскваСегодня 16 АвгустаПогода за окном\n' +
'ЖЖ Навального, Каспаров.ру, Грани.ру и ЕЖ запрещены\n' +
'a.soloviev@gmail.com\n' +
'Новости\n' +
'связь с редакцией\n' +
'\n' +
'17:20\n' +
'Чемпионат мира по легкой атлетике. Следим за россиянами в вечерней сессии [sovsport.ru]\n' +
'15:31\n' +
'Семиборка Луиз Хейзел: МОК должен пересмотреть статус Исинбаевой [sovsport.ru]\n' +
'\n' +
'Фото: Владимир Раснер - dynamo.kiev.ua\n' +
'все фотогалереи\n' +
'Все спортивные материалы на сайте SOVSPORT.RU\n' +
'\n' +
'Долги за коммунальные услуги могут помешать продавать и дарить недвижимость\n' +
'Соответствующие поправки уже разработаны Министерством регионального развития. Они будут внесены на рассмотрение Правительством к концу августа, сообщает Лента.ру.\n' +
'\n' +
'Все колумнисты\n' +
'ВЫБОР РЕДАКЦИИ\n' +
'my.kp.ru Сообщества и конкурсы, которые мы рекомендуем\n' +
'\n' +
'Мой Мир КП Central\n' +
'instagr.am\n' +
'Google Plus\n' +
'\n' +
'© ЗАО ИД «Комсомольская правда», 2013.\n' +
'125993, Москва, Старый Петровско-Разумовский проезд, 1/23, стр. 1. Тел. 7 (495) 777-02-82.\n' +
'Исключительные права на материалы, размещённые на интернет-сайте www.kp.ru, в соответствии с законодательством Российской Федерации об охране результатов интеллектуальной деятельности принадлежат ЗАО "Издательский дом "Комсомольская правда", и не подлежат использованию другими лицами в какой бы то ни было форме без письменного разрешения правообладателя.\n' +
'Приобретение авторских прав: kp@kp.ru\n' +
'Для читателей. Нам важно ваше мнение: (495)777-02-82, 8-800-200-0057 (бесплатно для жителей РФ).\n' +
'Реклама на сайте www.kp.ru\n' +
'Рекомендуем купить недорогие парные обручальные кольца Ricchezza из золота. ricchezza-rings.ru юридический адрес\n' +
'НовостиПоследние новостиНовости шоу-бузнесаБизнес новостиНовости дняНовости РоссииНовости УкраиныНовости мираГид\n' +
'Новости в регионах:Москва АбаканБарнаулБелгород Благовещенск Брянск Владивосток\n' +
'Новости за рубежом:БалканыБеларусьБишкекМолдоваСеверная ЕвропаСШАУкраинаЧерногория\n' +
'Проект IPgeobase Rambler\'s Top100 Рейтинг@Mail.ru Яндекс.Метрика SpyLOG Партнер «Рамблера» Социализация сайта:';

    var textOnChange = function () {
        var _len = $("#text").val().length; 
        var len = _len.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        var $textLength = $("#textLength");
        $textLength.html("length of text: " + len + " characters");
        if (MAX_INPUTTEXT_LENGTH < _len) $textLength.addClass("max-inputtext-length");
        else                             $textLength.removeClass("max-inputtext-length");
    };
    var getText = function ($text) {
        var text = trim_text($text.val().toString());
        if (is_text_empty(text)) {
            alert("Enter the text to be processed.");
            $text.focus();
            return (null);
        }

        if (text.length > MAX_INPUTTEXT_LENGTH) {
            if (!confirm('Exceeded the recommended limit ' + MAX_INPUTTEXT_LENGTH + ' characters (on the ' + (text.length - MAX_INPUTTEXT_LENGTH) + ' characters).\r\nText will be truncated, continue?')) {
                return (null);
            }
            text = text.substr(0, MAX_INPUTTEXT_LENGTH);
            $text.val(text);
            $text.change();
        }
        return (text);
    };

    $("#text").focus(textOnChange).change(textOnChange).keydown(textOnChange).keyup(textOnChange).select(textOnChange).focus();

    (function () {
        function isGooglebot() {
            return (navigator.userAgent.toLowerCase().indexOf('googlebot/') != -1);
        };
        if (isGooglebot())
            return;

        var text = localStorage.getItem(LOCALSTORAGE_TEXT_KEY);
        if (!text || !text.length) {
            text = DEFAULT_TEXT;
        }
        $('#text').text(text).focus();
    })();

    $('#mainPageContent').on('click', '#processButton', function () {
        if($(this).hasClass('disabled')) return (false);

        var text = getText( $("#text") );
        if (!text) return (false);

        processing_start();
        if (text != DEFAULT_TEXT) {
            localStorage.setItem(LOCALSTORAGE_TEXT_KEY, text);
        } else {
            localStorage.removeItem(LOCALSTORAGE_TEXT_KEY);
        }

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
                        $('.result-info').hide();
                        $('#processResult').show().html( html );
                        $('#resultCount').text( 'found Url and E-mail address:' + responce.urls.length );
                    } else {
                        processing_end();
                        $('#processResult').show().html('<div style="text-align: center; padding: 15px;"><b>Url and E-mail addresses</b> not found in the text</div>');
                    }
                }
            },
            error: function () {
                processing_end();
                $('.result-info').addClass('error').text('server error');
            }
        });
        
    });

    function processing_start(){
        $('#text').addClass('no-change').attr('readonly', 'readonly').attr('disabled', 'disabled');
        $('.result-info').show().removeClass('error').html('<div style="text-align: center">Processing...</div>');
        $('#processButton').addClass('disabled');
        $('#processResult, #resultCount').empty();
        $('#processResult').hide();
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
});