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
				piece,
				previousObject,
				arrString,
				id,
				currentArr,
				argObject = entities;

			for (var p = 0, pl = pieces.length; p < pl; p++) {
				previousObject = argObject;
				piece = pieces[p];

				//We have an array selection to make
				if (piece.charAt(0) === "[") {
					arrString = piece.slice(1, -1);

					//increment p so we can get the id value
					p += 1;
					id = pieces[p];
					//Remove single quotes on the id
					if (id.charAt(0) === "'") {
						id = id.slice(1, -1);
					} else {
						//We want to force users to use the quotes to make sure we
						//can clearly understand their intent here
						throw new Error(id + " is not a valid id identifier and follows an array.");
					}

					//Must check for the id existing before we do more with the array string,
					//This way we can handle predefined objects (ie. DEF:pc) easily
					if (selectedObj.hasOwnProperty(id)) {
						argObject = selectedObj[id];
					} else {
						if (!previousObject.hasOwnProperty(arrString)) {
							throw new Error(previousObject + " does not have a property of " + arrString);
						}

						currentArr = previousObject[arrString];

						//Get a random value in the array. Add to selected values to track it
						argObject = currentArr[Math.floor(Math.random() * currentArr.length)];
						selectedObj[id] = argObject;
					}
				}
				//We have a property access
				else {
					id = piece;

					if (!previousObject.hasOwnProperty(id)) {
						throw new Error(previousObject + " does not have a property of " + id);
					}

					argObject = previousObject[id];
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
					actionArgs = currentActionsAndArgsObj['actionArgs'];
					argsArr.push(parseActionArgs(actionArgs, variablesObj, entities));

					//If an onParseAction is defined for this action, parse and execute it
					if (currentActionsAndArgsObj.hasOwnProperty('onParseAction')) {
						parseAndExecuteParseAction(currentActionsAndArgsObj['onParseAction'], variablesObj, entities);
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