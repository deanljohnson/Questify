/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createQuest (actions) {
		var that = {},
			finished = false;

		that.updateState = function() {
			var action,
				anyUnfinished = false;
			for (var a = 0, al = actions.length; a < al; a++) {
				action = actions[a];
				if (!action.isFinished()) {
					if (action.isStarted()) {
						if (action.hasOwnProperty("subActions")) {

						} else {
							if (action.postConditionMet()) {
								action.finish();
								continue; //We can move to the next action immediately
							}
						}
					} else if (action.preConditionMet()) {
						action.start();
					}

					anyUnfinished = true;
					break;
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