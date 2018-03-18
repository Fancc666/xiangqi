// @author 丁浩然 <dinghaoran@tiaozhan.com>

// common.js文件用于游戏整体方面的控制

// 声明一个空对象com
var com = com || {};

// 初始化com
com.init = function(style) {
	// 获取并设置当前的样式信息
	com.nowStyle = style || com.getCookie("style") || "style2";
	var style = com.style[com.nowStyle];

	com.width = style.width;             // 画布宽度
	com.height = style.height;           // 画布高度
	com.spaceX = style.spaceX;           // 着点X跨度
	com.spaceY = style.spaceY;           // 着点Y跨度
	com.pointStartX = style.pointStartX; // 第一个着点X坐标
	com.pointStartY = style.pointStartY; // 第一个着点Y坐标
	com.page = style.page;               // 图片目录

	// 设置棋盘版面的宽度
	com.get("box").style.width = com.width + 130 + "px";

	// 获取当前的画布以及画笔用于绘制图像
	com.canvas = com.get("chess");        // 画布
	com.ct = com.canvas.getContext("2d"); // 画笔
	com.canvas.width = com.width;
	com.canvas.height = com.height;

	com.childList = com.childList || [];

	com.loadImages(com.page); // 载入图片
}

// 加载页面
window.onload = function() {
	// 实例化棋盘，提示点，棋子外框的管理类
	com.bg = new com.class.Bg();
	com.dot = new com.class.Dot();
	com.pane = new com.class.Pane();
	com.pane.isShow = false;

	com.childList = [com.bg, com.dot, com.pane];
	com.mans = {}; // 存储棋子的集合
	com.createMans(com.initMap); // 生成棋子
	com.bg.show();
	com.get("btnBox").style.display = "block";
	play.init();

	// 增加三个监听器，监听各个切换难度按钮的点击事件
	com.get("superPlay").addEventListener("click", function(e) {
		if (confirm("确认开始大师级对弈？")) {
			play.isPlay = true;
			com.get("moveInfo").style.display = "block";
			com.get("moveInfo").innerHTML = "";
			// 高手级搜索深度设为5层
			play.depth = 5;
			play.init();
		}
	});
	com.get("normalPlay").addEventListener("click", function(e) {
		if (confirm("确认开始普通级对弈？")) {
			play.isPlay = true;
			com.get("moveInfo").style.display = "block";
			com.get("moveInfo").innerHTML = "";
			// 普通级搜索深度设为4层
			play.depth = 4;
			play.init();
		}
	});
	com.get("tyroPlay").addEventListener("click", function(e) {
		if (confirm("确认开始新手级对弈？")) {
			play.isPlay = true;
			com.get("moveInfo").style.display = "block";
			com.get("moveInfo").innerHTML = "";
			// 新手级搜索深度设为3层
			play.depth = 3;
			play.init();
		}
	});

	// 监听“换肤”按钮，切换皮肤
	com.get("styleBtn").addEventListener("click", function(e) {
		var style = com.nowStyle;
		if (style == "style1")
			style = "style2";
		else if (style == "style2")
			style = "style1";
		com.init(style);
		com.show();

		play.isPlay = true;
		com.get("moveInfo").style.display = "block";
		com.get("moveInfo").innerHTML = "";
		// 默认的搜索深度为4层
		play.depth = 4;
		play.init();
		document.cookie = "style=" + style;
		clearInterval(timer);
		var i = 0;
		var timer = setInterval(function() {
			com.show();
			if (i++ >= 5)
				clearInterval(timer);
		}, 2000);
	});

	// 使用ajax载入文件的内容，注意必须要架在服务器上方可加载
	com.getData("src/data/gambit.all.js", function(data) {
		com.gambit = data.split("");
		AI.historyBill = com.gambit;
	});
}

// 样式表
com.style = {
	// 样式1
	style1: {
		width: 325,      // 画布宽度
		height: 402,     // 画布高度
		spaceX: 35,      // 着点X跨度
		spaceY: 36,      // 着点Y跨度
		pointStartX: 5,  // 第一个着点X坐标
		pointStartY: 19, // 第一个着点Y坐标
		page: "style_1"  // 图片目录
	},
	// 样式2
	style2: {
		width: 530,      // 画布宽度
		height: 567,     // 画布高度
		spaceX: 57,      // 着点X跨度
		spaceY: 57,      // 着点Y跨度
		pointStartX: -2, // 第一个着点X坐标
		pointStartY: 0,  // 第一个着点Y坐标
		page: "style_2"  // 图片目录
	}
}

// 通过指定的id获取元素
com.get = function(id) {
	return document.getElementById(id);
}

