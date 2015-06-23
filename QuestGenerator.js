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
			conditionFunctions = {};

		function selectMotivation(subjectNPC) {
			var index = Math.floor(Math.random() * subjectNPC.motivations.length);
			return subjectNPC.motivations[index];
		}

		function parseBindAndAssignArguments(bindTarget, valuesObj, givenArguments, otherNPCs, enemies, locations, objects) {
			var argument, pieces, type, id, prop, optionsArr;

			for (var p = 0, pl = givenArguments.length; p < pl; p++) {
				argument = givenArguments[p]; //The specific argument we are working on
				pieces = argument.split(":");

				type = pieces[0]; //The type the user has assigned to this argument
				id = pieces[1]; //The id the user has given to this argument
				prop = pieces[2]; //The property of the id to use as an argument

				//Create the value if it is not present
				if (!valuesObj.hasOwnProperty(id)) {
					//Set the array to use for randomly picking a source for this value
					switch (type) {
						case "NPC":
							optionsArr = otherNPCs;
							break;
						case "ENEMY":
							optionsArr = enemies;
							break;
						case "LOC":
							optionsArr = locations;
							break;
						case "OBJ":
							optionsArr = objects;
							break;
						default:
							console.log("Undefined type assigned to an action argument");
							break;
					}

					//create a new variable, randomly selected from the appropriate array
					valuesObj[id] = optionsArr[(Math.floor(Math.random() * optionsArr.length))];
				}

				if (valuesObj[id].hasOwnProperty(prop)) {
					bindTarget = bindTarget.bind(null, valuesObj[id][prop]);
					continue;
				}

				bindTarget = bindTarget.bind(null, valuesObj[id]);
			}

			return bindTarget;
		}

		function bindActionArguments(action, variables, otherNPCs, enemies, locations, objects) {
			if (action.hasOwnProperty("actions")) {

			} else {
				//Recreate so we don't overwrite the base actions
				action = QUESTIFY.createAtomicAction(action.conditions).withArguments(action.conditionArguments);

				for (var c = 0, cl = action.conditions.length; c < cl; c++) {
					action.conditions[c] = parseBindAndAssignArguments(action.conditions[c], variables, action.conditionArguments[c], otherNPCs, enemies, locations, objects);
				}
			}

			return action;
		}

		that.motivations = motivations;
		that.strategies = strategies;
		that.atomicActions = atomicActions;
		that.compoundActions = compoundActions;
		that.conditionFunctions = conditionFunctions;

		that.generateQuest = function(player, subjectNPC, otherNPCs, enemies, locations, objects, forcedStrategy) {
			var motivation = selectMotivation(subjectNPC),
				strategy = forcedStrategy || motivation.selectStrategy(),
				action,
				actions = [],
				variables = {pc: player, giver: subjectNPC, start: subjectNPC.location},
				s, sl;

			//Define any variable needed for arguments and bind the action functions to those values
			for (s = 0, sl = strategy.actions.length; s < sl; s++) {
				action = strategy.actions[s];

				action = bindActionArguments(action, variables, otherNPCs, enemies, locations, objects);

				actions.push(action);
			}

			return QUESTIFY.createQuest(actions, variables);
		};

		return that;
	}

	QUESTIFY.createQuestGenerator = createQuestGenerator;

	return QUESTIFY;
}(QUESTIFY || {}));