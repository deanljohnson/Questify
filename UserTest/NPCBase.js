/**
 * Created by Dean on 6/21/2015.
 */

var USERTEST = (function (USERTEST) {
	"use strict";
	function createNPCBase(name, location) {
		var that = {},
			motivations = [];

		that.name = name || "";
		that.isAlive = true;
		that.knownInformation = [];
		that.motivations = motivations;
		that.location = location || {};
		that.inventory = [];

		that.selectMotivation = function() {
			var index = Math.floor(Math.random() * motivations.length);
			return motivations[index];
		};

		return that;
	}

	USERTEST.createNPCBase = createNPCBase;

	return USERTEST;
}(USERTEST || {}));