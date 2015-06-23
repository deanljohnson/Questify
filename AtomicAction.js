/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createAtomicAction (conditions) {
		var that = {},
			started = false,
			finished = false;

		that.conditions = conditions;

		that.start = function () {
			started = true;
		};

		that.forceFinish = function () {
			finished = true;
		};

		that.isStarted = function () {
			return started === true;
		};

		that.isFinished = function () {
			return finished === true;
		};

		that.update = function() {
			finished = true;

			if (!this.isStarted()) { this.start(); }

			for (var c = 0, cl = this.conditions.length; c < cl; c++) {
				if (this.conditions[c]() !== true) {
					finished = false;
				}
			}

			return finished;
		};

		that.withArguments = function(conditionArguments) {
			var newValue = {};

			//Rebinding the conditions creates new functions,
			//guaranteeing we aren't going to overwrite functions
			newValue.conditions = (function (bindTo, conditionsArg) {
				var boundConditions = [];
				for (var c = 0, cl = conditionsArg.length; c < cl; c++) {
					boundConditions.push(conditionsArg[c].bind(bindTo));
				}
				return boundConditions;
			}(this, this.conditions));

			newValue.start = this.start;
			newValue.forceFinish = this.forceFinish;
			newValue.isStarted = this.isStarted;
			newValue.isFinished = this.isFinished;
			newValue.update = this.update;
			newValue.started = false;
			newValue.finished = false;

			newValue.conditionArguments = conditionArguments;

			return newValue;
		};

		return that;
	}

	QUESTIFY.createAtomicAction = createAtomicAction;

	return QUESTIFY;
}(QUESTIFY || {}));