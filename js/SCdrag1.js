; //wh
(function($, window, document, undefined) {
    console.log('2017-2-5');

    //定义Dragger的构造函数
    var Dragger = function(ele, opt) {
        this.$element = ele;
        this.$tools = null;
        this.defaults = { //  默认参数
            type: 'image', //  旋转类型是图片
            height: -1, //  工具框的宽高，-1代表auto
            width: -1, //   upupup
            src: 'SClogo.png', //  图片默认图   
            rotatable: false, //  工具框是否可以旋转
            scalable: false, //  工具框是否可以缩放
            deletable: true, //  工具框是否可以删除
            horizonable: false, //  工具框是否可以横向拉伸
            verticable: false, //  工具框是否可以纵向拉伸
        };
        this.options = $.extend({}, this.defaults, opt);
    };
    var imgReady = (function() {
        var list = [],
            intervalId = null,
            // 用来执行队列
            tick = function() {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },
            // 停止所有定时器队列
            stop = function() {
                clearInterval(intervalId);
                intervalId = null;
            };
        return function(url, ready, load, error) {
            var onready, width, height, newWidth, newHeight,
                img = new Image();
            img.src = url;
            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                ready.call(img);
                load && load.call(img);
                return;
            };
            width = img.width;
            height = img.height;
            // 加载错误后的事件
            img.onerror = function() {
                error && error.call(img);
                onready.end = true;
                img = img.onload = img.onerror = null;
            };
            // 图片尺寸就绪
            onready = function() {
                newWidth = img.width;
                newHeight = img.height;
                if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
                    ready.call(img);
                    onready.end = true;
                };
            };
            onready();
            // 完全加载完毕的事件
            img.onload = function() {
                // onload在定时器时间差范围内可能比onready快
                // 这里进行检查并保证onready优先执行
                !onready.end && onready();
                load && load.call(img);
                // IE gif动画会循环执行onload，置空onload即可
                img = img.onload = img.onerror = null;
            };
            // 加入队列中定期执行
            if (!onready.end) {
                list.push(onready);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 40);
            };
        };
    })();

    function getPosition($obj) {
        var result = {},
            obj = $obj.get(0);
        result.vwidth = parseInt($obj.css('width')); //visibleWidth 实际看到的
        result.vheight = parseInt($obj.css('height'));
        result.width = parseInt(obj.style.width);
        result.height = parseInt(obj.style.height);
        result.whratio = result.width / result.height;
        // result.vleft = $obj.position().left; //相对的位置
        // result.right = $obj.position().right;
        result.vleft = $obj.offset().left;
        result.vtop = $obj.offset().top;
        result.vright = $obj.offset().left + result.vwidth;
        result.vbottom = $obj.offset().top + result.vheight;
        result.left = parseInt($obj.css('left'));
        result.top = parseInt($obj.css('top'));
        result.originX = result.vleft + 1 / 2 * result.vwidth;
        result.originY = result.vtop + 1 / 2 * result.vheight;
        return result;
    }

    function getMatrix($obj) {
        var str = $obj.css('transform');
        var arr = str.replace('matrix(', '').replace(')', '').split(',');
        var a = parseFloat(arr[0]);
        var b = parseFloat(arr[1]);
        var c = parseFloat(arr[2]);
        var d = parseFloat(arr[3]);
        var e = parseFloat(arr[4]);
        var f = parseFloat(arr[5]);
        return matrix(a, b, c, d, e, f);
    }

    function matrix(a, b, c, d, e, f) {
        var aa = Math.round(180 * Math.asin(a) / Math.PI);
        var bb = Math.round(180 * Math.acos(b) / Math.PI);
        var cc = Math.round(180 * Math.asin(c) / Math.PI);
        var dd = Math.round(180 * Math.acos(d) / Math.PI);
        var deg = 0;
        if (aa == bb || -aa == bb) {
            deg = dd;
        } else if (-aa + bb == 180) {
            deg = 180 + cc;
        } else if (aa + bb == 180) {
            deg = 360 - cc || 360 - dd;
        }
        return deg >= 360 ? 0 : deg;
        //return (aa+','+bb+','+cc+','+dd);  
    }
    Dragger.prototype = {
        init: function() {
            var spaceX, spaceY,
                opts = this.options,
                $this = this.$element;

            if (opts.type.toLowerCase() == 'image') {
                // 图片预加载获取宽高
                imgReady(opts.src, function() {
                    var DEFAULT_H = DEFAULT_W = 100; //默认宽高
                    if (opts.height < 0 && opts.width < 0) { //宽高自动
                        opts.width = DEFAULT_W;
                        opts.height = opts.width / this.width * this.height;
                    } else if (opts.height > 0 && opts.width < 0) { //设置了高,宽自适应
                        opts.width = opts.height / this.height * this.width;
                    } else if (opts.height < 0 && opts.width > 0) { //设置了宽，高自适应
                        opts.height = opts.width / this.width * this.height;
                    }
                    var $img = $('<img>');
                    $img.attr({ 'src': opts.src })
                        .css({ 'width': '100%', 'height': '100%' })
                        .appendTo($this);
                    $this.css({ 'position': 'absolute', 'cursor': 'move', 'width': opts.width, 'height': opts.height })
                })
            } else if (opts.type.toLowerCase() == 'text') {
                $this.append('<div>请输入文字</div>');
                $this.css({ 'position': 'absolute', 'cursor': 'move', 'width': opts.width, 'height': opts.height })
            }

            // 动态创建工具框
            $this.mouseenter(function(e) {
                var tools = '<div class="tools">';
                opts.deletable ? tools += '<span class="tool t1"></span>' : null;
                opts.rotatable || opts.scalable ? tools += '<span class="tool t3"></span>' : null;
                opts.horizonable ? tools += '<span class="tool t2"></span>' : null;
                opts.verticable ? tools += '<span class="tool t4"></span>' : null;
                tools += '</div>';
                $tools = $(tools);
                $this.prepend($tools);
            });
            $this.mouseleave(function(e) {
                $tools.remove();
            });

            // 按下删除
            $this.on('click', '.t1', function(e) {
                e.stopPropagation();
                $this.remove();
            });

            // 按下横向拉伸
            var horizonDown = { isDown: false };
            $this.on('mousedown', '.t2', function(e) {
                e.stopPropagation();
                // horizonDown = getPosition($this);
                horizonDown.isDown = true;
            });
            // 按下纵向拉伸
            var verticDown = { isDown: false };
            $this.on('mousedown', '.t4', function(e) {
                e.stopPropagation();
                verticDown = getPosition($this);
                verticDown.isDown = true;
            });

            // 按下旋转缩放
            var rotateDown = { isDown: false };
            $this.on('mousedown', '.t3', function(e) {
                e.stopPropagation();
                rotateDown = getPosition($this);
                rotateDown.isDown = true;
            });

            // 按下拖动
            var dragDown = { isDown: false };
            $this.mousedown(function(e) {
                e.stopPropagation();
                var pos = getPosition($this);
                console.log('drag')
                dragDown.isDown = true;
                spaceX = e.pageX - pos.vleft; //  鼠标到可视左边的距离
                spaceY = e.pageY - pos.vtop;
            });
            $(document).mousemove(function(e) {
                // 拖拽
                if (dragDown.isDown) {
                    var moveX = e.pageX - spaceX,
                        moveY = e.pageY - spaceY;
                    $this.offset({ 'left': moveX, 'top': moveY });
                }
                // 旋转缩放
                if (rotateDown.isDown) {
                    var tempAngle = 0,
                        tempDiagonal = 0,
                        assign = {}; //赋值
                    // console.log(pos);
                    spaceX = e.pageX - rotateDown.originX; // 鼠标到中心的距离
                    spaceY = e.pageY - rotateDown.originY;
                    tempDiagonal = Math.sqrt(spaceX * spaceX + spaceY * spaceY);

                    if (spaceY > 0) {
                        tempAngle = Math.atan(spaceX / spaceY);
                    } else if (spaceY < 0) {
                        tempAngle = Math.atan(spaceX / spaceY) - Math.PI;
                    } else {
                        spaceX < 0 ? tempAngle = -1 / 2 * Math.PI : tempAngle = -3 / 2 * Math.PI;
                    }
                    assign.rotate = (Math.atan(rotateDown.whratio) - tempAngle) / Math.PI * 180;
                    opts.rotatable ? $this.css({ 'transform': 'rotate(' + assign.rotate + 'deg)' }) : null;
                    assign.width = tempDiagonal * Math.sin(Math.atan(rotateDown.whratio)) * 2;
                    assign.height = tempDiagonal * Math.cos(Math.atan(rotateDown.whratio)) * 2;
                    assign.left = rotateDown.left - (assign.width - rotateDown.width) / 2;
                    assign.top = rotateDown.top - (assign.height - rotateDown.height) / 2;
                    opts.scalable ? $this.css({ 'width': assign.width, 'height': assign.height, 'left': assign.left, 'top': assign.top }) : null;
                }
                // 横向拉伸
                if (horizonDown.isDown) {
                    var tempDiagonal = 0,
                        tempPos = {},
                        tempRotate = 0,
                        assign = {}; //赋值
                    horizonDown = getPosition($this);
                    horizonDown.isDown = true;
                    spaceX = e.pageX - horizonDown.originX; // 鼠标到中心的距离
                    spaceY = e.pageY - horizonDown.originY;
                    tempDiagonal = Math.sqrt(spaceX * spaceX + spaceY * spaceY);
                    assign.width = Math.sqrt(tempDiagonal * tempDiagonal - horizonDown.height * horizonDown.height / 4) + 1 / 2 * horizonDown.width;
                    $this.css({ 'width': assign.width });

                    // 左上角固定不动
                    tempPos = getPosition($this);
                    tempRotate = getMatrix($this);
                    if (tempRotate >= 0 && tempRotate < 90) {
                        assign.top = horizonDown.vtop;
                        assign.left = horizonDown.vleft;
                    } else if (tempRotate >= 90 && tempRotate < 180) {
                        assign.top = horizonDown.vtop;;
                        assign.left = horizonDown.vright - tempPos.vwidth;
                    } else if (tempRotate >= 180 && tempRotate < 270) {
                        assign.top = horizonDown.vbottom - tempPos.vheight;
                        assign.left = horizonDown.vright - tempPos.vwidth;
                    } else {
                        assign.top = horizonDown.vbottom - tempPos.vheight;
                        assign.left = horizonDown.vleft;
                    }
                    $this.offset({ 'top': assign.top, 'left': assign.left });
                }
                // 纵向拉伸
                if (verticDown.isDown) {
                    var tempDiagonal = 0,
                        tempPos = {},
                        tempRotate = 0,
                        assign = {}; //赋值
                    spaceX = e.pageX - verticDown.originX; // 鼠标到中心的距离
                    spaceY = e.pageY - verticDown.originY;
                    tempDiagonal = Math.sqrt(spaceX * spaceX + spaceY * spaceY);
                    assign.height = Math.sqrt(tempDiagonal * tempDiagonal - verticDown.width * verticDown.width / 4) + 1 / 2 * verticDown.height;
                    $this.css({ 'height': assign.height });

                    // 右上角固定不动
                    tempPos = getPosition($this);
                    tempRotate = getMatrix($this);
                    if (tempRotate >= 0 && tempRotate < 90) {
                        assign.top = verticDown.vtop;;
                        assign.left = verticDown.vright - tempPos.vwidth;
                    } else if (tempRotate >= 90 && tempRotate < 180) {
                        assign.top = verticDown.vbottom - tempPos.vheight;
                        assign.left = verticDown.vright - tempPos.vwidth;
                    } else if (tempRotate >= 180 && tempRotate < 270) {
                        assign.top = verticDown.vbottom - tempPos.vheight;
                        assign.left = verticDown.vleft;
                    } else {
                        assign.top = verticDown.vtop;
                        assign.left = verticDown.vleft;
                    }
                    $this.offset({ 'top': assign.top, 'left': assign.left });
                }
            });
            $(document).mouseup(function(e) {
                dragDown.isDown = false;
                rotateDown.isDown = false;
                horizonDown.isDown = false;
                verticDown.isDown = false;
            });
        }
    };

    $.fn.SCdragger = function(options) {
        var dragger = new Dragger(this, options);
        dragger.init();
        return this;
    }

})(jQuery, window, document);
