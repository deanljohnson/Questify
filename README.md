# Questify
A procedural quest generator written in JavaScript that is still in development. Questify does not simply generate quest structures that you must manually fill with details. Instead, Questify gives you the necessary configuration options to have quests generated that match your needs with quest details procedurally selected using your given list of entities. This design will hopefully allow Questify to run live in a game environment, generating quests on the fly as they are needed. All you will have to do is define the skeleton structure of a quests you will want in your game, and then pass it lists of entities to draw details from.

The process of defining quests is largely based off of [this paper](https://larc.unt.edu/techreports/LARC-2011-02.pdf). 

Essentially, you create motivations that you can then attach to NPC's. For example, an NPC could be motivated by greed, knowledge, and/or reputation. Each motivation has an array of quest structures associated with it called strategies. Think of a strategy as the skeleton of your quest: it defines the format, but not the content itself. Every strategy is made up of multiple actions. Each action is made up of various conditions that must be met for the action to be finished.

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
	
questGen.atomicActions.kill = QUESTIFY.createAtomicAction([questGen.conditionFunctions.checkIfCharIsAtLocation,				                                			   					   questGen.conditionFunctions.checkIfCharIsDead]);
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
		QUESTIFY.createStrategy(["[ENEMY]:'enemy'"],
			[{atomicAction: 'goto',   actionArgs: [["pc", "enemy:location"]]},
			 {atomicAction: 'kill',   actionArgs: [["pc", "enemy:location"], ["enemy"]]},
			 {atomicAction: 'report', actionArgs: [["pc", "giver:location"], ["giver", "enemy"]]}]);
````

First, we start off by defining tags that we will need in setting the arguments to the startegies actions. "[ENEMY]:'enemy'" tells Questify to randomly select an object from the ENTITY array that you will pass to the generateQuest method and assign it the the tag of "enemy". Now, when defining the actions for this strategy, we can reference that tag, such as when we enter "enemy:location", which tells questify to find the enemy tag and access it's location property. 

Questify also defines three tags on it's own:

1. pc === the player, standing for player character
2. giver === the npc that it giving the player the quest
3. start === the location at which the quest started

Questify will automatically pass the appropriate object to the condition functions we defined for our actions, based on the tags we used when defining the strategy.

Now we can define a motivation:

````javascript
  questGen.motivations.reputation = QUESTIFY.createMotivation([questGen.strategies.killEnemy]);
````

Motivations are basically just an array of strategies that an npc could use to fulfill that motivation. Upon quest generation, you will provide Questify with a NPC with a motivations property. Questify will then randomly select a strategy from a randomly selected motivation and build a quest based off of that.

So let's make an NPC. Note that the way you do this it up to you. All the npc NEEDS is a motivations property that is an array:

````javascript
  var npc1 = USERTEST.createNPCBase("Quest Giver");
  npc1.motivations.push(questGen.motivations.reputation);
````

And now, finally, the quest:

````javascript
 //npcsArr, enemyArr, and locationsArr are arrays of your games objects that you define
  var quest = questGen.generateQuest(char, npc1, {NPCS: npcsArr, ENEMY: enemyArr, LOC: locationsArr});
````

Now what this will do is generate a quest with the "pc" tag set to reference the "char" object, and the "giver" tag set to referene the "npc1" object. The quest will be populated with details based on the object you pass in as the third parameter. In our example, we really only need the "ENEMY: enemyArr" portion, but in a system with more strategies we would have to pass arrays that could give Questify data for any possible startegy that gets selected, so it's a good practice to simply pass them all.

While this might seem like a lot to define one quest, but we have created conditions and actions that could be reused in other strategies. For example, just using the goto, kill, and report actions, we could define strategies for simple exploring quests or even a single bounty list quest that requires a player to kill multiple enemies, and the checkIfCharIsAtLocation and checkIfCharKnowsInformation conditions could be reused in defining a multitube of actions.

Defining quests in this manner allows us to re-use virtually every single component, shortening the time it takes for us to develop a game with varied and detailed quests. I hope Questify is helpful in your creations. Continue checking back for updates or contribute wherever you can. Any help is greatly appreciated.
