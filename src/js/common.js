// @author 丁浩然 <dinghaoran@tiaozhan.com>

var com = com || {};

com.init = function(style) {
	com.nowStyle = style || com.getCookie("style") || "style1";
	var style = com.style[com.nowStyle];
	com.width = style.width;             // 画布宽度
	com.height = style.height;           // 画布高度
	com.spaceX = style.spaceX;           // 着点X跨度
	com.spaceY = style.spaceY;           // 着点Y跨度
	com.pointStartX = style.pointStartX; // 第一个着点X坐标
	com.pointStartY = style.pointStartY; // 第一个着点Y坐标
	com.page = style.page;               // 图片目录

	com.get("box").style.width = com.width + 130 + "px";

	com.canvas = document.getElementById("chess"); // 画布
	com.ct = com.canvas.getContext("2d");
	com.canvas.width = com.width;
	com.canvas.height = com.height;

	com.childList = com.childList || [];

	com.loadImages(com.page); // 载入图片
}

// 样式
com.style = {
	style1: {
		width: 325,      // 画布宽度
		height: 402,     // 画布高度
		spaceX: 35,      // 着点X跨度
		spaceY: 36,      // 着点Y跨度
		pointStartX: 5,  // 第一个着点X坐标
		pointStartY: 19, // 第一个着点Y坐标
		page: "style_1"  // 图片目录
	},
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

// 通过id获取元素
com.get = function(id) {
	return document.getElementById(id);
}

window.onload = function() {
	com.bg = new com.class.Bg();
	com.dot = new com.class.Dot();
	com.pane = new com.class.Pane();
	com.pane.isShow = false;

	com.childList = [com.bg, com.dot, com.pane];
	com.mans = {}; // 棋子集合
	com.createMans(com.initMap); // 生成棋子
	com.bg.show();
	com.get("btnBox").style.display = "block";

	com.get("billBtn").addEventListener("click", function(e) {
		if (confirm("是否结束对局，开始棋局研究？")) {
			com.init();
			com.get("chessRight").style.display = "block";
			com.get("moveInfo").style.display = "none";
			bill.init();
		}
	});
	com.get("superPlay").addEventListener("click", function(e) {
		if (confirm("确认开始高手级对弈？")) {
			play.isPlay = true;
			com.get("chessRight").style.display = "none";
			com.get("moveInfo").style.display = "block";
			com.get("moveInfo").innerHTML = "";
			play.depth = 5;
			play.init();
		}
	});
	com.get("tyroPlay").addEventListener("click", function(e) {
		if (confirm("确认开始新手级对弈？")) {
			play.isPlay = true;
			com.get("chessRight").style.display = "none";
			com.get("moveInfo").style.display = "block";
			com.get("moveInfo").innerHTML = "";
			play.depth = 3;
			play.init();
		}
	});

	com.get("styleBtn").addEventListener("click", function(e) {
		var style = com.nowStyle;
		if (style == "style1")
			style = "style2";
		else if (style == "style2")
			style = "style1";
		com.init(style);
		com.show();
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

	com.getData("src/js/gambit.all.js", function(data) {
		com.gambit = data.split("");
		AI.historyBill = com.gambit;
	});
	com.getData("src/js/store.js", function(data) {
		com.store = data.split("");
	});
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

	document.getElementsByTagName("body")[0].style.background = "url(src/img/" + style + "/bg.jpg)";
}