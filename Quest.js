/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createQuest (actions, variables) {
		var that = {},
			finished = false;

		that.variables = variables;

		that.updateState = function() {
			var action,
				anyUnfinished = false;
			for (var a = 0, al = actions.length; a < al; a++) {
				action = actions[a];
				if (!action.isFinished()) {
					if (!action.isStarted() && action.preConditionMet()) {
						action.start();
					}

					if (action.isStarted() && action.postConditionMet()) {
						action.finish();
					} else {
						anyUnfinished = true;
						break;
					}
				}
			}

			finished = !anyUnfinished;
		};
		that.isFinished = function() { return finished; };

		return that;
	}

	QUESTIFY.createQuest = createQuest;

	return QUESTIFY;
}(QUESTIFY || {}));