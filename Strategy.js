/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createStrategy (variableDefinitions, actionsAndArgsObject) {
		var that = {};

		that.variableDefinitions = variableDefinitions;
		that.actionsAndArgs = actionsAndArgsObject;

		return that;
	}

	QUESTIFY.createStrategy = createStrategy;

	return QUESTIFY;
}(QUESTIFY || {}));