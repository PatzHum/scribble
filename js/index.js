
var StyleManager = new (function(){
    this.stack = {};
    this.toggleStyle = function(style){
        if (style in stack){
            this.stack[style] = false;
        }
    }
})();

var CursorManager = new(function(){
    this.s = 0;
    this.e = 0;
    this.decrementEnd = function(){
        this.e--;
    }
    this.decrementStart = function(){
        this.s--;
    }
    this.incrementEnd = function(){
        this.e++;
    }
    this.incrementStart = function(){
        this.s++;
    }
    this.incrementBoth = function(){
        this.incrementStart();
        this.incrementEnd();
    }
})();

function Style(name, startTag, endTag, radioGroup){
    this.name = name;
    this.startTag = startTag;
    this.endTag = endTag;
    this.styleGroup = radioGroup;
    this.wrapText = function(val){
        return this.startTag + val + this.endTag;
    }
}

var EditorBuilder = new(function(){
    this.styles = {};
    this.styles["B"] = new Style("bold","<b>", "</b>");
    this.styles["U"] = new Style("underline", "<u>", "</u>");
    this.styles["I"] = new Style("italic" ,"<em>", "</em>");

    this.alignmentGroup = ["E", "left", "right"];
    this.styles["E"] = new Style("center", "<div style=\"text-align:center;\">", "</div>", this.alignmentGroup);
    this.styles["left"] = new Style("left", "<div style=\"text-align:left;\">", "</div>", this.alignmentGroup);
    this.styles["right"] = new Style("right", "<div style=\"text-align:right;\">", "</div>", this.alignmentGroup);

    this.headerGroup = ["h1", "h2", "h3", "h4"];
    this.styles["h1"] = new Style("h1", "<h1 style='display:inline;'>", "</h1>", this.headerGroup);
    this.styles["h2"] = new Style("h2", "<h2 style='display:inline;'>", "</h2>", this.headerGroup);
    this.styles["h3"] = new Style("h3", "<h3 style='display:inline;'>", "</h3>", this.headerGroup);
    this.styles["h4"] = new Style("h4", "<h4 style='display:inline;'>", "</h4>", this.headerGroup);

    this.activeStyles = {};
    this.activeStack = new Array();

    this.caret = 0;
    this.stack = new Array();

    this.toggleStyle = function(style){
/*        if (!(style in this.activeStyles) || this.activeStyles[style] == false){

            //Close all other stylegroup members before creating tag
            if (this.styles[style].styleGroup !== undefined){
                for (var i = 0; i < this.styles[style].styleGroup.length; ++i){
                    if (this.styles[style].styleGroup[i] in this.activeStyles && this.activeStyles[this.styles[style].styleGroup[i]] == true && this.styles[style].styleGroup[i] != style){
                        this.toggleStyle(this.styles[style].styleGroup[i]);
                    }
                }
            }
            this.append(this.styles[style].startTag);
            this.activeStyles[style] = true;
        }else{
            this.append(this.styles[style].endTag);
            this.activeStyles[style] = false;
        }
        $("#current-styles").html("");
        for (s in this.activeStyles){
            var color = "#9370db";
            if (this.alignmentGroup.indexOf(s) != -1){
                color = "#70db70";
            }else if (this.headerGroup.indexOf(s) != -1){
                color = "#dbdb70";
            }
            if (this.activeStyles[s] == true)
                $("#current-styles").append("<div class='current-style-box' style='background:" + color + ";'>" + this.styles[s].name + "</div>"); 
        }*/
        if (style in this.styles){
            if (this.activeStack.indexOf(style) == -1){
                    this.append(this.styles[style].startTag);
                    this.activeStack.push(style);
            }else{
                //Copy the old active stack
                //Close all previous tags
                //Re-push all tags except the one to close
                var newActiveStack = this.activeStack.slice();
                newActiveStack.splice(this.activeStack.indexOf(style), 1);
                var closeStyle = "";
                while (closeStyle = this.activeStack.pop()){
                    this.append(this.styles[closeStyle].endTag);
                }
                this.activeStack = newActiveStack;
                for (var i = 0; i < this.activeStack.length; ++i){
                    this.append(this.styles[this.activeStack[i]].startTag);
                }
            }
        }
        this.updateStyleStack();
    }
    this.updateStyleStack = function(){
        $("#current-styles").html("");
        for (var i = 0; i < this.activeStack.length; ++i){
            var color = "#9370db";
            if (this.alignmentGroup.indexOf(this.activeStack[i]) != -1){
                color = "#70db70";
            }else if (this.headerGroup.indexOf(this.activeStack[i]) != -1){
                color = "#dbdb70";
            }
            if (this.activeStack.indexOf(this.activeStack[i]) != -1)
                $("#current-styles").append("<div class='current-style-box' style='background:" + color + ";'>" + this.styles[this.activeStack[i]].name + "</div>"); 
        }
        if (Editor.MathID != 0){
            $("#current-styles").append("<div class='current-style-box' style='background:hotpink;'>math</div>"); 
        }
    }
    this.append = function(val){
        if (Editor.MathID != 0){
            $("#cache-" + Editor.MathID).append(val);
        }else{            
            this.stack.splice(this.caret, 0, val);
            this.caret++;
        }
    }
    this.bksp = function(){
        if (this.caret >= 0){
            this.stack.splice(this.caret - 1, 1);
            this.caret--;
        }
    }
    this.toString = function(){
        ret = "";
        for (var i = 0; i < this.stack.length; ++i){
            if (this.stack[i].split("-")[0] == "CACHE"){
                ret += $("#cache-" + this.stack[i].split("-")[1]).prop('outerHTML');
            }else{
                ret += this.stack[i];
            }
            if (i == this.caret - 1){
                ret += "<div class='caret-blink'>_</div>"
            }
        }
        return ret;
    }
})();
var Editor = {
    MathID : 0,
    RenderID : 0,
};
function update(){
    $("#editor").html(EditorBuilder.toString());
    if (Editor.RenderID != 0){
        //Render math
        $("#cache-" + Editor.RenderID).html("$" + $("#cache-" + Editor.RenderID).html() + "$");
        MathJax.Hub.Queue(("cache-" + Editor.RenderID).toString(), ["Typeset", MathJax.Hub]);
        Editor.RenderID = 0;
    }
    //MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}
$(document).ready(function(){  
    jQuery.fn.extend({
        insertAtCaret: function(myValue){
            return this.each(function(i) {
                if (document.selection) {
                    //For browsers like Internet Explorer
                    this.focus();
                    var sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                }
                else if (this.selectionStart || this.selectionStart == '0') {
                    //For browsers like Firefox and Webkit based
                    var startPos = this.selectionStart;
                    var endPos = this.selectionEnd;
                    var scrollTop = this.scrollTop;
                    this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
                    this.focus();
                    this.selectionStart = startPos + myValue.length;
                    this.selectionEnd = startPos + myValue.length;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
            });
        },
        insertHTMLAt: function(val, s, e){
            return this.each(function(i){
                $(this).html($(this).html().substring(0, s) + val + $(this).html().substring(e));
            });
        },
        noScrollFocus: function(){
            var x = window.scrollX;
            var y = window.scrollY;
            $(this).focus();
            window.scrollTo(x, y);
            return this;
        }
    });
    $("#editor").keydown(function(e){
        var ch = String.fromCharCode(e.which);
        if (e.ctrlKey){
            if (e.which == 77)
            //Handle math differently
            {
                if (Editor.MathID != 0){
                    //End math tag and close div
                    Editor.RenderID = Editor.MathID;
                    Editor.MathID = 0;
                    EditorBuilder.updateStyleStack(); 
                }else{
                    //Generate some sort of randim id, unlikely to clash but non-fatal if it does
                    var MathID = Math.floor((Math.random() * 349582347) + 1);
                    EditorBuilder.append("CACHE-" +  MathID);
                    Editor.MathID = MathID;
                    $("#cache").append("<div id='cache-" + Editor.MathID + "' class='cached-item'></div>")
                    EditorBuilder.updateStyleStack();
                } 
            }else if (ch in EditorBuilder.styles){
                EditorBuilder.toggleStyle(ch);
                e.preventDefault();
            }
        }else if (e.which == 8){
            EditorBuilder.bksp();
        }

        $("#debug-keycode-keydown").html("KEYDOWN: " + e.which); 
        update();
    });
    $("#editor").keypress(function (e){
        var ch = String.fromCharCode(e.which);
        var preventDefault = true;
        $("#debug-keycode").html("KEYCODE: " + e.which); 
        switch (e.which){
            case 13:
                EditorBuilder.append("<br>");
                break;
            
            default:
                EditorBuilder.append(ch);
        }
        if (preventDefault){
            e.preventDefault();
        }
        update();
    });
    $("#editor").keyup(function(e){
        update(); 
    });


    $(".refocus").click(function(e){
        $("#editor").noScrollFocus();
        $("#editor").html(EditorBuilder.toString());
    });
    $("#editor").focus();
});
