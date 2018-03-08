// @author 丁浩然 <dinghaoran@tiaozhan.com>
// play.js用于游戏操作方面的控制

// 声明一个空对象play
var play = play || {};

// 用于初始化play的函数
play.init = function() {
	// play的详细信息
	play.my = 1;                           // 玩家方
	play.map = com.arr2Clone(com.initMap); // 初始化棋盘
	play.nowManKey = false;                // 现在要操作的棋子
	play.pace = [];                        // 记录每一步
	play.isPlay = true;                    // 是否能走棋
	play.mans = com.mans;                  // 记录棋子
	play.bylaw = com.bylaw;                // 寻找可行的着法
	play.show = com.show;                  // 用于显示
	play.showPane = com.showPane;          // 用于显示棋子外框
	play.isOffensive = true;               // 是否先手
	play.depth = play.depth || 4;          // 搜索深度，默认为4
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

	// 设置加入监听器，绑定点击事件
	com.canvas.addEventListener("click", play.clickCanvas);
	// clearInterval(play.timer);

	// 监听悔棋的按钮，并进行悔棋处理
	com.get("regretBtn").addEventListener("click", function(e) {
		play.regret();
	});

	// var initTime = new Date().getTime();
	// for (var i = 0; i <= 100000; i++) {
	// 	var h = play.map.join();
	// 	for (var n in play.mans) {
	// 		if (play.mans[n].show)
	// 			h += play.mans[n].key + play.mans[n].x + play.mans[n].y;
	// 	}
	// }
	// var nowTime = new Date().getTime();
	// z([h, nowTime - initTime]);
}

// 进行悔棋处理的函数
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

	// 处理记录着法的数组，撤回AI与玩家的各一步
	var pace = play.pace;
	pace.pop();
	pace.pop();

	// 遍历步数记录表，模拟恢复棋盘的情况
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

	// 将棋盘设为悔棋后的棋盘
	play.map = map;
	play.my = 1;
	play.isPlay = true;
	com.show();
}

// 管理点击棋盘事件的函数
play.clickCanvas = function(e) {
	if (!play.isPlay)
		return false;
	var key = play.getClickMan(e);
	var point = play.getClickPoint(e);

	var x = point.x;
	var y = point.y;

	if (key) {
		play.clickMan(key, x, y);
	} else {
		play.clickPoint(x, y);
	}
	play.isFoul = play.checkFoul(); // 检测是不是长将
}

// 管理点击棋子事件的函数，两种情况：选中或者吃子
play.clickMan = function(key, x, y) {
	var man = com.mans[key];
	// 吃子
	if (play.nowManKey && play.nowManKey != key && man.my != com.mans[play.nowManKey].my) {
		// man为被吃掉的棋子
		if (play.indexOfPs(com.mans[play.nowManKey].ps, [x, y])) {
			man.isShow = false;
			var pace = com.mans[play.nowManKey].x + "" + com.mans[play.nowManKey].y;
			// z(bill.createMove(play.map, man.x, man.y, x, y));
			delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
			play.map[y][x] = play.nowManKey;
			com.showPane(com.mans[play.nowManKey].x, com.mans[play.nowManKey].y, x, y);
			com.mans[play.nowManKey].x = x;
			com.mans[play.nowManKey].y = y;
			com.mans[play.nowManKey].alpha = 1;

			play.pace.push(pace + x + y);
			play.nowManKey = false;
			com.pane.isShow = false;
			com.dot.dots = [];
			com.show();
			setTimeout("play.AIPlay()", 500);
			if (key == "j0")
				play.showWin(-1);
			else if (key == "J0")
				play.showWin(1);
		}
	// 选中棋子
	} else {
		if (man.my === 1) {
			if (com.mans[play.nowManKey])
				com.mans[play.nowManKey].alpha = 1;
			man.alpha = 0.6;
			com.pane.isShow = false;
			play.nowManKey = key;
			com.mans[key].ps = com.mans[key].bl(); // 获得所有能着点
			com.dot.dots = com.mans[key].ps;
			com.show();
		}
	}
}

