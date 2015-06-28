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
	item1 = USERTEST.createItemBase("Item 1"),
	item2 = USERTEST.createItemBase("Item 2"),
	item3 = USERTEST.createItemBase("Item 3"),
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
	questGen.actionBlueprints.goto = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharIsAtLocation]);

	questGen.actionBlueprints.kill = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharIsAtLocation,
															  questGen.conditionFunctions.checkIfCharIsDead]);

	questGen.actionBlueprints.report = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharIsAtLocation,
														        questGen.conditionFunctions.checkIfCharKnowsInformation]);

	questGen.actionBlueprints.capture = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharHasPrisoner]);

	questGen.actionBlueprints.give = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot]);

	questGen.actionBlueprints.take = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot]);

	questGen.actionBlueprints.gather = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharIsAtLocation,
							                                    questGen.conditionFunctions.checkIfCharHasItem]);

	questGen.actionBlueprints.learn = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharKnowsInformation]);

	questGen.actionBlueprints.obtain = QUESTIFY.createActionBlueprint([questGen.conditionFunctions.checkIfCharHasItem]);
}());

(function createCompoundActions(){
	questGen.compoundActions.get = QUESTIFY.createCompoundAction([
		[questGen.actionBlueprints.goto, questGen.actionBlueprints.gather],
		[questGen.actionBlueprints.goto, questGen.actionBlueprints.take, questGen.actionBlueprints.goto]]);

	questGen.compoundActions.kill = QUESTIFY.createCompoundAction([
		[questGen.actionBlueprints.goto, questGen.actionBlueprints.kill],
		[questGen.actionBlueprints.goto, questGen.actionBlueprints.gather, questGen.actionBlueprints.goto, questGen.actionBlueprints.kill]]);

	questGen.compoundActions.steal = QUESTIFY.createCompoundAction(
		[
			[questGen.actionBlueprints.goto, questGen.actionBlueprints.kill, questGen.actionBlueprints.take]
		],
		[
			[questGen.conditionFunctions.checkIfCharHasItemAndOtherDoesNot]
		]
		);
}());

(function createStrategies(){
	questGen.strategies.killEnemy =
		QUESTIFY.createStrategy(["[ENEMY]:'enemy'"],
			[{actionBlueprint: "goto",
				 actionArgs: [["pc", "enemy:location"]],
				 description: "Go to [enemy:location:name]"},
			 {actionBlueprint: "kill",
				 actionArgs: [["pc", "enemy:location"], ["enemy"]],
				 description: "Kill [enemy:name], mercilessly"}]);

	questGen.strategies.killEnemyAndReport =
		QUESTIFY.createStrategy(["[ENEMY]:'enemy'"],
			[{strategy: "killEnemy",
				 tagMapping: "enemy:enemy"},
			 {actionBlueprint: "report",
				 actionArgs: [["pc", "giver:location"], ["giver", "enemy"]],
				 description: "Report back to [giver:name]"}]);

	questGen.strategies.explore =
		QUESTIFY.createStrategy(["[LOC]:'poi'"],
			[{actionBlueprint: 'goto',
				 actionArgs: [["pc", "poi"]],
				 description: "Go explore [poi:name]"},
			 {actionBlueprint: 'report',
				 actionArgs: [["pc", "giver:location"], ["giver", "poi"]],
			     description: "Report back to [giver:name]"}]);

	questGen.strategies.goAndLearn =
		QUESTIFY.createStrategy(["[NPC]:'otherNPC'", "[LOC]:'locInfo'"],
			[{actionBlueprint: 'goto',
				 actionArgs: [["pc", "otherNPC:location"]],
				 description: "Go to [otherNPC:location:name]"},
			 {actionBlueprint: 'learn',
				 actionArgs: [["pc", "locInfo"]],
			     description: "Talk to [otherNPC:name] to learn about [locInfo:name]"}]);

	questGen.strategies.obtainLuxuries =
		QUESTIFY.createStrategy(["[NPC]:'storeKeeper':[inventory]:'luxury'"],
			[{actionBlueprint: 'goto',
				 actionArgs: [["pc", "storeKeeper:location"]],
				 description: "Go to [storeKeeper:location:name]"},
			 {actionBlueprint: 'obtain',
				 actionArgs: [["pc", "luxury"]],
			     description: "Purchase [luxury:name]"},
			 {actionBlueprint: 'goto',
				 actionArgs: [["pc", "giver:location"]],
			     description: "Return to [giver:name]"},
			 {actionBlueprint: 'give',
				 actionArgs: [["giver", "pc", "luxury"]],
			     description: "Give [luxury:name] to [giver:name]"}]);

	questGen.strategies.murderAndRetrieve =
		QUESTIFY.createStrategy(["[ENEMY]:'enemy':[inventory]:'goalItem'"],
			[{strategy: "killEnemy",
				tagMapping: "enemy:enemy"},
			 {actionBlueprint: "take",
			     actionArgs: [["pc", "enemy", "goalItem"]],
			     description: "Take [goalItem:name] off of [enemy:name]'s corpse"},
			 {actionBlueprint: 'give',
				 actionArgs: [["giver", "pc", "goalItem"]],
				 description: "Return [goalItem:name] to [giver:name]"}]);
}());

