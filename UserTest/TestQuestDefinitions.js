/**
 * Created by Dean on 6/21/2015.
 */

var char = USERTEST.createNPCBase(),
	npc1 = USERTEST.createNPCBase(),
	npc2 = USERTEST.createNPCBase(),
	npc3 = USERTEST.createNPCBase(),
	enemy1 = USERTEST.createNPCBase(),
	enemy2 = USERTEST.createNPCBase(),
	enemy3 = USERTEST.createNPCBase(),
	loc1 = USERTEST.createLocationBase("1:1"),
	loc2 = USERTEST.createLocationBase("2:2"),
	loc3 = USERTEST.createLocationBase("3:3"),
	questGen = QUESTIFY.createQuestGenerator();

(function createConditionFunctions(){
	questGen.conditionFunctions.checkIfCharIsAtLocation = function(somebody, location) {
		return somebody.location === location;
	};
	questGen.conditionFunctions.checkIfCharIsAtLocationAndWantsItem = function(somebody, location, item) {
		if (somebody.hasOwnProperty("desires")) {
			return somebody.location === location && somebody.desires.indexOf(item) !== -1;
		}
		return false;
	};
	questGen.conditionFunctions.checkIfCharIsAlive = function(somebody) {
		return somebody.isAlive;
	};
	questGen.conditionFunctions.checkIfCharIsDead = function(somebody) {
		return !somebody.isAlive;
	};
	questGen.conditionFunctions.checkIfCharKnowsInformation = function(somebody, info) {
		return somebody.knownInformation.indexOf(info) !== -1;
	};
	questGen.conditionFunctions.checkIfCharHasItem = function(somebody, item) {
		return somebody.inventory.indexOf(item) !== -1;
	};
	questGen.conditionFunctions.checkIfCharHasPrisoner = function(somebody, other) {
		if (somebody.hasOwnProperty("prisoners")) {
			return somebody.prisoners.indexOf(other) !== -1;
		}
		return false;
	};
	questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot = function(somebody, other, item) {
		return somebody.inventory.indexOf(item) !== -1 && somebody.inventory.indexOf(item) === -1;
	};
	questGen.conditionFunctions.checkIfCharIsAtLocationAndHasItem = function(somebody, location, item) {
		return somebody.location === location && somebody.inventory.indexOf(item) !== -1;
	};
	questGen.conditionFunctions.checkIfItemIsAtLocation = function(item, location) {
		return item.location === location;
	};
}());

(function createAtomicActions(){
	questGen.atomicActions.goto = QUESTIFY.createAtomicAction(questGen.conditionFunctions.checkIfCharKnowsInformation,
														      questGen.conditionFunctions.checkIfCharIsAtLocation);
	questGen.atomicActions.kill = QUESTIFY.createAtomicAction(questGen.conditionFunctions.checkIfCharIsAtLocation,
															  questGen.conditionFunctions.checkIfCharIsDead);
	questGen.atomicActions.report = QUESTIFY.createAtomicAction(questGen.conditionFunctions.checkIfCharIsAtLocation,
														        questGen.conditionFunctions.checkIfCharKnowsInformation);
	questGen.atomicActions.capture = QUESTIFY.createAtomicAction(questGen.conditionFunctions.checkIfCharIsAtLocation,
														         questGen.conditionFunctions.checkIfCharHasPrisoner);
	questGen.atomicActions.give = QUESTIFY.createAtomicAction(questGen.conditionFunctions.checkIfCharIsAtLocationAndWantsItem,
															  questGen.conditionFunctions.checkIfCharHasItem);
	questGen.atomicActions.take = QUESTIFY.createAtomicAction(questGen.conditionFunctions.checkIfCharIsAtLocationAndHasItem,
															  questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot);
	questGen.atomicActions.gather = QUESTIFY.createAtomicAction(questGen.conditionFunctions.checkIfItemIsAtLocation,
							                                    questGen.conditionFunctions.checkIfCharHasItem);

}());

(function createStrategies(){
	questGen.strategies.killEnemy = QUESTIFY.createStrategy([questGen.atomicActions.goto.withArguments(["PC", "LOC:ENEMYLOCATION"], ["PC", "LOC:ENEMYLOCATION"]),
															 questGen.atomicActions.kill.withArguments(["ENEMY:ENEMY1", "LOC:ENEMYLOCATION"], ["ENEMY:ENEMY1"]),
															 questGen.atomicActions.goto.withArguments(["PC", "START"], ["PC", "START"]),
														     questGen.atomicActions.report.withArguments(["GIVER", "START"], ["GIVER", "ENEMY:ENEMY1"])]);
	questGen.strategies.explore = QUESTIFY.createStrategy([questGen.atomicActions.goto.withArguments(["PC", "LOC:POI"], ["PC", "LOC:POI"]),
														   questGen.atomicActions.goto.withArguments(["PC", "START"], ["PC", "START"])]);
}());

(function createMotivations(){
	questGen.motivations.reputation = QUESTIFY.createMotivation([questGen.strategies.killEnemy]);
	questGen.motivations.knowledge = QUESTIFY.createMotivation([questGen.strategies.explore]);
}());

function noSharedStateTest() {
	npc1 = USERTEST.createNPCBase();
	char = USERTEST.createNPCBase();
	enemy1 = USERTEST.createNPCBase();
	enemy2 = USERTEST.createNPCBase();
	loc1 = USERTEST.createLocationBase();
	loc2 = USERTEST.createLocationBase();

	npc1.motivations.push(questGen.motivations.reputation);

	npc1.location = loc1;
	char.location = loc1;
	enemy1.location = loc2;

	char.knownInformation.push(loc1);
	char.knownInformation.push(loc2);

	var quest = questGen.generateQuest(char, npc1, [], [enemy1], [loc2], []),
		quest2 = questGen.generateQuest(char, npc1, [], [enemy2], [loc2], []);

	quest.updateState();
	console.log("Quest1: " + quest.isFinished());
	quest2.updateState();
	console.log("Quest2: " + quest2.isFinished());

	char.location = loc2; //Move to location of the enemy
	quest.updateState();
	quest2.updateState();
	console.log("Quest1: " + quest.isFinished() + " upon moving to enemy");
	console.log("Quest2: " + quest2.isFinished());

	enemy1.isAlive = false; //Kill the enemy
	quest.updateState();
	quest2.updateState();
	console.log("Quest1: " + quest.isFinished() + " upon killing enemy1");
	console.log("Quest2: " + quest2.isFinished());

	char.location = loc1; //Move to start location
	quest.updateState();
	quest2.updateState();
	console.log("Quest1: " + quest.isFinished() + " upon returning to start");
	console.log("Quest2: " + quest2.isFinished());

	npc1.knownInformation.push(enemy1);
	quest.updateState();
	quest2.updateState();
	console.log("Quest1: " + quest.isFinished() + " upon reporting back");
	console.log("Quest2: " + quest2.isFinished());

	console.log("Quest1: " + quest.isFinished() + " " + enemy1.isAlive);
	console.log("Quest2: " + quest2.isFinished() + " " + enemy2.isAlive);

	console.log("Overall Test Result: ");
	console.log(quest.isFinished() && !quest2.isFinished() && !enemy1.isAlive && enemy2.isAlive);
}
noSharedStateTest();