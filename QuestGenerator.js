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

		function parseArgument(arg, variablesObj, entities) {
			var pieces = arg.split(':'),
				type = pieces[0],
				id = pieces[1],
				prop = pieces.length > 2 ? pieces[2] : "NULL PROP",
				optionsArr = [];

			if (pieces.length < 2) {
				console.log("id not assigned to an action argument");
			}

			if (variablesObj.hasOwnProperty(id)) {
				if (prop !== 'NULL PROP' && variablesObj[id].hasOwnProperty(prop)) {
					return variablesObj[id][prop];
				}

				return variablesObj[id];
			} else {
				//Create the new object
				if (type in entities) {
					optionsArr = entities[type];
				} else {
					console.log("The specified argument" + type + " was not provided in the entities object passed");
				}

				//create a new variable, randomly selected from the appropriate array
				variablesObj[id] = optionsArr[(Math.floor(Math.random() * optionsArr.length))];
			}

			if (prop !== 'NULL PROP' && variablesObj[id].hasOwnProperty(prop)) {
				return variablesObj[id][prop];
			}

			return variablesObj[id];
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