(function createMotivations(){
	questGen.motivations.reputation = QUESTIFY.createMotivation([questGen.strategies.killEnemyAndReport, questGen.strategies.murderAndRetrieve]);
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
	enemy2.location = loc2;

	char.knownInformation.push(loc1);
	char.knownInformation.push(loc2);

	var quest = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy1], LOC: [loc2], OBJ: []}, questGen.strategies.killEnemyAndReport),
		quest2 = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy2], LOC: [loc2], OBJ: []}, questGen.strategies.killEnemyAndReport);

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

function killEnemyAndReportTest() {
	char = USERTEST.createNPCBase("Player Character");
	npc1 = USERTEST.createNPCBase("Quest Giver");
	enemy1 = USERTEST.createNPCBase("Enemy To Kill");
	loc1 = USERTEST.createLocationBase("1:1", "Quest Start Location");
	loc2 = USERTEST.createLocationBase("2:2", "Enemy Location");

	npc1.motivations.push(questGen.motivations.reputation);

	char.location = loc1;
	npc1.location = loc1;
	enemy1.location = loc2;

	var quest = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy1], LOC: [loc2], OBJ: []}, questGen.strategies.killEnemyAndReport);

	quest.updateState();
	console.log("killEnemyAndReport Quest: " + quest.isFinished() + " upon generation");
	console.log("killEnemyAndReport Quest Completion: " + quest.completionPercentage());

	char.location = enemy1.location;
	enemy1.isAlive = false;
	quest.updateState();
	console.log("killEnemyAndReport Quest: " + quest.isFinished() + " upon char moving to enemy and killing him");
	console.log("killEnemyAndReport Quest Completion: " + quest.completionPercentage());

	char.location = npc1.location;
	quest.updateState();
	console.log("killEnemyAndReport Quest: " + quest.isFinished() + " upon returning to start");
	console.log("killEnemyAndReport Quest Completion: " + quest.completionPercentage());

	npc1.knownInformation.push(enemy1);
	quest.updateState();
	console.log("killEnemyAndReport Quest: " + quest.isFinished() + " upon reporting back to quest giver");
	console.log("killEnemyAndReport Quest Completion: " + quest.completionPercentage());

	console.log("killEnemyAndReport Quest: Overall Test Results: ");
	console.log(quest.isFinished() && (quest.completionPercentage() === 1));
}
killEnemyAndReportTest();

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
	loc1 = USERTEST.createLocationBase("1:1", "Quest Start Location");
	loc2 = USERTEST.createLocationBase("2:2", "Info to Learn");
	npc1 = USERTEST.createNPCBase("Quest Giver");
	npc2 = USERTEST.createNPCBase("NPC To Learn From", loc2);

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
	item1 = USERTEST.createItemBase("Luxury Item 1");
	item2 = USERTEST.createItemBase("Luxury Item 2");
	item3 = USERTEST.createItemBase("Luxury Item 3");


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

function descriptionTest() {
	char = USERTEST.createNPCBase("Player Character");
	npc1 = USERTEST.createNPCBase("Ivan Idorshed");
	enemy1 = USERTEST.createNPCBase("Kane");
	loc1 = USERTEST.createLocationBase("1:1", "Quest Start Location");
	loc2 = USERTEST.createLocationBase("2:2", "The Forded Hilltop");

	char.location = loc1;
	npc1.location = loc1;
	enemy1.location = loc2;

	var quest = questGen.generateQuest(char, npc1, {NPC: [], ENEMY: [enemy1], LOC: [loc2], OBJ: []}, questGen.strategies.killEnemyAndReport);

	console.log(quest.getActionDescription(0));
	console.log(quest.getActionDescription(1));
	console.log(quest.getActionDescription(2));
	console.log(quest.getActionDescription(3));
	console.log("Description Test: Overall Test Results: ");
	console.log(quest.getActionDescription(0).length > 0 && quest.getActionDescription(3).length === 0);
}
