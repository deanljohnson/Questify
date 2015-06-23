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
	questGen.conditionFunctions.checkIfCharIsAtLocationAndKnowsInformation = function(somebody, location, info) {
		return questGen.conditionFunctions.checkIfCharIsAtLocation(somebody, location) && questGen.conditionFunctions.checkIfCharIsAtLocationAndKnowsInformation(somebody, info);
	};
}());

(function createAtomicActions(){
	questGen.atomicActions.goto = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation]);

	questGen.atomicActions.kill = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
															  questGen.conditionFunctions.checkIfCharIsDead]);

	questGen.atomicActions.report = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
														        questGen.conditionFunctions.checkIfCharKnowsInformation]);

	questGen.atomicActions.capture = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharHasPrisoner]);

	questGen.atomicActions.give = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharHasItem]);

	questGen.atomicActions.take = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot]);

	questGen.atomicActions.gather = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
							                                    questGen.conditionFunctions.checkIfCharHasItem]);

	questGen.atomicActions.listen = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharKnowsInformation]);
}());

(function createStrategies(){
	questGen.strategies.killEnemy =
		QUESTIFY.createStrategy([questGen.atomicActions.goto.withArguments([["DEF:pc", "ENEMY:enemy:location"]]),
								 questGen.atomicActions.kill.withArguments([["DEF:pc", "ENEMY:enemy:location"], ["ENEMY:enemy"]]),
								 questGen.atomicActions.goto.withArguments([["DEF:pc", "DEF:start"]]),
								 questGen.atomicActions.report.withArguments([["DEF:giver", "DEF:pc:location"], ["DEF:giver", "ENEMY:enemy"]])]);
	questGen.strategies.explore =
		QUESTIFY.createStrategy([questGen.atomicActions.goto.withArguments([["DEF:pc", "LOC:poi"], ["DEF:pc", "LOC:poi"]]),
								 questGen.atomicActions.goto.withArguments([["DEF:pc", "DEF:start"], ["DEF:pc", "DEF:start"]])]);
	questGen.strategies.goAndLearn =
		QUESTIFY.createStrategy([questGen.atomicActions.goto.withArguments([["DEF:pc", "NPC:otherNPC:location"], ["DEF:pc:location", "NPC:otherNPC:location"]]),
								 questGen.atomicActions.listen.withArguments([["DEF:pc", "LOC:locInfo"]])]);
}());

(function createMotivations(){
	questGen.motivations.reputation = QUESTIFY.createMotivation([questGen.strategies.killEnemy]);
	questGen.motivations.knowledge = QUESTIFY.createMotivation([questGen.strategies.explore]);
}());

function noSharedStateTest() {
	/*In this test, we create two very similar quests and make sure that the progress in one is not reflected in the other*/
	npc1 = USERTEST.createNPCBase("Quest Giver");
	char = USERTEST.createNPCBase("Player Character");
	enemy1 = USERTEST.createNPCBase("Enemy #1");
	enemy2 = USERTEST.createNPCBase("Enemy #2");
	loc1 = USERTEST.createLocationBase("1:1", "Quest Start Location");
	loc2 = USERTEST.createLocationBase("2:2", "Enemy Location");

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

	console.log("No Shared State Test: Overall Test Result: ");
	console.log(quest.isFinished() && !quest2.isFinished() && !enemy1.isAlive && enemy2.isAlive);
}
noSharedStateTest();

function killEnemyTest() {
	char = USERTEST.createNPCBase("Player Character");
	npc1 = USERTEST.createNPCBase("Quest Giver");
	enemy1 = USERTEST.createNPCBase("Enemy To Kill");
	loc1 = USERTEST.createLocationBase("1:1", "Quest Start Location");
	loc2 = USERTEST.createLocationBase("2:2", "Enemy Location");

	npc1.motivations.push(questGen.motivations.reputation);

	char.location = loc1;
	npc1.location = loc1;
	char.knownInformation.push(loc1);
	npc1.knownInformation.push(loc1);
	enemy1.location = loc2;
	char.knownInformation.push(loc2);

	var quest = questGen.generateQuest(char, npc1, [], [enemy1], [loc2], [], questGen.strategies.killEnemy);

	quest.updateState();
	console.log("KillEnemy Quest: " + quest.isFinished() + " upon generation");

	char.location = enemy1.location;
	enemy1.isAlive = false;
	char.knownInformation.push(enemy1);
	quest.updateState();
	console.log("KillEnemy Quest: " + quest.isFinished() + " upon char moving to enemy and killing him");

	char.location = npc1.location;
	quest.updateState();
	console.log("KillEnemy Quest: " + quest.isFinished() + " upon returning to start");

	npc1.knownInformation.push(enemy1);
	quest.updateState();
	console.log("KillEnemy Quest: " + quest.isFinished() + " upon reporting back to quest giver");

	console.log("KillEnemy Quest: Overall Test Results: ");
	console.log(quest.isFinished());
}
killEnemyTest();