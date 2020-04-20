/*
右键菜单

<div menu-ul='.menu01'>月份</div>
<div menu-ul='.menu02'>星期</div>
<ul class="contextmenu menu01">
    <li>一月</li>
    <li>二月</li>
</ul>
<ul class="contextmenu menu02">
    <li>周一</li>
    <li>周二</li>
    <li onclick="console.log(this.parentNode.menuSource)">周三</li>
</ul>

contextmenu 默认菜单样式
menu-ul 菜单面板 选择器
this.parentNode.menuSource 菜单源
*/
class ContextMenu {
    constructor() {
        this.current = null;
        var html =
            `
            .contextmenu{
                position: absolute; 
                width:90px;
                border: 1px solid gray;
                border-bottom-style: none!important;
                background-color: white;
                cursor: default;
                list-style: none;
                padding: 0;
                margin: 0;
                line-height: 32px;
                font-size: 14px;
                text-align: center;
                color: #333;
                display: none;
            }
            .contextmenu li{
                border-bottom: 1px solid gray;
                margin: 0;
            }            
            .contextmenu li:hover{
                color: white;
                background-color:steelblue;
            }
`;
        var styleId = "contextmenu_style";
        this.attributeName = "menu-ul";
        var style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.innerHTML = html;
            style.id = styleId;
            document.getElementsByTagName("head")[0].appendChild(style);
        }
        //
        document.addEventListener("DOMNodeInserted", (e) => {
            var el = e.target;
            if (el.tagName) {
                if (el.getAttribute(this.attributeName)) {
                    this.useMenu(el);
                }
                var arr = el.querySelectorAll("[" + this.attributeName + "]");
                arr.forEach((item) => this.useMenu(item));
            }
        });

        //
        var arr = document.querySelectorAll("[" + this.attributeName + "]");
        arr.forEach((item) => this.useMenu(item));
    }
    useMenu(el) {
        if (el.oncontextmenu) {
            return;
        }
        el.oncontextmenu = (e) => {
            var rect = el.getBoundingClientRect();
            if (this.current) {
                this.current.style.display = "none";
            }
            var e = e || window.event;
            var filter = el.getAttribute(this.attributeName);
            if (!filter) {
                return;
            }
            var ul = document.querySelector(filter)
            if (!ul) {
                console.log("无效的" + this.attributeName + "属性值:" + filter);
                return;
            }
            ul.style.display = "block";
            ul.style.left = Math.round(e.pageX - ul.clientWidth / 2) + 'px';
            ul.style.top = Math.round(e.pageY - ul.clientHeight / 2) + 'px';
            ul.menuSource = el;
            this.current = ul;
            return false;
        };
    }

    static close() {
        var current = ContextMenu.me.current;
        if (current) {
            current.style.display = "none";
        }
    }
}
window.addEventListener("load", () => {
    ContextMenu.me = new ContextMenu();
    document.documentElement.addEventListener("click", ContextMenu.close);
    document.addEventListener("keyup", (e) => {
        if (e.keyCode == 27) { // Esc
            ContextMenu.close();
        }
    });
});



function printClickNew1(urlId) {
    myAjax({
        url: urlId,
        async: false,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function(res) {
            if (res.status == 0) {
                window.location.href = res.data;
            } else {
                alert('错误提示: ' + (res.message || res.error));
                return false;
            }
        }
    })
}

function appendUlMenu(urlId, type) {
    let lis =
        `<li onclick="printClickNew1('${urlId}');">重新成生</li>
               <li onclick="copyMenuUrl('${urlId}')">复制链接</li>`;
    if (type == 1) {
        let ul = `<ul class="contextmenu menu01">${lis}</ul>`;
        $('body').append(ul);
    } else if (type == 2) {
        let ul =
            `<ul class="contextmenu menu01">${lis}
                    <li onclick="printClickNew1();">审批信息</li>
                    <li onclick="printClickNew1();">重置审批</li>
                </ul>`;
        $('body').append(ul);
    }

}


var copyUrlMenuData;

function copyMenuUrl(urlId) {
    myAjax({
        url: urlId,
        type: 'GET',
        async: false,
        dataType: 'json',
        contentType: 'application/json',
        success: function(res) {
            if (res.status == 0) {
                copyUrlMenuData = res.data;
            } else {
                alert('错误提示: ' + (res.message || res.error));
                return false;
            }
        }
    });

    (function(s) {
        document.oncopy = function(e) {
            e.clipboardData.setData('text', s);
            e.preventDefault();
            document.oncopy = null;
        }
    })(copyUrlMenuData);

    if (document.execCommand('Copy')) {
        document.execCommand('Copy');
        layer.msg('复制成功', {
            icon: 1,
            time: 500
        });
    } else {
        alert('复制失败');
    }

}
