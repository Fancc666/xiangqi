// @author 丁浩然 <dinghaoran@tiaozhan.com>

var com = com || {};

com.init = function (style) {
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
com.get = function (id) {
	return document.getElementById(id);
}