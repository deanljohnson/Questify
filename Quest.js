/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createQuest (actions, argumentsArr) {
		var that = {},
			finishedMap = new Array(actions.length),
			actionFinishedCallback = function () {},
			questFinishedCallback = function () {};

		(function initializeFinishedMap() {
			for (var i = 0, il = finishedMap.length; i < il; i++) {
				finishedMap[i] = false;
			}
		}());

		function reportQuestFinished() {
			questFinishedCallback();
		}

		function reportActionFinished(finishedAction, args) {
			actionFinishedCallback(finishedAction, args);
		}

		function isFinished() {
			return finishedMap.indexOf(false) === -1;
		}

		function completionPercentage() {
			var finishedCount = 0;

			for (var f = 0, fl = finishedMap.length; f < fl; f++) {
				if (finishedMap[f] === true) { finishedCount++; }
			}

			return (finishedMap.length !== 0) ? finishedCount/finishedMap.length : 0;
		}

		that.actions = actions;
		that.argumentsArr = argumentsArr;

		that.updateState = function() {
			var action;
			for (var a = 0, al = actions.length; a < al; a++) {
				action = actions[a];
				if (finishedMap[a] === false) {
					finishedMap[a] = (action.update(argumentsArr[a]) === true);

					if (finishedMap[a] === false) { return; }
					if (finishedMap[a] === true) { reportActionFinished(action, argumentsArr[a]); }
				}
			}

			if (isFinished()) { reportQuestFinished(); }
		};

		that.isFinished = isFinished;
		that.completionPercentage = completionPercentage;
		that.actionFinishedCallback = actionFinishedCallback;
		that.questFinishedCallback = questFinishedCallback;

		return that;
	}

	QUESTIFY.createQuest = createQuest;

	return QUESTIFY;
}(QUESTIFY || {}));