/**
 * Created by Dean on 6/22/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createCompoundAction (actionSeries, conditionFunctions) {
		var that = {};

		that.actionSeries = actionSeries;

		that.update = function(actionSeriesIndex, conditionArrArr) {
			var finished = true;

			for (var c = 0, cl = this.conditions.length; c < cl; c++) {
				if (this.conditions[c].apply(this, conditionArrArr[c]) !== true) {
					finished = false;
					return;
				}
			}

			if (finished) { return finished; }



			return finished;
		};

		return that;
	}

	QUESTIFY.createCompoundAction = createCompoundAction;

	return QUESTIFY;
}(QUESTIFY || {}));