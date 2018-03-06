// @author 丁浩然 <dinghaoran@tiaozhan.com>

// 声明一个空对象AI
var AI = AI || {};

AI.historyTable = {}; // 历史表

// 人工智能初始化
AI.init = function(pace) {
	var bill = AI.historyBill || com.gambit; // 开局库
	if (bill.length) {
		var len = pace.length;
		var arr = [];
		// 先搜索棋谱
		for (var i = 0; i < bill.length; i++) {
			if (bill[i].slice(0, len) == pace) {
				arr.push(bill[i]);
			}
		}
		if (arr.length) {
			var inx = Math.floor(Math.random() * arr.length);
			AI.historyBill = arr;
			return arr[inx].slice(len, len+4).split("");
		} else {
			AI.historyBill = [];
		}
	}
	// 如果棋谱里面没有，人工智能开始运作
	var initTime = new Date().getTime();
	AI.treeDepth = play.depth;

	AI.number = 0;
	AI.setHistoryTable.length = 0;

	var val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);
	if (!val || val.value == -8888) {
		AI.treeDepth = 2;
		val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);
	}
	if (val && val.value != -8888) {
		var man = play.mans[val.key];
		var nowTime = new Date().getTime();
		com.get("moveInfo").innerHTML = '<h3>AI搜索结果：</h3>最佳着法：' +
			com.createMove(com.arr2Clone(play.map), man.x, man.y, val.x, val.y) +
			'<br/>搜索深度：' + AI.treeDepth +
			'<br/>搜索分支：' + AI.number +
			'个<br/>最佳着法评估：' + val.value +
			'分<br/>搜索用时：' + (nowTime - initTime) + '毫秒';
		return [man.x, man.y, val.x, val.y];
	} else {
		return false;
	}
}

// 迭代加深搜索着法
AI.iterativeSearch = function(map, my) {
	var timeOut = 100;
	var initDepth = 1;
	var maxDepth = 8;
	AI.treeDepth = 0;
	var initTime = new Date().getTime();
	var val = {};
	for (var i = initDepth; i <= maxDepth; i++) {
		var nowTime = new Date().getTime();
		AI.treeDepth = i;
		AI.autoDepth = i;
		var val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, map, my);
		if (nowTime - initTime > timeOut) {
			return val;
		}
	}
	return false;
}

// 取得棋盘上所有棋子
AI.getMapAllMan = function(map, my) {
	var mans = [];
	for (var i = 0; i < map.length; i++) {
		for (var n = 0; n < map[0].length; n++) {
			var key = map[i][n];
			if (key && play.mans[key].my == my) {
				play.mans[key].x = n;
				play.mans[key].y = i;
				mans.push(play.mans[key]);
			}
		}
	}
	return mans;
}

// 取得棋谱所有己方棋子的着法
AI.getMoves = function(map, my) {
	var manArr = AI.getMapAllMan(map, my);
	var moves = [];
	var foul = play.isFoul;
	for (var i = 0; i < manArr.length; i++) {
		var man = manArr[i];
		var val = man.bl(map);

		for (var n = 0; n < val.length; n++) {
			var x = man.x;
			var y = man.y;
			var newX = val[n][0];
			var newY = val[n][1];
			// 如果不是长将着法
			if (foul[0] != x || foul[1] != y || foul[2] != newX || foul[3] != newY) {
				moves.push([x, y, newX, newY, man.key]);
			}
		}
	}
	return moves;
}

AI.getAlphaBeta = function(A, B, depth, map, my) {
	if (depth == 0) {
		return {"value": AI.evaluate(map, my)}; // 局面评价函数
	}
	var moves = AI.getMoves(map, my); // 生成全部走法
	// 这里排序以后会增加效率

	for (var i = 0; i < moves.length; i++) {
		// 走这个走法
		var move = moves[i];
		var key = move[4];
		var oldX = move[0];
		var oldY = move[1];
		var newX = move[2];
		var newY = move[3];
		var clearKey = map[newX][newY] || "";

		map[newY][newX] = key;
		delete map[oldY][oldX];
		play.mans[key].x = newX;
		play.mans[key].y = newY;

		if (clearKey == "j0" || clearKey == "J0") {
			// 被吃老将，撤销这个走法
			play.mans[key].x = oldX;
			play.mans[key].y = oldY;
			map[oldY][oldX] = key;
			delete map[newY][newX];
			if (clearKey) {
				map[newY][newX] = clearKey;
			}

			return {"key": key, "x": newX, "y": newY, "value": 8888};
		} else {
			var val = -AI.getAlphaBeta(-B, -A, depth - 1, map, -my).value;

			// 撤销这个走法
			play.mans[key].x = oldX;
			play.mans[key].y = oldY;
			map[oldY][oldX] = key;
			delete map[newY][newX];
			if (clearKey) {
				map[newY][newX] = clearKey;
			}
			if (val >= B) {
				return {"key": key, "x": newX, "y": newY, "value": B};
			}
			if (val > A) {
				A = val; // 设置最佳走法
				if (AI.treeDepth == depth)
					var rootKey = {"key": key, "x": newX, "y": newY, "value": A};
			}
		}
	}

	if (AI.treeDepth == depth) {
		// 已经递归回根了
		if (!rootKey) {
			// AI没有最佳走法，说明AI被将死了，返回false
			return false;
		} else {
			// 这个就是最佳走法
			return rootKey;
		}
	}
	return {"key": key, "x": newX, "y": newY, "value": A};
}

// 将着法记录到历史表
AI.setHistoryTable = function(txtMap, depth, value, my) {
	AI.setHistoryTable.length++;
	AI.historyTable[txtMap] = {"depth": depth, "value": value};
}

// 评估棋局，取得棋盘双方棋子价值差
AI.evaluate = function(map, my) {
	var val = 0;
	for (var i = 0; i < map.length; i++) {
		for (var n = 0; n < map[i].length; n++) {
			var key = map[i][n];
			if (key) {
				val += play.mans[key].value[i][n] * play.mans[key].my;
			}
		}
	}
	AI.number++;
	return val * my;
}