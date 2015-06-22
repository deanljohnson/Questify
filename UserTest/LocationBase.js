/**
 * Created by Dean on 6/21/2015.
 */

var USERTEST = (function (USERTEST) {
	"use strict";
	function createLocationBase(pos) {
		var that = {};

		that.position = pos;

		return that;
	}

	USERTEST.createLocationBase = createLocationBase;

	return USERTEST;
}(USERTEST || {}));