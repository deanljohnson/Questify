/**
 * Created by Dean on 6/23/2015.
 */

var USERTEST = (function (USERTEST) {
	"use strict";
	function createItemBase(name) {
		var that = {};

		that.name = name || "";

		return that;
	}

	USERTEST.createItemBase = createItemBase;

	return USERTEST;
}(USERTEST || {}));