// 载入图片
com.loadImages = function(style) {
	// 绘制棋盘
	com.bgImg = new Image();
	com.bgImg.src = "src/img/" + style + "/bg.png";

	// 提示点
	com.dotImg = new Image();
	com.dotImg.src = "src/img/" + style + "/dot.png";

	// 棋子
	for (var i in com.args) {
		com[i] = {};
		com[i].img = new Image();
		com[i].img.src = "src/img/" + style + "/" + com.args[i].img + ".png";
	}

	// 棋子外框
	com.paneImg = new Image();
	com.paneImg.src = "src/img/" + style + "/r_box.png";

	// 设置背景
	document.getElementsByTagName("body")[0].style.background = "url(src/img/" + style + "/bg.jpg)";
}

// 显示数组列表中的内容
com.show = function() {
	com.ct.clearRect(0, 0, com.width, com.height);
	for (var i = 0; i < com.childList.length; i++) {
		com.childList[i].show();
	}
}

// 显示移动的棋子的外框
com.showPane = function(x, y, newX, newY) {
	com.pane.isShow = true;
	com.pane.x = x;
	com.pane.y = y;
	com.pane.newX = newX;
	com.pane.newY = newY;
}

// 生成map中存在的棋子
com.createMans = function(map) {
	for (var i = 0; i < map.length; i++) {
		for (var n = 0; n < map[i].length; n++) {
			var key = map[i][n];
			if (key) {
				com.mans[key] = new com.class.Man(key);
				com.mans[key].x = n;
				com.mans[key].y = i;
				com.childList.push(com.mans[key]);
			}
		}
	}
}

// 用于测试时进行调试输出
com.alert = function(obj, f, n) {
	if (typeof obj != "object") {
		try {
			console.log(obj);
		} catch(e) {
			alert(e);
		}
	}
	var arr = [];
	for (var i in obj)
		arr.push(i + "=" + obj[i]);
	try {
		console.log(arr.join(n || "\n"));
	} catch(e) {
		alert(e);
	}
}

// 把z设为com.alert的简写，考虑z变量名最不常用，方便调试
var z = com.alert;

// 获取元素距离页面左侧的距离
com.getDomXY = function(dom) {
	var left = dom.offsetLeft;
	var top = dom.offsetTop;
	var current = dom.offsetParent;
	while (current != null) {
		left += current.offsetLeft;
		top += current.offsetTop;
		current = current.offsetParent;
	}
	return {
		x: left,
		y: top
	};
}

// 获取浏览器的cookie
com.getCookie = function(name) {
	if (document.cookie.length > 0) {
		start = document.cookie.indexOf(name + "=");
		if (start != -1) {
			start = start + name.length + 1;
			end = document.cookie.indexOf(";", start);
			if (end == -1) {
				end = document.cookie.length;
			}
			return unescape(document.cookie.substring(start, end));
		}
	}
	return false;
}

// 克隆二维数组
com.arr2Clone = function(arr) {
	var newArr = [];
	for (var i = 0; i < arr.length; i++) {
		newArr[i] = arr[i].slice();
	}
	return newArr;
}

// 使用ajax载入数据，注意要求架在服务器上方可正常使用
com.getData = function(url, fun) {
	var XMLHttpRequestObject = false;
	if (window.XMLHttpRequest) {
		XMLHttpRequestObject = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
	}
	if (XMLHttpRequestObject) {
		XMLHttpRequestObject.open("GET", url);
		XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		XMLHttpRequestObject.onreadystatechange = function() {
			if (XMLHttpRequestObject.readyState == 4 && XMLHttpRequestObject.status == 200) {
				fun(XMLHttpRequestObject.responseText);
			}
		}
		XMLHttpRequestObject.send(null);
	}
}

// 将坐标转化为象棋专业的着法
com.createMove = function(map, x, y, newX, newY) {
	var h = "";
	var man = com.mans[map[y][x]];
	h += man.text;
	map[newY][newX] = map[y][x];
	delete map[y][x];
	if (man.my == 1) {
		var mumTo = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
		newX = 8-newX;
		h += mumTo[8-x];
		if (newY > y) {
			h += "退";
			if (man.pater == "m" || man.pater == "s" || man.pater == "x") {
				h += mumTo[newX];
			} else {
				h += mumTo[newY - y - 1];
			}
		} else if (newY < y) {
			h += "进";
			if (man.pater == "m" || man.pater == "s" || man.pater == "x") {
				h += mumTo[newX];
			} else {
				h += mumTo[y - newY - 1];
			}
		} else {
			h += "平";
			h += mumTo[newX];
		}
	} else {
		var mumTo = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
		h += mumTo[x];
		if (newY > y) {
			h += "进";
			if (man.pater == "M" || man.pater == "S" || man.pater == "X") {
				h += mumTo[newX];
			} else {
				h += mumTo[newY - y - 1];
			}
		} else if (newY < y) {
			h += "退";
			if (man.pater == "M" || man.pater == "S" || man.pater == "X") {
				h += mumTo[newX];
			} else {
				h += mumTo[y - newY - 1];
			}
		} else {
			h += "平";
			h += mumTo[newX];
		}
	}
	return h;
}

