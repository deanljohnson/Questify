/**
 * Created by Dean on 6/21/2015.
 */

var char = USERTEST.createNPCBase("Player Character"),
	npc1 = USERTEST.createNPCBase("Quest Giver"),
	npc2 = USERTEST.createNPCBase(),
	npc3 = USERTEST.createNPCBase(),
	enemy1 = USERTEST.createNPCBase(),
	enemy2 = USERTEST.createNPCBase(),
	enemy3 = USERTEST.createNPCBase(),
	loc1 = USERTEST.createLocationBase("1:1"),
	loc2 = USERTEST.createLocationBase("2:2"),
	loc3 = USERTEST.createLocationBase("3:3"),
	item1 = USERTEST.createItemBase("1:1", "Item 1"),
	item2 = USERTEST.createItemBase("2:2", "Item 2"),
	item3 = USERTEST.createItemBase("3:3", "Item 3"),
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
		return somebody.inventory.indexOf(item) !== -1 && other.inventory.indexOf(item) === -1;
	};
	questGen.conditionFunctions.checkIfCharIsAtLocationAndHasItem = function(somebody, location, item) {
		return somebody.location === location && somebody.inventory.indexOf(item) !== -1;
	};
	questGen.conditionFunctions.checkIfItemIsAtLocation = function(item, location) {
		return item.location === location;
	};
	questGen.conditionFunctions.checkIfCharIsAtLocationAndKnowsInformation = function(somebody, location, info) {
		return questGen.conditionFunctions.checkIfCharIsAtLocation(somebody, location) && questGen.conditionFunctions.checkIfCharKnowsInformation(somebody, info);
	};
}());

(function createParseActions(){
	questGen.onParseActions.giveCharItem = function (somebody, item) {
		if ("inventory" in somebody) {
			somebody.inventory.push(item);
		} else {
			console.log("The given 'somebody' does not have an inventory!");
		}
	}
}());

(function createAtomicActions(){
	questGen.atomicActions.goto = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation]);

	questGen.atomicActions.kill = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
															  questGen.conditionFunctions.checkIfCharIsDead]);

	questGen.atomicActions.report = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
														        questGen.conditionFunctions.checkIfCharKnowsInformation]);

	questGen.atomicActions.capture = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharHasPrisoner]);

	questGen.atomicActions.give = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot]);

	questGen.atomicActions.take = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot]);

	questGen.atomicActions.gather = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
							                                    questGen.conditionFunctions.checkIfCharHasItem]);

	questGen.atomicActions.learn = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharKnowsInformation]);

	questGen.atomicActions.obtain = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharHasItem]);
}());

(function createStrategies(){
	questGen.strategies.killEnemy =
		QUESTIFY.createStrategy([
			{atomicAction: 'goto',   actionArgs: [["[DEF]:'pc'", "[ENEMY]:'enemy':location"]]},
			{atomicAction: 'kill',   actionArgs: [["[DEF]:'pc'", "[ENEMY]:'enemy':location"], ["[ENEMY]:'enemy'"]]},
			{atomicAction: 'report', actionArgs: [["[DEF]:'pc'", "[DEF]:'giver':location"], ["[DEF]:'giver'", "[ENEMY]:'enemy'"]]}]);

	questGen.strategies.explore =
		QUESTIFY.createStrategy([
			{atomicAction: 'goto',   actionArgs: [["[DEF]:'pc'", "[LOC]:'poi'"]]},
			{atomicAction: 'goto',   actionArgs: [["[DEF]:'pc'", "[DEF]:'giver':location"]]},
			{atomicAction: 'report', actionArgs: [["[DEF]:'pc'", "[DEF]:'giver':location"], ["[DEF]:'giver'", "[LOC]:'poi'"]]}]);

	questGen.strategies.goAndLearn =
		QUESTIFY.createStrategy([
			{atomicAction: 'goto',   actionArgs: [["[DEF]:'pc'", "[NPC]:'otherNPC':location"]]},
			{atomicAction: 'learn',  actionArgs: [["[DEF]:'pc'", "[LOC]:'locInfo'"]]}]);

	questGen.strategies.obtainLuxuries =
		QUESTIFY.createStrategy([
			{atomicAction: 'goto',   actionArgs: [["[DEF]:'pc'", "[NPC]:'storeKeeper':location"]]},
			{atomicAction: 'obtain', actionArgs: [["[DEF]:'pc'", "[NPC]:'storeKeeper':[inventory]:'luxury'"]]},
			{atomicAction: 'goto',   actionArgs: [["[DEF]:'pc'", "[DEF]:'giver':location"]]},
			{atomicAction: 'give',   actionArgs: [["[DEF]:'giver'", "[DEF]:'pc'", "[NPC]:'storeKeeper':[inventory]:'luxury'"]]}]);
}());