// 管理点击着点事件的函数
play.clickPoint = function(x, y) {
	var key = play.nowManKey;
	var man = com.mans[key];
	if (play.nowManKey) {
		if (play.indexOfPs(com.mans[key].ps, [x, y])) {
			var pace = man.x + "" + man.y;
			// z(bill.createMove(play.map, man.x, man.y, x, y));
			delete play.map[man.y][man.x];
			play.map[y][x] = key;
			com.showPane(man.x, man.y, x, y);
			man.x = x;
			man.y = y;
			man.alpha = 1;
			play.pace.push(pace + x + y);
			play.nowManKey = false;
			com.dot.dots = [];
			com.show();
			setTimeout("play.AIPlay()", 500);
		}
	}
}

// 管理AI自动走棋的函数
play.AIPlay = function() {
	play.my = -1;
	var pace = AI.init(play.pace.join(""));
	if (!pace) {
		play.showWin(1);
		return;
	}
	play.pace.push(pace.join(""));
	var key = play.map[pace[1]][pace[0]];
	play.nowManKey = key;

	var key = play.map[pace[3]][pace[2]];
	if (key) {
		play.AIclickMan(key, pace[2], pace[3]);
	} else {
		play.AIclickPoint(pace[2], pace[3]);
	}
}

// 检查是否长将的函数
play.checkFoul = function() {
	var p = play.pace;
	var len = parseInt(p.length, 10);
	if (len > 11 && p[len-1] == p[len-5] && p[len-5] == p[len-9]) {
		return p[len-4].split("");
	}
	return false;
}

// 管理AI模拟点击棋子事件的函数
play.AIclickMan = function(key, x, y) {
	var man = com.mans[key];
	// 吃子
	man.isShow = false;
	delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
	play.map[y][x] = play.nowManKey;
	play.showPane(com.mans[play.nowManKey].x, com.mans[play.nowManKey].y, x, y);

	com.mans[play.nowManKey].x = x;
	com.mans[play.nowManKey].y = y;
	play.nowManKey = false;

	com.show();
	if (key == "j0")
		play.showWin(-1);
	else if (key == "J0")
		play.showWin(1);
}

// 管理AI模拟点击着点事件的函数
play.AIclickPoint = function(x, y) {
	var key = play.nowManKey;
	var man = com.mans[key];
	if (play.nowManKey) {
		delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
		play.map[y][x] = key;

		com.showPane(man.x, man.y, x, y);

		man.x = x;
		man.y = y;
		play.nowManKey = false;
	}
	com.show();
}

// 判断点击的着点的函数
play.indexOfPs = function(ps, xy) {
	for (var i = 0; i < ps.length; i++) {
		if (ps[i][0] == xy[0] && ps[i][1] == xy[1])
			return true;
	}
	return false;
}

// 获得点击的着点的函数
play.getClickPoint = function(e) {
	var domXY = com.getDomXY(com.canvas);
	var x = Math.round((e.pageX - domXY.x - com.pointStartX - 20) / com.spaceX);
	var y = Math.round((e.pageY - domXY.y - com.pointStartY - 20) / com.spaceY);
	return {"x": x, "y": y};
}

// 获得棋子的函数
play.getClickMan = function(e) {
	var clickXY = play.getClickPoint(e);
	var x = clickXY.x;
	var y = clickXY.y;
	if (x < 0 || x > 8 || y < 0 || y > 9)
		return false;
	return (play.map[y][x] && play.map[y][x] != "0") ? play.map[y][x] : false;
}

// 对弈结束后显示胜负的函数
play.showWin = function(my) {
	play.isPlay = false;
	if (my === 1) {
		alert("恭喜你，你赢了！");
	} else {
		alert("很遗憾，你输了！");
	}
}