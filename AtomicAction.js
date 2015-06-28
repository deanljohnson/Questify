/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createActionBlueprint (conditionFunctions) {
		var that = {};

		that.conditions = conditionFunctions;

		return that;
	}

	function AtomicAction (actionBlueprint, argumentsArr, description) {
		this.conditions = actionBlueprint.conditions;
		this.conditionArguments = argumentsArr;
		this.description = description;
		this.finished = false;
	}

	AtomicAction.prototype.update = function() {
		this.finished = true;

		for (var c = 0, cl = this.conditions.length; c < cl; c++) {
			if (this.conditions[c].apply(this, this.conditionArguments[c]) !== true) {
				this.finished = false;
				return;
			}
		}

		return this.finished;
	};

	QUESTIFY.AtomicAction = AtomicAction;
	QUESTIFY.createActionBlueprint = createActionBlueprint;

	return QUESTIFY;
}(QUESTIFY || {}));