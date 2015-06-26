/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createStrategy (variableDefinitions, actionsObjects) {
		var that = {};

		that.variableDefinitions = variableDefinitions;
		that.actionsObjects = actionsObjects;

		return that;
	}

	QUESTIFY.createStrategy = createStrategy;

	return QUESTIFY;
}(QUESTIFY || {}));