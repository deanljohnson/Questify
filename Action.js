/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	function createAction (name, preCondition, postCondition) {
		var that = {};

		that.name = name;
		that.preCondition = preCondition;
		that.postCondition = postCondition;

		return that;
	}

	QUESTIFY.createAction = createAction;

	return QUESTIFY;
}(QUESTIFY || {}));