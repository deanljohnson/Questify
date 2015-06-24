# Questify
A procedural quest generator written in JavaScript that is still in development. Questify does not simply generate quest structures that you must manually fill with details. Instead, Questify gives you the necessary configuration options to have quests generated that match your needs with quest details procedurally selected using your given list of entities. This allows Questify to run live in a game environment, generated quests as needed.

The process of defining quests is largely based off of [this paper](https://larc.unt.edu/techreports/LARC-2011-02.pdf). 

Essentially, you create motivations that you can then attach to NPC's. For example, an NPC could be motivated by greed, knowledge, or reputation. Each motivation has an array of quest structures associated with it called strategies. Think of a strategy as the skeleton of your quest: it defines the format, but not the content itself. Every strategy is made up of multiple actions. Each action is made up of various conditions that must be met for the action to be finished.

For example, lets define a quest to kill an enemy. This quest will require four actions:

1. Go to enemy location
2. Kill enemy
3. Go to quest giver's location
4. Report quest completion to the quest giver

Actions 1 and 3 are essentially the same, but with different targets. The conditions for a "go-to" action are simple: is the character there? In code we can define this as follows:

````javascript
  questGen.conditionFunctions.checkIfCharIsAtLocation = function(somebody, location) {
		return somebody.location === location;
	};
	
	questGen.atomicActions.goto = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation]);
````

The exact parameters for the action will be set later. Right now we have just defined a generic goto action and it's condition.

Kill Definition:

````javascript
  //checkIfCharIsAtLocation is defined above
  
	questGen.conditionFunctions.checkIfCharIsDead = function(somebody) {
		return !somebody.isAlive;
	};
	
	questGen.atomicActions.kill = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
															                                questGen.conditionFunctions.checkIfCharIsDead]);
````

Report Definition

````javascript
  //checkIfCharIsAtLocation is defined above
  
	questGen.conditionFunctions.checkIfCharKnowsInformation = function(somebody, info) {
		return somebody.knownInformation.indexOf(info) !== -1;
	};
	
	questGen.atomicActions.kill = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,
                                                    questGen.conditionFunctions.checkIfCharKnowsInformation]);
````

With our actions defined, let's define our strategy. In this step, we will be formatting the arguments to each of the actions as well:

````javascript
  questGen.strategies.killEnemy =
		QUESTIFY.createStrategy([
			{atomicAction: 'goto',   actionArgs: [["DEF:pc", "ENEMY:enemy:location"]]},
			{atomicAction: 'kill',   actionArgs: [["DEF:pc", "ENEMY:enemy:location"], ["ENEMY:enemy"]]},
			{atomicAction: 'goto',   actionArgs: [["DEF:pc", "DEF:start"]]},
			{atomicAction: 'report', actionArgs: [["DEF:giver", "DEF:pc:location"], ["DEF:giver", "ENEMY:enemy"]]}]);
````

Questify will select an object for each unique tag in the actionArgs arrays. By using the same tags as needed, you can define the structure of the quest without actually worrying about EXACTLY which entity they are going to. Questify will handle the tagging of entities for you. Now, upon creating the quest, you can pass in your collection of objects and Questify will select an appropriate object for each unique tag and then make sure that each condition of each action is checked against the properly tagged item! We will pass in the entities in a moment. Let's first define a motivation:

````javascript
  questGen.motivations.reputation = QUESTIFY.createMotivation([questGen.strategies.killEnemy]);
````

Motivations are basically just an array of strategies that an npc could use to fulfill that motivation, if they are motivated by that. So let's make an NPC. Note that the way you do this it up to you. All the npc NEEDS is a motivations property that is an array:

````javascript
  var npc1 = USERTEST.createNPCBase("Quest Giver");
  npc1.motivations.push(questGen.motivations.reputation);
````

And now, finally, the quest:

````javascript
  //the last four arguments must be arrays. Right now, it is hard coded for them to be in this order and to represent those types of entities, but that will be changing
  //char is the player to assign as the "pc" of the quest
  var quest = questGen.generateQuest(char, npc1, otherNPCs, enemies, locations, objects);
````

Now what this will do is generate a quest with "char" as the "DEF:pc", npc1 as the "DEF:giver", and then select appropriate entities from the given arrays of objects to fill out the quest details. The generateQuest method selects a random motivation from the given npc, then a random strategy of that motivation to structure the quest off of.

While this might seem like a lot to define one quest, you now have conditions, actions, and quest structures that you can reuse endlessly. You can create new quests simply and easily and let Questify handle the details.
