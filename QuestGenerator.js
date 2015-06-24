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

		function defineVariable(arg, variablesObj, entities) {
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
					if (variablesObj.hasOwnProperty(id)) {
						argObject = variablesObj[id];
					} else {
						if (!previousObject.hasOwnProperty(arrString)) {
							throw new Error(previousObject + " does not have a property of " + arrString);
						}

						currentArr = previousObject[arrString];

						//Get a random value in the array. Add to selected values to track it
						argObject = currentArr[Math.floor(Math.random() * currentArr.length)];
						variablesObj[id] = argObject;
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

		function parseArgument(arg, variablesObj) {
			var tag, prop, argPieces, argObject;
			argPieces = arg.split(":");
			tag = argPieces[0];

			if (!variablesObj.hasOwnProperty(tag)) {
				throw new Error(tag + " was not defined for this strategy");
			}

			argObject = variablesObj[tag];
			//Loop through the property chain
			for (var p = 1, pl = argPieces.length; p < pl; p++) {
				prop = argPieces[p];
				if (!argObject.hasOwnProperty(prop)) {
					throw new Error(argObject + " does not have the property " + prop);
				}

				argObject = argObject[prop];
			}

			return argObject;
		}

		function parseActionArgs(actionArgs, variablesObj) {
			var actionArgsAsObjects = [],
				conditionArgsAsObjects = [],
				currentConditionArgsArr = [],
				currentArgString = "";

			//Loops through the conditions for the action
			for (var c = 0, cl = actionArgs.length; c < cl; c++) {
				currentConditionArgsArr = actionArgs[c];
				conditionArgsAsObjects = [];

				//Loop through the arguments to each condition
				for (var a = 0, al = currentConditionArgsArr.length; a < al; a++) {
					currentArgString = currentConditionArgsArr[a];
					conditionArgsAsObjects.push(parseArgument(currentArgString, variablesObj));
				}

				actionArgsAsObjects.push(conditionArgsAsObjects);
			}

			return actionArgsAsObjects;
		}

		function parseAndExecuteParseAction(parseActionStringArr, variablesObj) {
			if (!(parseActionStringArr[0] in onParseActions)) {
				throw new Error("The generation action '" + parseActionStringArr[0] + "' does not exist!");
			}

			var parseAction = onParseActions[parseActionStringArr[0]],
				argString,
				args = [];

			for (var g = 1, gl = parseActionStringArr.length; g < gl; g++) {
				argString = parseActionStringArr[g];
				args.push(parseArgument(argString, variablesObj));
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
				variableDefinitions = strategy.variableDefinitions,
				currentActionsAndArgsObj,
				actionString,
				actionArgs,
				actions = [],
				argsArr = [],
				//Initialize variablesObj with Questify's predefined quest variables
				variablesObj = {pc: player, giver: subjectNPC, start: subjectNPC.location},
				s, sl;

			//Parse variable definitions
			for (var v = 0, vl = variableDefinitions.length; v < vl; v++) {
				defineVariable(variableDefinitions[v], variablesObj, entities);
			}

			//For every action in the strategy, get it's action function and the arguments to that action
			for (s = 0, sl = strategy.actionsAndArgs.length; s < sl; s++) {
				currentActionsAndArgsObj = strategy.actionsAndArgs[s];

				if (currentActionsAndArgsObj.hasOwnProperty('atomicAction')) {
					//Add the current action for this quest
					actionString = currentActionsAndArgsObj.atomicAction;
					actions.push(atomicActions[actionString]);

					//Check for the existence of arguments
					if (!('actionArgs' in currentActionsAndArgsObj)) {
						throw new Error(actionString + " wasn't given any arguments to pass to it's condition functions!");
					}

					//Now add it's arguments
					actionArgs = currentActionsAndArgsObj['actionArgs'];
					argsArr.push(parseActionArgs(actionArgs, variablesObj));

					//If an onParseAction is defined for this action, parse and execute it
					if (currentActionsAndArgsObj.hasOwnProperty('onParseAction')) {
						parseAndExecuteParseAction(currentActionsAndArgsObj['onParseAction'], variablesObj);
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