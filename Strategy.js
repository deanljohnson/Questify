/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	function createStrategy (name, chance, actions) {
		var that = {};
		actions = actions || [];

		that.name = name;
		that.chance = chance;
		that.actions = actions;

		return that;
	}

	QUESTIFY.createStrategy = createStrategy;

	return QUESTIFY;
}(QUESTIFY || {}));