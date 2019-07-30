function MyBind() {
    this.reg = /\$\{([\w\.\[\]]+)\}/g;
}
MyBind.prototype.getValue = function(data, s) {
    var reg = this.reg;
    reg.lastIndex = 0;
    var arr = [];
    while (true) {
        var p = reg.lastIndex;
        var match = reg.exec(s);
        if (!match) {
            arr.push(s.substring(p));
            break;
        }
        arr.push(s.substring(p, match.index));
        var exp = `(data.${match[1]})`;
        var value = "";
        try {
            value = eval(exp);
        } catch (e) {}
        arr.push(value);
    }
    return arr.join("");
}
MyBind.prototype.doBind = function(div, data) {
    data = div.BindData || data;
    if (div.getAttribute) {
        var theData = div.getAttribute("theData");
        if (theData) {
            data = eval("(data." + theData + ")");
        }
    }
    if (this.loop.indexOf(div) != -1) {
        this.loopBind(div, data);
        return;
    }
    if (div.TempNods) {
        for (var i = 0; i < div.TempNods.attrs.length; i++) {
            var item = div.TempNods.attrs[i];
            item.node.value = this.getValue(data, item.value);
        }
        for (var i = 0; i < div.TempNods.nodes.length; i++) {
            var item = div.TempNods.nodes[i];
            item.node.data = this.getValue(data, item.value);
        }
    }
    for (var i = 0; i < div.childNodes.length; i++) {
        this.bind(div.childNodes[i], data);
    }
    if (div.Loops) {
        for (var i = 0; i < div.Loops.length; i++) {
            var div2 = div.Loops[i];
            this.loopBind(div2, div2.BindData || data);
        }
    }
}
MyBind.prototype.loopBind = function(div, data) {
    if (!data.length) {
        return;
    }
    if (div.Items) {
        for (var i = 0; i < div.Items.length; i++) {
            div.Parent.removeChild(div.Items[i]);
        }
    }
    div.Items = [];
    for (var i = 0; i < data.length; i++) {
        var itemData = data[i];
        var div2 = div.cloneNode(true);
        this.find(div2);
        div2.theData = itemData;
        this.doBind(div2, itemData);
        div.Parent.insertBefore(div2, div.Next);
        div.Items.push(div2);
    }
}
MyBind.prototype.find = function(div) {
    if (!div || !div.attributes) {
        return;
    }
    for (var i = 0; i < div.attributes.length; i++) {
        var attr = div.attributes[i];
        var match = attr.value.match(this.reg);
        if (match) {
            if (!div.TempNods) {
                div.TempNods = {
                    attrs: [],
                    nodes: []
                };
            }
            div.TempNods.attrs.push({
                node: attr,
                value: attr.value
            });
        }
    }
    for (var i = 0; i < div.childNodes.length; i++) {
        var child = div.childNodes[i];
        if (child.nodeName == "#text") {
            var match = child.data.match(this.reg)
            if (match) {
                if (!div.TempNods) {
                    div.TempNods = {
                        attrs: [],
                        nodes: []
                    };
                }
                div.TempNods.nodes.push({
                    node: child,
                    value: child.data
                });
            }
        } else if (child.nodeName == "SCRIPT") {
            continue;
        } else {
            this.find(child);
        }
    }
}
MyBind.prototype.bind = function(div, data) {
    if (div == null) {
        return;
    }
    data = data || {};
    if (!this.ready) {
        this.ready = true;
        this.find(document.documentElement);
        this.loop = [];
        var list = document.querySelectorAll(".loop-bind");
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            item.Next = item.nextSibling;
            var parent = item.parentNode;
            item.Parent = parent;
            parent.removeChild(item);
            if (!parent.Loops) {
                parent.Loops = [];
            }
            parent.Loops.push(item);
            this.loop.push(item);
        }
    }
    this.doBind(div, data);
}
MyBind.me = new MyBind();

// export default
const myBind = function(data, div = document.body) {
    MyBind.me.bind(div, data)
};
