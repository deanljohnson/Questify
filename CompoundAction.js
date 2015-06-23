/**
 * Created by Dean on 6/22/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createCompoundAction (preCondition, postCondition, subActions) {
		var that = QUESTIFY.createAtomicAction(preCondition, postCondition);

		that.actions = actions;

		that.isFinished = function() {
			if (!(that.finished === true)) { return false; }
			for (var a = 0, al = subActions.length; a < al; a++) {
				if (!subActions[a].isFinished()) {
					return false;
				}
			}
			return true;
		};

		that.withArguments = function(pre, post) {
			var newValue = {};
			newValue.preCondition = this.preCondition;
			newValue.postCondition = this.postCondition;
			newValue.preConditionMet = this.preConditionMet;
			newValue.postConditionMet = this.postConditionMet;
			newValue.start = this.start;
			newValue.finish = this.finish;
			newValue.isStarted = this.isStarted;
			newValue.isFinished = this.isFinished;
			newValue.started = false;
			newValue.finished = false;

			newValue.preConditionArguments = pre;
			newValue.postConditionArguments = post;

			newValue.actions = this.actions;

			return newValue;
		};

		return that;
	}

	QUESTIFY.createCompoundAction = createCompoundAction;

	return QUESTIFY;
}(QUESTIFY || {}));