// 初始时的象棋棋盘
com.initMap = [
	['C0', 'M0', 'X0', 'S0', 'J0', 'S1', 'X1', 'M1', 'C1'],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    , 'P0',     ,     ,     ,     ,     , 'P1',     ],
	['Z0',     , 'Z1',     , 'Z2',     , 'Z3',     , 'Z4'],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	['z0',     , 'z1',     , 'z2',     , 'z3',     , 'z4'],
	[    , 'p0',     ,     ,     ,     ,     , 'p1',     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	['c0', 'm0', 'x0', 's0', 'j0', 's1', 'x1', 'm1', 'c1']
];

// 各个棋子
com.keys = {
	"c0": "c", "c1": "c",
	"m0": "m", "m1": "m",
	"x0": "x", "x1": "x",
	"s0": "s", "s1": "s",
	"j0": "j",
	"p0": "p", "p1": "p",
	"z0": "z", "z1": "z", "z2": "z", "z3": "z", "z4": "z", "z5": "z",

	"C0": "C", "C1": "C",
	"M0": "M", "M1": "M",
	"X0": "X", "X1": "X",
	"S0": "S", "S1": "S",
	"J0": "J",
	"P0": "P", "P1": "P",
	"Z0": "Z", "Z1": "Z", "Z2": "Z", "Z3": "Z", "Z4": "Z", "Z5": "Z",
}

// 棋子能走的着点
com.bylaw = {};

// 判断车能走的着点
com.bylaw.c = function(x, y, map, my) {
	var d = [];

	// 左侧检索
	for (var i = x-1; i >= 0; i--) {
		if (map[y][i]) {
			if (com.mans[map[y][i]].my != my)
				d.push([i, y]);
			break;
		} else {
			d.push([i, y]);
		}
	}
	// 右侧检索
	for (var i = x+1; i <= 8; i++) {
		if (map[y][i]) {
			if (com.mans[map[y][i]].my != my)
				d.push([i, y]);
			break;
		} else {
			d.push([i, y]);
		}
	}
	// 上方检索
	for (var i = y-1; i >= 0; i--) {
		if (map[i][x]) {
			if (com.mans[map[i][x]].my != my)
				d.push([x, i]);
			break;
		} else {
			d.push([x, i]);
		}
	}
	// 下方检索
	for (var i = y+1; i <= 9; i++) {
		if (map[i][x]) {
			if (com.mans[map[i][x]].my != my)
				d.push([x, i]);
			break;
		} else {
			d.push([x, i]);
		}
	}

	return d;
}

// 判断马能走的着点
com.bylaw.m = function(x, y, map, my) {
	var d = [];

	// 1点方向
	if (y-2 >= 0 && x+1 <= 8 && !play.map[y-1][x] && (!com.mans[map[y-2][x+1]] || com.mans[map[y-2][x+1]].my != my))
		d.push([x+1, y-2]);
	// 2点方向
	if (y-1 >= 0 && x+2 <= 8 && !play.map[y][x+1] && (!com.mans[map[y-1][x+2]] || com.mans[map[y-1][x+2]].my != my))
		d.push([x+2, y-1]);
	// 4点方向
	if (y+1 <= 9 && x+2 <= 8 && !play.map[y][x+1] && (!com.mans[map[y+1][x+2]] || com.mans[map[y+1][x+2]].my != my))
		d.push([x+2, y+1]);
	// 5点方向
	if (y+2 <= 9 && x+1 <= 8 && !play.map[y+1][x] && (!com.mans[map[y+2][x+1]] || com.mans[map[y+2][x+1]].my != my))
		d.push([x+1, y+2]);
	// 7点方向
	if (y+2 <= 9 && x-1 >= 0 && !play.map[y+1][x] && (!com.mans[map[y+2][x-1]] || com.mans[map[y+2][x-1]].my != my))
		d.push([x-1, y+2]);
	// 8点方向
	if (y+1 <= 9 && x-2 >= 0 && !play.map[y][x-1] && (!com.mans[map[y+1][x-2]] || com.mans[map[y+1][x-2]].my != my))
		d.push([x-2, y+1]);
	// 10点方向
	if (y-1 >= 0 && x-2 >= 0 && !play.map[y][x-1] && (!com.mans[map[y-1][x-2]] || com.mans[map[y-1][x-2]].my != my))
		d.push([x-2, y-1]);
	// 11点方向
	if (y-2 >= 0 && x-1 >= 0 && !play.map[y-1][x] && (!com.mans[map[y-2][x-1]] || com.mans[map[y-2][x-1]].my != my))
		d.push([x-1, y-2]);

	return d;
}

