const fs = require('node:fs')
const path = require('node:path')

// discord.js classes
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js')
const { discord_token: token } = require('../config.json')

// Creating client instance
// Guilds means discord servers
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection()
client.cooldowns = new Collection()

// Accesing src/commands
const foldersPath = path.join(__dirname, 'commands')

// Reading folders inside of src/commands
const commandFolders = fs.readdirSync(foldersPath)

// Accessing each individual folder inside of src/commands
for (const folder of commandFolders) {
  // path of folder inside of src/commands
  const commandsPath = path.join(foldersPath, folder)

  // checking for .js files inside of src/commands/folder
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      console.log(
        `[Warning] The command at ${filePath} is missing the required properties.`
      )
    }
  }
}

// Logs in to discord bot
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! logged in as ${readyClient.user.tag}`)
})

// Whenever you call a discord command
client.on(Events.InteractionCreate, async interaction => {
  // If it is not interacting with the bot, do nothing
  if (!interaction.isChatInputCommand()) return

  // cooldown from the client
  const { cooldowns } = interaction.client
  // Getting command functionalities
  const command = interaction.client.commands.get(interaction.commandName)

  // If the command doesn't exist
  if (!command) {
    console.log(`No command matching ${interaction.commandName} was found.`)
    return
  }

  // If cooldown doesn't have the specified cooldown amount for the command
  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection())
  }

  // Date right now
  const now = Date.now() // IT'S A FUNCTION BROOO
  // Obtain timestamps of the command used
  const timestamps = cooldowns.get(command.data.name)
  // 3 seconds default cooldown
  const defaultCooldownDuration = 3
  // Checks if command has cooldown, if not the cooldown is 3 seconds
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000

  // if a user already used the command
  if (timestamps.has(interaction.user_id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount

    // User used it more times than recommended
    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1_000)
      return interaction.reply({
        content: `Please wait, you are on cooldown for ${command.data.name}. You can use it again in <t:${expiredTimestamp}:R>`,
        ephemeral: true
      })
    }
  }
  // Creates timestamp with user that used the command
  timestamps.set(interaction.user.id, now)

  // Deletes the timestamp after the time has passed
  setTimeout(() => delete(interaction.user.id), cooldownAmount)

  try {
    await command.execute(interaction)
  } catch (err) {
    console.log(err)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error executing this command!',
        ephemeral: true
      })
    } else {
      await interaction.reply({
        content: 'There was an error executing this command!',
        ephemeral: true
      })
    }
  }
})

// Log in to discord
client.login(token)
