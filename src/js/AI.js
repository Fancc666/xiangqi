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