// 判断相能走的着点
com.bylaw.x = function(x, y, map, my) {
	var d = [];

	if (my === 1) { // 红方
		// 4点半方向
		if (y+2 <= 9 && x+2 <= 8 && !play.map[y+1][x+1] && (!com.mans[map[y+2][x+2]] || com.mans[map[y+2][x+2]].my != my))
			d.push([x+2, y+2]);
		// 7点半方向
		if (y+2 <= 9 && x-2 >= 0 && !play.map[y+1][x-1] && (!com.mans[map[y+2][x-2]] || com.mans[map[y+2][x-2]].my != my))
			d.push([x-2, y+2]);
		// 1点半方向
		if (y-2 >= 5 && x+2 <= 8 && !play.map[y-1][x+1] && (!com.mans[map[y-2][x+2]] || com.mans[map[y-2][x+2]].my != my))
			d.push([x+2, y-2]);
		// 10点半方向
		if (y-2 >= 5 && x-2 >= 0 && !play.map[y-1][x-1] && (!com.mans[map[y-2][x-2]] || com.mans[map[y-2][x-2]].my != my))
			d.push([x-2, y-2]);
	} else {
		// 4点半方向
		if (y+2 <= 4 && x+2 <= 8 && !play.map[y+1][x+1] && (!com.mans[map[y+2][x+2]] || com.mans[map[y+2][x+2]].my != my))
			d.push([x+2, y+2]);
		// 7点半方向
		if (y+2 <= 4 && x-2 >= 0 && !play.map[y+1][x-1] && (!com.mans[map[y+2][x-2]] || com.mans[map[y+2][x-2]].my != my))
			d.push([x-2, y+2]);
		// 1点半方向
		if (y-2 >= 0 && x+2 <= 8 && !play.map[y-1][x+1] && (!com.mans[map[y-2][x+2]] || com.mans[map[y-2][x+2]].my != my))
			d.push([x+2, y-2]);
		// 10点半方向
		if (y-2 >= 0 && x-2 >= 0 && !play.map[y-1][x-1] && (!com.mans[map[y-2][x-2]] || com.mans[map[y-2][x-2]].my != my))
			d.push([x-2, y-2]);
	}

	return d;
}

// 判断士能走的着点
com.bylaw.s = function(x, y, map, my) {
	var d = [];

	if (my === 1) { // 红方
		// 4点半方向
		if (y+1 <= 9 && x+1 <= 5 && (!com.mans[map[y+1][x+1]] || com.mans[map[y+1][x+1]].my != my))
			d.push([x+1, y+1]);
		// 7点半方向
		if (y+1 <= 9 && x-1 >= 3 && (!com.mans[map[y+1][x-1]] || com.mans[map[y+1][x-1]].my != my))
			d.push([x-1, y+1]);
		// 1点半方向
		if (y-1 >= 7 && x+1 <= 5 && (!com.mans[map[y-1][x+1]] || com.mans[map[y-1][x+1]].my != my))
			d.push([x+1, y-1]);
		// 10点半方向
		if (y-1 >= 7 && x-1 >= 3 && (!com.mans[map[y-1][x-1]] || com.mans[map[y-1][x-1]].my != my))
			d.push([x-1, y-1]);
	} else {
		// 4点半方向
		if (y+1 <= 2 && x+1 <= 5 && (!com.mans[map[y+1][x+1]] || com.mans[map[y+1][x+1]].my != my))
			d.push([x+1, y+1]);
		// 7点半方向
		if (y+1 <= 2 && x-1 >= 3 && (!com.mans[map[y+1][x-1]] || com.mans[map[y+1][x-1]].my != my))
			d.push([x-1, y+1]);
		// 1点半方向
		if (y-1 >= 0 && x+1 <= 5 && (!com.mans[map[y-1][x+1]] || com.mans[map[y-1][x+1]].my != my))
			d.push([x+1, y-1]);
		// 10点半方向
		if (y-1 >= 0 && x-1 >= 3 && (!com.mans[map[y-1][x-1]] || com.mans[map[y-1][x-1]].my != my))
			d.push([x-1, y-1]);
	}
	return d;
}

// 判断将能走的着点
com.bylaw.j = function(x, y, map, my) {
	var d = [];
	var isNull = (function(y1, y2) {
		var y1 = com.mans["j0"].y;
		var x1 = com.mans["J0"].x;
		var y2 = com.mans["J0"].y;
		for (var i = y1-1; i > y2; i--) {
			if (map[i][x1])
				return false;
		}
		return true;
	})();

	if (my === 1) { // 红方
		// 下
		if (y+1 <= 9 && (!com.mans[map[y+1][x]] || com.mans[map[y+1][x]].my != my))
			d.push([x, y+1]);
		// 上
		if (y-1 >= 7 && (!com.mans[map[y-1][x]] || com.mans[map[y-1][x]].my != my))
			d.push([x, y-1]);
		// 老将对老将的情况
		if (com.mans["j0"].x == com.mans["J0"].x && isNull)
			d.push([com.mans["J0"].x, com.mans["J0"].y]);
	} else {
		// 下
		if (y+1 <= 2 && (!com.mans[map[y+1][x]] || com.mans[map[y+1][x]].my != my))
			d.push([x, y+1]);
		// 上
		if (y-1 >= 0 && (!com.mans[map[y-1][x]] || com.mans[map[y-1][x]].my != my))
			d.push([x, y-1]);
		// 老将对老将的情况
		if (com.mans["j0"].x == com.mans["J0"].x && isNull)
			d.push([com.mans["j0"].x, com.mans["j0"].y]);
	}
	// 右
	if (x+1 <= 5 && (!com.mans[map[y][x+1]] || com.mans[map[y][x+1]].my != my))
		d.push([x+1, y]);
	// 左
	if (x-1 >= 3 && (!com.mans[map[y][x-1]] || com.mans[map[y][x-1]].my != my))
		d.push([x-1, y]);
	return d;
}

