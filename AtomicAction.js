/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createAtomicAction (preCondition, postCondition) {
		var that = {},
			started = false,
			finished = false;

		that.preCondition = preCondition;
		that.postCondition = postCondition;

		that.preConditionMet = function () {
			return this.preCondition() === true;
		};
		that.postConditionMet = function () {
			return this.postCondition() === true;
		};

		that.start = function () {
			started = true;
		};

		that.finish = function () {
			finished = true;
		};

		that.isStarted = function () {
			return started === true;
		};

		that.isFinished = function () {
			return finished === true;
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

			return newValue;
		};

		return that;
	}

	QUESTIFY.createAtomicAction = createAtomicAction;

	return QUESTIFY;
}(QUESTIFY || {}));