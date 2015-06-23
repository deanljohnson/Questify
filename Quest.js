/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createQuest (actions, argumentsArr) {
		var that = {},
			finishedMap = new Array(actions.length);

		(function initializeFinishedMap() {
			for (var i = 0, il = finishedMap.length; i < il; i++) {
				finishedMap[i] = false;
			}
		}());

		that.actions = actions;
		that.argumentsArr = argumentsArr;

		that.updateState = function() {
			var action;
			for (var a = 0, al = actions.length; a < al; a++) {
				action = actions[a];
				if (finishedMap[a] === false) {
					finishedMap[a] = (action.update(argumentsArr[a]) === true);
				}
			}
		};

		that.isFinished = function() { return finishedMap.indexOf(false) === -1; };

		return that;
	}

	QUESTIFY.createQuest = createQuest;

	return QUESTIFY;
}(QUESTIFY || {}));