// 判断炮能走的着点
com.bylaw.p = function(x, y, map, my) {
	var d = [];

	// 左侧检索
	var n = 0;
	for (var i = x-1; i >= 0; i--) {
		if (map[y][i]) {
			if (n == 0) {
				n++;
				continue;
			} else {
				if (com.mans[map[y][i]].my != my)
					d.push([i, y]);
				break;
			}
		} else {
			if (n == 0)
				d.push([i, y]);
		}
	}
	// 右侧检索
	var n = 0;
	for (var i = x+1; i <= 8; i++) {
		if (map[y][i]) {
			if (n == 0) {
				n++;
				continue;
			} else {
				if (com.mans[map[y][i]].my != my)
					d.push([i, y]);
				break;
			}
		} else {
			if (n == 0)
				d.push([i, y]);
		}
	}
	// 上方检索
	var n = 0;
	for (var i = y-1; i >= 0; i--) {
		if (map[i][x]) {
			if (n == 0) {
				n++;
				continue;
			} else {
				if (com.mans[map[i][x]].my != my)
					d.push([x, i]);
				break;
			}
		} else {
			if (n == 0)
				d.push([x, i]);
		}
	}
	// 下方检索
	var n = 0;
	for (var i = y+1; i <= 9; i++) {
		if (map[i][x]) {
			if (n == 0) {
				n++;
				continue;
			} else {
				if (com.mans[map[i][x]].my != my)
					d.push([x, i]);
				break;
			}
		} else {
			if (n == 0)
				d.push([x, i]);
		}
	}

	return d;
}

// 判断卒能走的着点
com.bylaw.z = function(x, y, map, my) {
	var d = [];

	if (my === 1) { // 红方
		// 上
		if (y-1 >= 0 && (!com.mans[map[y-1][x]] || com.mans[map[y-1][x]].my != my))
			d.push([x, y-1]);
		// 右
		if (x+1 <= 8 && y <= 4 && (!com.mans[map[y][x+1]] || com.mans[map[y][x+1]].my != my))
			d.push([x+1, y]);
		// 左
		if (x-1 >= 0 && y <= 4 && (!com.mans[map[y][x-1]] || com.mans[map[y][x-1]].my != my))
			d.push([x-1, y]);
	} else {
		// 下
		if (y+1 <= 9 && (!com.mans[map[y+1][x]] || com.mans[map[y+1][x]].my != my))
			d.push([x, y+1]);
		// 右
		if (x+1 <= 8 && y >= 6 && (!com.mans[map[y][x+1]] || com.mans[map[y][x+1]].my != my))
			d.push([x+1, y]);
		// 左
		if (x-1 >= 0 && y >= 6 && (!com.mans[map[y][x-1]] || com.mans[map[y][x-1]].my != my))
			d.push([x-1, y]);
	}

	return d;
}

