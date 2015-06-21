/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	function createMotivation (name, chance, strategies) {
		var that = {};
		strategies = strategies || [];

		that.name = name;
		that.chance = chance;
		that.strategies = strategies;

		//Since the array of strategies is not sensitive to order,
		//this method shouldn't introduce any complications
		that.addStrategy = function(strat) {
			strategies.push(strat);
		};

		return that;
	}

	QUESTIFY.createMotivation = createMotivation;

	return QUESTIFY;
}(QUESTIFY || {}));