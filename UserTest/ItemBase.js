/**
 * Created by Dean on 6/23/2015.
 */

var USERTEST = (function (USERTEST) {
	"use strict";
	function createItemBase(pos, name) {
		var that = {};

		that.position = pos || "0:0";
		that.name = name || "";

		return that;
	}

	USERTEST.createItemBase = createItemBase;

	return USERTEST;
}(USERTEST || {}));