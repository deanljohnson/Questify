/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createStrategy (actions) {
		var that = {};
		actions = actions || [];

		that.actions = actions;

		return that;
	}

	QUESTIFY.createStrategy = createStrategy;

	return QUESTIFY;
}(QUESTIFY || {}));