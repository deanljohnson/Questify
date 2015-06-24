/**
 * Created by Dean on 6/21/2015.
 */

var QUESTIFY = (function (QUESTIFY) {
	function createQuestGenerator() {
		var that = {},
			motivations = {},
			strategies = {},
			atomicActions = {},
			compoundActions = {},
			conditionFunctions = {},
			onParseActions = {};

		function selectMotivation(subjectNPC) {
			var index = Math.floor(Math.random() * subjectNPC.motivations.length);
			return subjectNPC.motivations[index];
		}

		function parseArgument(arg, selectedObj, entities) {
			var pieces = arg.split(':'),
				type = pieces[0],
				id = pieces[1],
				propString,
				typeArr = [],
				argObject;

			//Check if an entity with this id hasn't been selected before.
			//If one hasn't been, select it.
			if (!(selectedObj.hasOwnProperty(id))) {
				if (!(type in entities)) {
					throw new Error("The specified type: " + type + " was not defined in the entities object passed to generateQuest()");
				}

				typeArr = entities[type];
				selectedObj[id] = typeArr[Math.floor(Math.random() * typeArr.length)];
			}

			argObject = selectedObj[id];

			//If any specific property was specified, assign that to argObject
			//Continue until the property chain ends or the object does not have that property
			for (var p = 2, pl = pieces.length; p < pl; p++) {
				propString = pieces[p];

				if (argObject.hasOwnProperty(propString)) {
					argObject = argObject[propString];
				}
			}

			return argObject;
		}

		function parseActionArgs(actionArgs, variablesObj, entities) {
			var actionArgsAsObjects = [],
				conditionArgsAsObjects = [];

			//Loops through the conditions for the action
			for (var c = 0, cl = actionArgs.length; c < cl; c++) {
				var currentConditionArgsArr = actionArgs[c];
				conditionArgsAsObjects = [];

				for (var a = 0, al = currentConditionArgsArr.length; a < al; a++) {
					var currentArg = currentConditionArgsArr[a];

					conditionArgsAsObjects.push(parseArgument(currentArg, variablesObj, entities));
				}

				actionArgsAsObjects.push(conditionArgsAsObjects);
			}

			return actionArgsAsObjects;
		}

		function parseAndExecuteParseAction(parseActionStringArr, variablesObj, entities) {
			if (!(parseActionStringArr[0] in onParseActions)) {
				console.log("The generation action '" + parseActionStringArr[0] + "' does not exist!");
				return;
			}

			var parseAction = onParseActions[parseActionStringArr[0]],
				argString,
				args = [];

			for (var g = 1, gl = parseActionStringArr.length; g < gl; g++) {
				argString = parseActionStringArr[g];
				args.push(parseArgument(argString, variablesObj, entities));
			}

			parseAction.apply(this, args);
		}

		that.motivations = motivations;
		that.strategies = strategies;
		that.atomicActions = atomicActions;
		that.compoundActions = compoundActions;
		that.conditionFunctions = conditionFunctions;
		that.onParseActions = onParseActions;

		that.generateQuest = function(player, subjectNPC, entities, forcedStrategy) {
			var motivation = selectMotivation(subjectNPC),
				strategy = forcedStrategy || motivation.selectStrategy(),
				currentActionsAndArgsObj,
				actionString,
				actionArgs,
				actions = [],
				argsArr = [],
				variablesObj = {pc: player, giver: subjectNPC, start: subjectNPC.location},
				s, sl;

			//For every action in the strategy, get it's action function and the arguments to that action
			for (s = 0, sl = strategy.actionsAndArgs.length; s < sl; s++) {
				currentActionsAndArgsObj = strategy.actionsAndArgs[s];

				if (currentActionsAndArgsObj.hasOwnProperty('atomicAction')) {
					//Add the current action for this quest
					actionString = currentActionsAndArgsObj.atomicAction;
					actions.push(this.atomicActions[actionString]);

					//Check for the existence of arguments
					if (!('actionArgs' in currentActionsAndArgsObj)) {
						console.log("An action wasn't given any arguments to pass to it's condition functions!");
					}

					//Now add it's arguments
					actionArgs = currentActionsAndArgsObj.actionArgs;
					argsArr.push(parseActionArgs(actionArgs, variablesObj, entities));

					//If an onParseAction is defined for this action, parse and execute it
					if ('onParseAction' in currentActionsAndArgsObj) {
						parseAndExecuteParseAction(currentActionsAndArgsObj.onParseAction, variablesObj, entities);
					}
				}
			}

			return QUESTIFY.createQuest(actions, argsArr);
		};

		return that;
	}

	QUESTIFY.createQuestGenerator = createQuestGenerator;

	return QUESTIFY;
}(QUESTIFY || {}));