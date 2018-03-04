// @author 丁浩然 <dinghaoran@tiaozhan.com>

// 声明一个空对象play
var play = play || {};

play.init = function() {
	play.my = 1;                           // 玩家方
	play.map = com.arr2Clone(com.initMap); // 初始化棋盘
	play.nowManKey = false;                // 现在要操作的棋子
	play.pace = [];                        // 记录每一步
	play.isPlay = true;                    // 是否能走棋
	play.mans = com.mans;
	play.bylaw = com.bylaw;
	play.show = com.show;
	play.showPane = com.showPane;
	play.isOffensive = true;               // 是否先手
	play.depth = play.depth || 4;          // 搜索深度
	play.isFoul = false;                   // 是否犯规长将

	com.pane.isShow = false; // 隐藏方块

	// 初始化棋子
	for (var i = 0; i < play.map.length; i++) {
		for (var n = 0; n < play.map[i].length; n++) {
			var key = play.map[i][n];
			if (key) {
				com.mans[key].x = n;
				com.mans[key].y = i;
				com.mans[key].isShow = true;
			}
		}
	}
	play.show();

	// 绑定点击事件
	com.canvas.addEventListener("click", play.clickCanvas);

	com.get("regretBtn").addEventListener("click", function(e) {
		play.regret();
	});
}

// 悔棋
play.regret = function() {
	var map = com.arr2Clone(com.initMap);
	// 初始化所有棋子
	for (var i = 0; i < map.length; i++) {
		for (var n = 0; n < map[i].length; n++) {
			var key = map[i][n];
			if (key) {
				com.mans[key].x = n;
				com.mans[key].y = i;
				com.mans[key].isShow = true;
			}
		}
	}

	var pace = play.pace;
	pace.pop();
	pace.pop();

	for (var i = 0; i < pace.length; i++) {
		var p = pace[i].split("");
		var x = parseInt(p[0], 10);
		var y = parseInt(p[1], 10);
		var newX = parseInt(p[2], 10);
		var newY = parseInt(p[3], 10);
		var key = map[y][x];

		var cMan = map[newY][newX];
		if (cMan) {
			com.mans[map[newY][newX]].isShow = false;
		}
		com.mans[key].x = newX;
		com.mans[key].y = newY;
		map[newY][newX] = key;
		delete map[y][x];
		if (i == pace.length-1) {
			com.showPane(newX, newY, x, y);
		}
	}

	play.map = map;
	play.my = 1;
	play.isPlay = true;
	com.show();
}