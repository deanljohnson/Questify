/**
 * Created by Dean on 6/21/2015.
 */

var USERTEST = (function (USERTEST) {
	"use strict";
	function createLocationBase(pos, name) {
		var that = {};

		that.position = pos;
		that.name = name || "";

		return that;
	}

	USERTEST.createLocationBase = createLocationBase;

	return USERTEST;
}(USERTEST || {}));