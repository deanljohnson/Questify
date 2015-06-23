/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	"use strict";
	function createStrategy (actionsAndArgsObjsArr) {
		var that = {};

		that.actionsAndArgs = actionsAndArgsObjsArr;

		return that;
	}

	QUESTIFY.createStrategy = createStrategy;

	return QUESTIFY;
}(QUESTIFY || {}));