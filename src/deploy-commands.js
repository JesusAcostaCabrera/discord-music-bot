const { REST, Routes } = require('discord.js')
const { clientID, discord_token: token, serverID } = require('../config.json')
const fs = require('node:fs')
const path = require('node:path')

// List where we save all the commands
const commands = []

// Grabbing commands folder from the command directory
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  // Accessing each folder inside of src/commands
  const commandsPath = path.join(foldersPath, folder)
  const commandsFiles = fs.readdirSync(commandsPath)

  // Accessing files inside of src/commands/folder
  for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON())
    } else {
      console.log(
        `[Warning] The command at ${filePath} is missing a required attribute`
      )
    }
  }
}

const rest = new REST().setToken(token)

async function addingCommands (){
	try{
		console.log(`Started refreshing ${commands.length} application (/) commands`);

		const data = rest.put(
			Routes.applicationGuildCommands(clientID, serverID),
			{body: commands},
		)

		console.log(`Successfully loaded ${commands.length} application (/) commands`);
	} catch(err){
		console.log(err);
	}
}

addingCommands()