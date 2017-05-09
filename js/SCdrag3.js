; //wh
(function ($, window, document, undefined) {
  // console.log('2017-2-8');
  var saveObj = {};
  //定义Dragger的构造函数
  var Dragger = function (ele, opt) {
    this.$element = ele;
    this.defaults = { //  默认参数
      type: 'image', //  旋转类型是图片
      height: 'auto', //  工具框的宽高，
      width: 'auto', //   upupup
      autoLength: 100, //  当宽高是自动时,默认的长度
      src: 'http://g.100xuexi.com/CssModel/AppWap/images/AppLogo.png', //  图片默认图
      rotatable: false, //  工具框是否可以旋转
      scalable: false, //  工具框是否可以缩放
      stretchable: false, //  工具框是否可以拉伸
      restrictIn: false, //  工具限制在父元素内
      contextmenu: true, //   工具的右键功能
      // base: false, //  工具框的基础功能，两个按钮
    };
    this.options = $.extend({}, this.defaults, opt);
  };
  // 右键
  var contextmenu = {
    contextmenu: null,
    target: null,
    creat: function () {
      var contextmenuStr =
        '                <div class="SCcontextmenu">'
        + '                    <div class="menuItem delete">删除</div>'
        + '                    <div class="menuItem reRotate">清除旋转</div>'
        + '                    <div class="menuItem reRatio">还原比例</div>'
        + '                </div>'

      this.contextmenu = $(contextmenuStr);
      this.contextmenu.appendTo($('body')).hide();
      var _this = this;
      this.contextmenu.on('mousedown', function (e) {
        e.stopPropagation();
        _this.hide();
      })
      this.contextmenu.on('mousedown', '.delete', function () {
        _this.target.remove();
      });
      this.contextmenu.on('mousedown', '.reRotate', function () {
        _this.target.css('transform', 'rotate(0deg)');
      });
      this.contextmenu.on('mousedown', '.reRatio', function () {
        var width = parseInt(_this.target.get(0).style.width);
        var height = parseInt(_this.target.get(0).style.height);
        if (width < height) {
          _this.target.css('height', width / _this.target.attr('ratio'));
        } else {
          _this.target.css('width', height * _this.target.attr('ratio'));
        }
      });
    },
    destroy: function () {
      this.contextmenu.remove();
    },
    hide: function () {
      this.contextmenu.hide();
    },
    show: function (e, target) {
      this.target = target;
      this.contextmenu.css({'left': e.clientX, 'top': e.clientY}).show();
    }
  };
  $(function () {
    contextmenu.creat();
    // 隐藏所有工具框
    $(document).on('mousedown', function () {
      $('.SCtools').remove();
      contextmenu.hide();
      saveObj = {$this: null, $tools: null};
    });
    // 增加键盘事件
    $(document).on('keydown', function (event) {
      var which = event.which,
        pos = getPosition(saveObj.$this);
      switch (which) {
        case 37:
          saveObj.$this.offset({'left': pos.vleft - 1});
          break;
        case 38:
          saveObj.$this.offset({'top': pos.vtop - 1});
          break;
        case 39:
          saveObj.$this.offset({'left': pos.vleft + 1});
          break;
        case 40:
          saveObj.$this.offset({'top': pos.vtop + 1});
          break;
      }
    })
  })

  var imgReady = (function () {
    var list = [],
      intervalId = null,
      // 用来执行队列
      tick = function () {
        var i = 0;
        for (; i < list.length; i++) {
          list[i].end ? list.splice(i--, 1) : list[i]();
        }
        ;
        !list.length && stop();
      },
      // 停止所有定时器队列
      stop = function () {
        clearInterval(intervalId);
        intervalId = null;
      };
    return function (url, ready, load, error) {
      var onready, width, height, newWidth, newHeight,
        img = new Image();
      img.src = url;
      // 如果图片被缓存，则直接返回缓存数据
      if (img.complete) {
        ready.call(img);
        load && load.call(img);
        return;
      }
      ;
      width = img.width;
      height = img.height;
      // 加载错误后的事件
      img.onerror = function () {
        error && error.call(img);
        onready.end = true;
        img = img.onload = img.onerror = null;
      };
      // 图片尺寸就绪
      onready = function () {
        newWidth = img.width;
        newHeight = img.height;
        if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
          ready.call(img);
          onready.end = true;
        }
        ;
      };
      onready();
      // 完全加载完毕的事件
      img.onload = function () {
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
      }
      ;
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

  function getPointAngle(origin, point) {
    var tempAngle = 0,
      spaceX = point.x - origin.x,
      spaceY = point.y - origin.y,
      tempSub = 1;
    spaceY > 0 ? tempSub = 1 : tempSub = -1;
    if (spaceX > 0) {
      tempAngle = Math.atan(spaceY / spaceX);
    } else if (spaceX < 0) {
      tempAngle = Math.atan(spaceY / spaceX) + tempSub * Math.PI;
    } else {
      tempAngle = tempSub / 2 * Math.PI
    }
    return tempAngle;
  }

  function getPointLength(origin, point) {
    //
    return Math.sqrt((point.x - origin.x) * (point.x - origin.x) + (point.y - origin.y) * (point.y - origin.y));
  }

  Dragger.prototype = {
    init: function () {
      var spaceX, spaceY,
        opts = this.options,
        $this = this.$element,
        toolStatus = {
          isActive: false,
          isDrag: false,
          isRotate: false,
          isScale: false,
          isStretch: false,
          limitScale: 1000,
          limitStretch: 1000
        };

      if (opts.type.toLowerCase() == 'image') {
        // 图片预加载获取宽高
        imgReady(opts.src, function () {
          $this.attr('ratio', this.width / this.height);
          if (opts.height == 'auto' && opts.width == 'auto') { //宽高自动
            opts.width = opts.autoLength;
            opts.height = opts.width / this.width * this.height;
          } else if (opts.height != 'auto' && opts.width == 'auto') { //设置了高,宽自适应
            opts.width = opts.height / this.height * this.width;
          } else if (opts.height == 'auto' && opts.width != 'auto') { //设置了宽，高自适应
            opts.height = opts.width / this.width * this.height;
          }
          var $img = $('<img>');
          $img.attr({'src': opts.src})
            .css({'width': '100%', 'height': '100%'})
            .appendTo($this);
          $this.css({'position': 'absolute', 'cursor': 'move', 'width': opts.width, 'height': opts.height})
        })
      } else if (opts.type == 'text') {
        $this.append('<div>请输入文字</div>');
        $this.css({'position': 'absolute', 'cursor': 'move', 'width': opts.width, 'height': opts.height})
      }
      // 动态创建工具框
      $this.on('mouseenter touchstart', function (e) {
        e.stopPropagation();
        // 这里使用了saveObj的作用是避免重复创建新的tools
        if (saveObj.$this != $this) {
          toolStatus.isActive = false;
          saveObj.$tools && saveObj.$tools.remove();
          var tools = '<div class="SCtools">';
          opts.rotatable ? tools += '<span class="toolrot tt"></span><span class="toolrot bb"></span><span class="toolrot ll"></span><span class="toolrot rr"></span>' : null;
          opts.scalable ? tools += '<span class="tool scale tl"></span><span class="tool scale tr"></span><span class="tool scale bl"></span><span class="tool scale br"></span>' : null;
          opts.stretchable ? tools += '<span class="tool stretch tc"></span><span class="tool stretch cl"></span><span class="tool stretch cr"></span><span class="tool stretch bc"></span>' : null;
          tools += '</div>';
          saveObj.$tools = $(tools);
          $this.prepend(saveObj.$tools);
          saveObj.$this = $this;
        }
      });
      $this.on('mouseleave', function (e) {
        e.stopPropagation();
        if (!toolStatus.isActive) {
          saveObj.$tools.remove();
          saveObj = {
            $this: null,
            $tools: null
          };
        }
        ;
        // 如果鼠标不在对象上就停止拖拽
        // toolStatus.isDrag = false;
      });
      // 拖动
      $this.on('mousedown touchstart', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.touches) {
          e.pageX = e.touches[0].pageX;
          e.pageY = e.touches[0].pageY;
          e.which = 1;
        }
        if (e.which == 1) {
          // console.log('左键');
          toolStatus.pos = getPosition($this);
          toolStatus.isActive = true; // 激活工具框
          toolStatus.isDrag = true;
          spaceX = e.pageX - toolStatus.pos.vleft; //  鼠标到可视左边的距离
          spaceY = e.pageY - toolStatus.pos.vtop;
        }
        contextmenu.hide();
      });
      // 右键菜单
      if (opts.contextmenu) {
        $this.on('contextmenu', function (e) {
          e.preventDefault();
          // console.log('右键')
          contextmenu.show(e, $this);
        });
      }

      // 旋转
      $this.on('mousedown touchstart', '.toolrot', function (e) {
        e.stopPropagation();
        if (e.touches) {
          e.pageX = e.touches[0].pageX;
          e.pageY = e.touches[0].pageY;
        }
        toolStatus.pos = getPosition($this);
        toolStatus.isRotate = true;
        toolStatus.pos.rotate = getMatrix($this); // 获取当前工具框旋转的角度
        var origin = {x: toolStatus.pos.originX, y: toolStatus.pos.originY},
          point = {x: e.pageX, y: e.pageY};
        toolStatus.pos.mouseRotate = getPointAngle(origin, point); // 获取鼠标和工具框中心的角度
        contextmenu.hide();
      });
      // 缩放
      $this.on('mousedown touchstart', '.scale', function (e) {
        e.stopPropagation();
        toolStatus.isScale = true;
        toolStatus.pos = getPosition($this);
        contextmenu.hide();
      });

      // 拉伸
      $this.on('mousedown touchstart', '.stretch', function (e) {
        e.stopPropagation();
        // console.log('stretch');
        if (e.touches) {
          e.pageX = e.touches[0].pageX;
          e.pageY = e.touches[0].pageY;
        }
        toolStatus.isStretch = true;
        toolStatus.stretchType = $(this).attr('class').replace(/tool stretch /, ''); // 获取按钮方向
        toolStatus.pos = getPosition($this);
        toolStatus.pos.oppositeX = toolStatus.pos.originX * 2 - e.pageX;
        toolStatus.pos.oppositeY = toolStatus.pos.originY * 2 - e.pageY;
        var opposite = {x: toolStatus.pos.oppositeX, y: toolStatus.pos.oppositeY},
          point = {x: e.pageX, y: e.pageY};
        toolStatus.pos.mouseRotate = getPointAngle(opposite, point); // 获取鼠标和工具框对称点的角度
        spaceX = e.pageX - toolStatus.pos.originX; // 鼠标到中心的距离
        spaceY = e.pageY - toolStatus.pos.originY;
        if (spaceX >= 0 && spaceY >= 0) { // 获取工具按钮的象限（逆时针象限）
          toolStatus.stretchQuadrant = 1;
        } else if (spaceX < 0 && spaceY >= 0) {
          toolStatus.stretchQuadrant = 2;
        } else if (spaceX < 0 && spaceY < 0) {
          toolStatus.stretchQuadrant = 3;
        } else if (spaceX >= 0 && spaceY < 0) {
          toolStatus.stretchQuadrant = 4;
        }
        contextmenu.hide();
      })
      $(document).on('mousemove touchmove', function (e) {
        if (e.touches) {
          e.pageX = e.touches[0].pageX;
          e.pageY = e.touches[0].pageY;
        }
        // 拖拽
        if (toolStatus.isDrag) {
          var moveX = e.pageX - spaceX,
            moveY = e.pageY - spaceY;
          $this.offset({'left': moveX, 'top': moveY});
        }
        // 旋转
        if (toolStatus.isRotate) {
          var rotate,
            origin = {x: toolStatus.pos.originX, y: toolStatus.pos.originY},
            point = {x: e.pageX, y: e.pageY};
          mouseRotate = getPointAngle(origin, point);
          rotate = (mouseRotate - toolStatus.pos.mouseRotate) / Math.PI * 180 + toolStatus.pos.rotate;
          $this.css({'transform': 'rotate(' + rotate + 'deg)'});
        }
        // 缩放
        if (toolStatus.isScale) {
          var tempDiagonal = 0,
            assign = {}; //赋值
          spaceX = e.pageX - toolStatus.pos.originX; // 鼠标到中心的距离
          spaceY = e.pageY - toolStatus.pos.originY;
          tempDiagonal = Math.sqrt(spaceX * spaceX + spaceY * spaceY);
          if (tempDiagonal < toolStatus.limitScale) {
            assign.width = tempDiagonal * Math.sin(Math.atan(toolStatus.pos.whratio)) * 2;
            assign.height = tempDiagonal * Math.cos(Math.atan(toolStatus.pos.whratio)) * 2;
            assign.left = toolStatus.pos.left - (assign.width - toolStatus.pos.width) / 2;
            assign.top = toolStatus.pos.top - (assign.height - toolStatus.pos.height) / 2;
            opts.scalable ? $this.css({
              'width': assign.width,
              'height': assign.height,
              'left': assign.left,
              'top': assign.top
            }) : null;
          }

        }
        // 拉伸
        if (toolStatus.isStretch) {
          var tempLength = 0,
            tempPos = {},
            assign = {}; //赋值
          spaceX = e.pageX - toolStatus.pos.oppositeX; // 鼠标到对称点
          spaceY = e.pageY - toolStatus.pos.oppositeY;
          tempLength = Math.sqrt(spaceX * spaceX + spaceY * spaceY);
          var opposite = {x: toolStatus.pos.oppositeX, y: toolStatus.pos.oppositeY},
            point = {x: e.pageX, y: e.pageY};
          mouseRotate = getPointAngle(opposite, point);
          assign.length = tempLength * Math.cos(Math.abs(mouseRotate - toolStatus.pos.mouseRotate));
          if (assign.length <= toolStatus.limitStretch) {
            if (toolStatus.stretchType == 'tc' || toolStatus.stretchType == 'bc') {
              $this.css('height', assign.length);
            } else if (toolStatus.stretchType == 'cl' || toolStatus.stretchType == 'cr') {
              $this.css('width', assign.length);
            }
            tempPos = getPosition($this);
            if (toolStatus.stretchQuadrant == 1) {
              assign.top = toolStatus.pos.vtop;
              assign.left = toolStatus.pos.vleft;
            } else if (toolStatus.stretchQuadrant == 2) {
              assign.top = toolStatus.pos.vtop;
              ;
              assign.left = toolStatus.pos.vright - tempPos.vwidth;
            } else if (toolStatus.stretchQuadrant == 3) {
              assign.top = toolStatus.pos.vbottom - tempPos.vheight;
              assign.left = toolStatus.pos.vright - tempPos.vwidth;
            } else if (toolStatus.stretchQuadrant == 4) {
              assign.top = toolStatus.pos.vbottom - tempPos.vheight;
              assign.left = toolStatus.pos.vleft;
            }
            $this.offset({'top': assign.top, 'left': assign.left});
          }
        }

        // 限制范围
        if (opts.restrictIn && (toolStatus.isDrag || toolStatus.isRotate || toolStatus.isScale || toolStatus.isStretch)) {
          var fatherPos = getPosition($this.parent());
          var thisPos = getPosition($this);

          if (opts.restrictIn && !((thisPos.vtop >= fatherPos.vtop) && (thisPos.vbottom <= fatherPos.vbottom) && (thisPos.vleft >= fatherPos.vleft) && (thisPos.vright <= fatherPos.vright))) {
            thisPos.vleft < fatherPos.vleft ? $this.offset({'left': fatherPos.vleft}) : null;
            thisPos.vtop < fatherPos.vtop ? $this.offset({'top': fatherPos.vtop}) : null;
            thisPos.vbottom > fatherPos.vbottom ? $this.offset({'top': fatherPos.vbottom - thisPos.vheight}) : null;
            thisPos.vright > fatherPos.vright ? $this.offset({'left': fatherPos.vright - thisPos.vwidth}) : null;
            // 鼠标拖动的时候，拖停了，这个时候鼠标距离边界的相对值没有变化
            if (toolStatus.isDrag) {
              thisPos.vleft < fatherPos.vleft ? spaceX = e.pageX - fatherPos.vleft : null;
              thisPos.vtop < fatherPos.vtop ? spaceY = e.pageY - fatherPos.vtop : null;
              thisPos.vbottom > fatherPos.vbottom ? spaceY = e.pageY - (fatherPos.vbottom - thisPos.vheight) : null;
              thisPos.vright > fatherPos.vright ? spaceX = e.pageX - (fatherPos.vright - thisPos.vwidth) : null;
            }
            if (toolStatus.isScale) {
              toolStatus.limitScale = tempDiagonal;
            }
            if (toolStatus.isStretch) {
              toolStatus.limitStretch = assign.length;
            }
            if (toolStatus.isRotate) {
              toolStatus.limitRotate = rotate;
            }
          }
        }
      });
      $(document).on('mouseup touchend', function () {
        toolStatus.isDrag = false;
        toolStatus.isRotate = false;
        toolStatus.isScale = false;
        toolStatus.limitScale = 1000;
        toolStatus.isStretch = false;
        toolStatus.limitStretch = 1000;
      });
    }
  };

  $.fn.SCdragger = function (options) {
    var dragger = new Dragger(this, options);
    dragger.init();
    return this;
  }

})(jQuery, window, document);