// value矩阵表示不同棋子在不同位置上的价值
com.value = {
	// 车的价值
	c: [
		[206, 208, 207, 213, 214, 213, 207, 208, 206],
		[206, 212, 209, 216, 233, 216, 209, 212, 206],
		[206, 208, 207, 214, 216, 214, 207, 208, 206],
		[206, 213, 213, 216, 216, 216, 213, 213, 206],
		[208, 211, 211, 214, 215, 214, 211, 211, 208],

		[208, 212, 212, 214, 215, 214, 212, 212, 208],
		[204, 209, 204, 212, 214, 212, 204, 209, 204],
		[198, 208, 204, 212, 212, 212, 204, 208, 198],
		[200, 208, 206, 212, 200, 212, 206, 208, 200],
		[194, 206, 204, 212, 200, 212, 204, 206, 194]
	],

	// 马的价值
	m: [
		[90,  90,  90,  96,  90,  96,  90,  90, 90],
		[90,  96, 103,  97,  94,  97, 103,  96, 90],
		[92,  98,  99, 103,  99, 103,  99,  98, 92],
		[93, 108, 100, 107, 100, 107, 100, 108, 93],
		[90, 100,  99, 103, 104, 103,  99, 100, 90],

		[90, 98, 101, 102, 103, 102, 101, 98, 90],
		[92, 94,  98,  95,  98,  95,  98, 94, 92],
		[93, 92,  94,  95,  92,  95,  94, 92, 93],
		[85, 90,  92,  93,  78,  93,  92, 90, 85],
		[88, 85,  90,  88,  90,  88,  90, 85, 88]
	],

	// 相的价值
	x: [
		[ 0, 0, 20, 0,  0, 0, 20, 0,  0],
		[ 0, 0,  0, 0,  0, 0,  0, 0,  0],
		[18, 0,  0, 0, 23, 0,  0, 0, 18],
		[ 0, 0,  0, 0,  0, 0,  0, 0,  0],
		[ 0, 0, 20, 0,  0, 0, 20, 0,  0],

		[ 0, 0, 20, 0,  0, 0, 20, 0,  0],
		[ 0, 0,  0, 0,  0, 0,  0, 0,  0],
		[18, 0,  0, 0, 23, 0,  0, 0, 18],
		[ 0, 0,  0, 0,  0, 0,  0, 0,  0],
		[ 0, 0, 20, 0,  0, 0, 20, 0,  0]
	],

	// 士的价值
	s: [
		[0, 0, 0, 20,  0, 20, 0, 0, 0],
		[0, 0, 0,  0, 23,  0, 0, 0, 0],
		[0, 0, 0, 20,  0, 20, 0, 0, 0],
		[0, 0, 0,  0,  0,  0, 0, 0, 0],
		[0, 0, 0,  0,  0,  0, 0, 0, 0],

		[0, 0, 0,  0,  0,  0, 0, 0, 0],
		[0, 0, 0,  0,  0,  0, 0, 0, 0],
		[0, 0, 0, 20,  0, 20, 0, 0, 0],
		[0, 0, 0,  0, 23,  0, 0, 0, 0],
		[0, 0, 0, 20,  0, 20, 0, 0, 0]
	],

	// 将的价值
	j: [
		[0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
		[0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
		[0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
		[0, 0, 0,    0,    0,    0, 0, 0, 0],
		[0, 0, 0,    0,    0,    0, 0, 0, 0],

		[0, 0, 0,    0,    0,    0, 0, 0, 0],
		[0, 0, 0,    0,    0,    0, 0, 0, 0],
		[0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
		[0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
		[0, 0, 0, 8888, 8888, 8888, 0, 0, 0]
	],

	// 炮的价值
	p: [
		[100, 100, 96, 91,  90, 91, 96, 100, 100],
		[ 98,  98, 96, 92,  89, 92, 96,  98,  98],
		[ 97,  97, 96, 91,  92, 91, 96,  97,  97],
		[ 96,  99, 99, 98, 100, 98, 99,  99,  96],
		[ 96,  96, 96, 96, 100, 96, 96,  96,  96],

		[95, 96,  99, 96, 100, 96,  99, 96, 95],
		[96, 96,  96, 96,  96, 96,  96, 96, 96],
		[97, 96, 100, 99, 101, 99, 100, 96, 97],
		[96, 97,  98, 98,  98, 98,  98, 97, 96],
		[96, 96,  97, 99,  99, 99,  97, 96, 96]
	],

	// 卒的价值
	z: [
		[ 9,  9,  9, 11, 13, 11,  9,  9,  9],
		[19, 24, 34, 42, 44, 42, 34, 24, 19],
		[19, 24, 32, 37, 37, 37, 32, 24, 19],
		[19, 23, 27, 29, 30, 29, 27, 23, 19],
		[14, 18, 20, 27, 29, 27, 20, 18, 14],

		[7, 0, 13, 0, 16, 0, 13, 0, 7],
		[7, 0,  7, 0, 15, 0,  7, 0, 7],
		[0, 0,  0, 0,  0, 0,  0, 0, 0],
		[0, 0,  0, 0,  0, 0,  0, 0, 0],
		[0, 0,  0, 0,  0, 0,  0, 0, 0]
	]
};

// 黑子的棋子价值矩阵即为红子价值矩阵的倒置
com.value.C = com.arr2Clone(com.value.c).reverse();
com.value.M = com.arr2Clone(com.value.m).reverse();
com.value.X = com.value.x; // 若矩阵本身就对称则可直接赋值过来
com.value.S = com.value.s;
com.value.J = com.value.j;
com.value.P = com.arr2Clone(com.value.p).reverse();
com.value.Z = com.arr2Clone(com.value.z).reverse();

// 各个棋子的详细信息
com.args = {
	// 红子的详细信息，包括其中文，图片路径，阵营，属性，权重
	'c': {text: "车", img: 'r_c', my: 1, bl: "c", value: com.value.c},
	'm': {text: "马", img: 'r_m', my: 1, bl: "m", value: com.value.m},
	'x': {text: "相", img: 'r_x', my: 1, bl: "x", value: com.value.x},
	's': {text: "仕", img: 'r_s', my: 1, bl: "s", value: com.value.s},
	'j': {text: "将", img: 'r_j', my: 1, bl: "j", value: com.value.j},
	'p': {text: "炮", img: 'r_p', my: 1, bl: "p", value: com.value.p},
	'z': {text: "兵", img: 'r_z', my: 1, bl: "z", value: com.value.z},

	// 黑子的详细信息，包括其中文，图片路径，阵营，属性，权重
	'C': {text: "車", img: 'b_c', my: -1, bl: "c", value: com.value.C},
	'M': {text: "馬", img: 'b_m', my: -1, bl: "m", value: com.value.M},
	'X': {text: "象", img: 'b_x', my: -1, bl: "x", value: com.value.X},
	'S': {text: "士", img: 'b_s', my: -1, bl: "s", value: com.value.S},
	'J': {text: "帅", img: 'b_j', my: -1, bl: "j", value: com.value.J},
	'P': {text: "炮", img: 'b_p', my: -1, bl: "p", value: com.value.P},
	'Z': {text: "卒", img: 'b_z', my: -1, bl: "z", value: com.value.Z}
};

com.class = com.class || {}; // 声明类

// Man类用于管理棋子
com.class.Man = function(key, x, y) {
	this.pater = key.slice(0, 1);
	var o = com.args[this.pater];
	this.x = x || 0;
	this.y = y || 0;
	this.key = key;
	this.my = o.my;
	this.text = o.text;
	this.value = o.value;
	this.isShow = true;
	this.alpha = 1;
	this.ps = []; // 着点

	// 显示棋子
	this.show = function() {
		if (this.isShow) {
			com.ct.save();
			com.ct.globalAlpha = this.alpha;
			com.ct.drawImage(com[this.pater].img, com.spaceX * this.x + com.pointStartX, com.spaceY * this.y + com.pointStartY);
			com.ct.restore();
		}
	}

	// 获取棋子可走的着点
	this.bl = function(map) {
		var map = map || play.map;
		return com.bylaw[o.bl](this.x, this.y, map, this.my);
	}
}

// Bg类用于管理棋盘
com.class.Bg = function(img, x, y) {
	this.x = x || 0;
	this.y = y || 0;
	this.isShow = true;

	// 显示棋盘
	this.show = function() {
		if (this.isShow)
			com.ct.drawImage(com.bgImg, com.spaceX * this.x, com.spaceY * this.y);
	}
}

// Pane类用于管理棋子外框
com.class.Pane = function(img, x, y) {
	this.x = x || 0;
	this.y = y || 0;
	this.newX = x || 0;
	this.newY = y || 0;
	this.isShow = true;

	// 显示棋子外框
	this.show = function() {
		if (this.isShow) {
			com.ct.drawImage(com.paneImg, com.spaceX * this.x + com.pointStartX, com.spaceY * this.y + com.pointStartY);
			com.ct.drawImage(com.paneImg, com.spaceX * this.newX + com.pointStartX, com.spaceY * this.newY + com.pointStartY);
		}
	}
}

// Dot类用于管理提示点
com.class.Dot = function(img, x, y) {
	this.x = x || 0;
	this.y = y || 0;
	this.isShow = true;
	this.dots = [];

	// 显示提示点
	this.show = function() {
		for (var i = 0; i < this.dots.length; i++) {
			if (this.isShow)
				com.ct.drawImage(com.dotImg, com.spaceX * this.dots[i][0] + 10 + com.pointStartX,
					com.spaceY * this.dots[i][1] + 10 + com.pointStartY);
		}
	}
}

// 进行整个游戏的初始化
com.init();

// 以下为设置的几个残局，需手动强行切换棋盘方能进行
com.initMap1 = [
	[    ,     ,     , 'J0',     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     , 'c0',     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     , 's0',     ,     , 'C0',     ],
	[    ,     ,     , 's1',     , 'j0',     ,     ,     ]
];

com.initMap2 = [
	[    ,     , 'c0',     ,     ,     ,     ,     ,     ],
	[    ,     ,     , 'J0', 'S0',     ,     ,     ,     ],
	[    ,     ,     , 'S1',     ,     ,     ,     ,     ],
	[    ,     ,     , 'M0',     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     , 'j0',     ,     ,     ,     ,     ]
];

com.initMap3 = [
	[    ,     ,     ,     ,     , 'S0',     ,     ,     ],
	[    ,     ,     ,     , 'J0',     ,     ,     ,     ],
	[    ,     ,     , 'z0',     , 'S1',     ,     ,     ],
	[    ,     ,     ,     , 'Z0',     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	['M0',     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     , 'p0',     ,     ,     ],
	[    ,     ,     ,     , 'Z1',     ,     ,     ,     ],
	[    ,     ,     , 'j0',     ,     ,     ,     ,     ]
];

com.initMap4 = [
	[    ,     ,     , 'J0',     , 'S0',     ,     ,     ],
	[    ,     ,     ,     , 'S1',     , 'C0',     ,     ],
	[    ,     ,     ,     , 'z0',     ,     ,     ,     ],
	[    , 'c0',     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     , 'x0',     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     , 'j0',     ,     ,     ,     ]
];

com.initMap5 = [
	[    ,     ,     , 'S0', 'J0',     , 'm0', 'C0', 'p0'],
	[    ,     ,     ,     , 'S1',     ,     ,     ,     ],
	[    ,     ,     ,     , 'X0',     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     , 'Z0',     , 'C1',     ,     ,     ,     ],
	[    ,     ,     , 'j0',     ,     ,     ,     ,     ]
];

com.initMap6 = [
	[    ,     ,     , 'S0', 'J0',     , 'X0',     ,     ],
	[    ,     ,     , 'c0', 'S1',     ,     ,     , 'p0'],
	[    ,     ,     ,     ,     ,     , 'M0',     , 'X1'],
	[    , 'c1',     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     , 'C0', 'Z0',     , 'Z1',     ,     ,     ],
	[    ,     ,     ,     , 'j0',     ,     ,     ,     ]
];

com.initMap7 = [
	[    ,     ,     ,     , 'J0',     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     , 'j0',     ,     ,     ,     ]
];

// 以下为设置的一些非常有意思的局面，可供大家挑战，也需强行手动切换

// 局一 气吞关右
com.initMap01 = [
	[    ,     , 'X0', 'S0', 'J0', 'S1',     ,     ,     ],
	[    ,     ,     , 'z0',     ,     ,     , 'm0',     ],
	['X1', 'm1',     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     , 'M0', 'P0'],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     , 'p0',     , 'z1',     ,     ],
	['z2',     ,     ,     ,     ,     , 'M1',     , 'z3'],
	['x0',     ,     ,     , 'c0',     ,     ,     , 'x1'],
	[    ,     ,     ,     , 's0', 'Z0', 'C0',     ,     ],
	[    ,     , 'c1', 's1', 'j0',     ,     ,     , 'P1']
];

// 局二 马蹀阏氏
com.initMap02 = [
	['p0',     ,     ,     , 'J0', 'S0', 'X0',     ,     ],
	[    ,     ,     ,     , 'S1',     ,     ,     ,     ],
	['M0',     ,     ,     , 'P0',     , 'M1',     ,     ],
	['Z0',     ,     , 'm0', 'Z1',     , 'Z2',     ,     ],
	[    , 'c0',     ,     ,     ,     , 'z0',     ,     ],
	[    , 'c1',     ,     ,     ,     ,     ,     ,     ],
	['z1',     ,     ,     , 'z2',     ,     ,     ,     ],
	[    ,     ,     ,     , 'x0',     ,     ,     ,     ],
	[    ,     , 'p1', 'Z3',     , 'Z4',     ,     ,     ],
	['P1',     , 'C0', 's0', 'j0',     , 'm1',     ,     ]
];

// 局三 羝羊触藩
com.initMap03 = [
	[    , 'C0', 'X0', 'P0', 'J0', 'S0', 'z0',     ,     ],
	[    ,     ,     , 'z1', 'S1', 'z2',     , 'C1',     ],
	[    , 'z3',     ,     , 'X1',     ,     ,     ,     ],
	[    , 'c0',     ,     ,     ,     ,     ,     ,     ],
	['m0', 'M0',     ,     ,     ,     ,     ,     ,     ],
	['p0', 'c1', 'x0', 'Z0',     , 'M1',     ,     ,     ],
	[    ,     ,     ,     , 'p1',     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     , 'Z1',     , 'Z2',     ,     ],
	[    , 'P1',     ,     ,     , 'j0',     ,     ,     ]
];

// 局四 良将安边
com.initMap04 = [
	[    ,     , 'X0', 'J0',     , 'S0', 'X1',     ,     ],
	[    ,     ,     ,     , 'S1',     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	['Z0',     , 'z0',     ,     ,     ,     ,     ,     ],
	[    ,     ,     , 'm0', 'p0',     ,     ,     ,     ],
	[    ,     ,     ,     , 'z1', 'Z1',     ,     ,     ],
	['z2',     ,     ,     ,     ,     , 'M0',     ,     ],
	[    ,     ,     ,     , 'x0',     ,     ,     , 'm1'],
	[    ,     ,     ,     , 's0', 'C0',     ,     ,     ],
	[    , 'c0', 'x1', 's1', 'j0',     ,     , 'P0', 'C1']
];

// 局五 群鼠争穴
com.initMap05 = [
	[    ,     ,     , 'J0',     ,     , 'X0',     ,     ],
	[    ,     ,     ,     , 'z0',     ,     ,     ,     ],
	['P0', 'C0', 'c0',     , 'X1',     ,     , 'c1', 'P1'],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    ,     ,     ,     ,     ,     ,     ,     ,     ],
	[    , 'p0',     ,     ,     , 'm0',     , 'p1',     ],
	[    ,     ,     ,     , 'Z0',     , 'C1',     ,     ],
	[    ,     , 'Z1',     ,     , 'j0',     ,     ,     ]
];