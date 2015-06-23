# Questify
A procedural quest generator written in JavaScript that is still in development. Questify does not simply generate quest structures that you must manually fill with details. Instead, Questify gives you the necessary configuration options to have quests generated that match your needs with quest details procedurally selected using your given list of entities. This allows Questify to run live in a game environment, generated quests as needed.

The process of defining quests is largely based off of [this paper](https://larc.unt.edu/techreports/LARC-2011-02.pdf). 

Essentially, you create motivations that you can then attach to NPC's. For example, an NPC could be motivated by greed, knowledge, or reputation. Each motivation then has an array of quest structures associated with it called strategies. Think of a strategy as the skeleton of your quest: it defines the format, but not the content itself. Then, every strategy is made up of multiple actions. Each action is made up of various conditions that must be met for the action to be finished.
