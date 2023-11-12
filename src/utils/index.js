
// Used to read the commands directory and identify our command files.
const fs = require('node:fs');

// Helps construct paths to access files and directories. 
// Automatically detects the OS and uses the appropriate joiners.
const path = require('node:path'); 

// Get objects from discord,js library
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const conf = require('../../config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// The Collection class extends JavaScript's native Map class, and includes more extensive, useful functionality. 
// Used to store and efficiently retrieve commands for execution.
client.commands = new Collection();

// Helps to construct a path to the folder's commands directory.
const foldersPath = path.join(__dirname, '../commands');

// Read sub-folders path
const commandFolders = fs.readdirSync(foldersPath)


// Find the commands to execute from folders -> sub-folders -> command files -> commands
for (const folder of commandFolders) 
{
	// Helps to construct a path to the commands directory.
	const commandsPath = path.join(foldersPath, folder);

	// Then reads the path to the directory and returns an array of all the file names it contains.
	// Filter removes any non-JavaScript files from the array.  
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) 
	{
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module.
		if ('data' in command && 'execute' in command) 
			client.commands.set(command.data.name, command);
    	else 
    	    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


// Create a listener for the Client#event:interactionCreate event that will execute code when your application receives an interaction.
client.on(Events.InteractionCreate, async interaction => {
    // Not every interaction is a slash command 
    if (!interaction.isChatInputCommand()) return;
	console.log("[[INTERACTION]]: ", interaction);

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

});


client.once('ready', c => {console.log(`Hello, ${c.user.tag}!`)});

client.login(conf.bot_token);

return 0;




/**
** 	Documentation:
** 
** discord.js: https://discordjs.guide/creating-your-bot/command-handling.html#executing-commands
** 
** 
** 
**/