(function createMotivations(){
	questGen.motivations.reputation = QUESTIFY.createMotivation([questGen.strategies.killEnemy]);
	questGen.motivations.knowledge = QUESTIFY.createMotivation([questGen.strategies.explore, questGen.strategies.goAndLearn]);
	questGen.motivations.comfort = QUESTIFY.createMotivation([questGen.strategies.obtainLuxuries]);
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

	var quest = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy1], LOC: [loc2], OBJ: []}),
		quest2 = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy2], LOC: [loc2], OBJ: []});

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
	enemy1.location = loc2;

	var quest = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy1], LOC: [loc2], OBJ: []}, questGen.strategies.killEnemy);

	quest.updateState();
	console.log("KillEnemy Quest: " + quest.isFinished() + " upon generation");

	char.location = enemy1.location;
	enemy1.isAlive = false;
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

function exploreTest() {
	char = USERTEST.createNPCBase("Player Character");
	npc1 = USERTEST.createNPCBase("Quest Giver");
	loc1 = USERTEST.createLocationBase("1:1", "Quest Start Location");

	char.location = loc1;
	npc1.location = loc1;

	var quest = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy1], LOC: [loc2], OBJ: []}, questGen.strategies.explore);

	quest.updateState();
	console.log("Explore Quest: " + quest.isFinished() + " upon generation");

	char.location = loc2;
	quest.updateState();
	console.log("Explore Quest: " + quest.isFinished() + " upon char moving to point of interest");

	char.location = npc1.location;
	quest.updateState();
	console.log("Explore Quest: " + quest.isFinished() + " upon returning to quest givers location");

	npc1.knownInformation.push(loc2);
	quest.updateState();
	console.log("Explore Quest: " + quest.isFinished() + " upon reporting back to quest giver");

	console.log("Explore Quest: Overall Test Results: ");
	console.log(quest.isFinished());
}
exploreTest();

function goAndLearnTest() {
	char = USERTEST.createNPCBase("Player Character");
	npc1 = USERTEST.createNPCBase("Quest Giver");
	npc2 = USERTEST.createNPCBase("NPC To Learn From");
	loc1 = USERTEST.createLocationBase("1:1", "Quest Start Location");
	loc1 = USERTEST.createLocationBase("2:2", "Info to Learn");

	var quest = questGen.generateQuest(char, npc1, {NPC: [npc2], ENEMY: [], LOC: [loc2], OBJ: []}, questGen.strategies.goAndLearn);

	quest.updateState();
	console.log("GoAndLearn Quest: " + quest.isFinished() + " upon generation");

	char.location = npc2.location;
	quest.updateState();
	console.log("GoAndLearn Quest: " + quest.isFinished() + " upon char moving to the location of the other NPC");

	char.knownInformation.push(loc2);
	quest.updateState();
	console.log("GoAndLearn Quest: " + quest.isFinished() + " upon char learning required information");

	console.log("GoAndLearn Quest: Overall Test Results: ");
	console.log(quest.isFinished());
}
goAndLearnTest();

function obtainLuxuriesTest() {
	char = USERTEST.createNPCBase("Player Character");
	npc1 = USERTEST.createNPCBase("Quest Giver");
	npc2 = USERTEST.createNPCBase("NPC To Obtain From");
	item1 = USERTEST.createItemBase("1:1", "Luxury Item 1");
	item2 = USERTEST.createItemBase("1:1", "Luxury Item 2");
	item3 = USERTEST.createItemBase("1:1", "Luxury Item 3");


	char.location = loc1;
	npc1.location = loc1;
	npc2.location = loc2;

	npc2.inventory = [item1, item2, item3];

	var quest = questGen.generateQuest(char, npc1, {NPC: [npc2], ENEMY: [], LOC: [], OBJ: []}, questGen.strategies.obtainLuxuries);

	quest.updateState();
	console.log("ObtainLuxuries Quest: " + quest.isFinished() + " upon generation");

	char.location = npc2.location;
	quest.updateState();
	console.log("ObtainLuxuries Quest: " + quest.isFinished() + " upon char moving to the location of the NPC with the item");

	if (npc2.inventory.indexOf(item1) === -1) {
		console.log("Store Keeper does not have the luxury item in his inventory!");
	}
	npc2.inventory = [];
	char.inventory = [item1, item2, item3];
	quest.updateState();
	console.log("ObtainLuxuries Quest: " + quest.isFinished() + " upon char obtaining required item");

	char.location = npc1.location;
	quest.updateState();
	console.log("ObtainLuxuries Quest: " + quest.isFinished() + " upon char moving to the location of the quest giver");

	char.inventory = [];
	npc1.inventory = [item1, item2, item3];
	quest.updateState();
	console.log("ObtainLuxuries Quest: " + quest.isFinished() + " upon char giving item to quest giver");

	console.log("ObtainLuxuries Quest: Overall Test Results: ");
	console.log(quest.isFinished());
}
obtainLuxuriesTest();