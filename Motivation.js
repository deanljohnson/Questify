/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createMotivation (strategies) {
		var that = {};
		strategies = strategies || [];

		that.strategies = strategies;

		//Since the array of strategies is not sensitive to order,
		//this method shouldn't introduce any complications
		that.addStrategy = function(strat) {
			strategies.push(strat);
		};

		that.selectStrategy = function() {
			var index = Math.floor(Math.random() * strategies.length);
			return strategies[index];
		};

		return that;
	}

	QUESTIFY.createMotivation = createMotivation;

	return QUESTIFY;
}(QUESTIFY || {}));