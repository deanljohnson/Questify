/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createAtomicAction (conditionFunctions) {
		var that = {};

		that.conditions = conditionFunctions;

		that.update = function(conditionArrArr) {
			var finished = true;

			for (var c = 0, cl = this.conditions.length; c < cl; c++) {
				if (this.conditions[c].apply(this, conditionArrArr[c]) !== true) {
					finished = false;
					return;
				}
			}

			return finished;
		};

		return that;
	}

	function AtomicAction (actionBlueprint, argumentsArr, description) {
		this.conditions = actionBlueprint.conditionFunctions;
		this.conditionArguments = argumentsArr;
		this.description = description;
	}

	AtomicAction.prototype.update = function() {
		for (var c = 0, cl = this.conditions.length; c < cl; c++) {
			if (this.conditions[c].apply(this, this.conditionArguments[c]) !== true) {
				return false;
			}
		}

		return true;
	};

	QUESTIFY.AtomicAction = AtomicAction;
	QUESTIFY.createActionBlueprint = createActionBlueprint;

	return QUESTIFY;
}(QUESTIFY || {}));