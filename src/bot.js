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

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! logged in as ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return
  const { cooldowns } = interaction.client
  // Getting command functionalities
  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.log(`No command matching ${interaction.commandName} was found.`)
    return
  }

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection())
  }

  const now = Date.now() // IT'S A FUNCTION BROOO
  const timestamps = cooldowns.get(command.data.name)
  const defaultCooldownDuration = 3
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000

  if (timestamps.has(interaction.user_id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1_000)
      return interaction.reply({
        content: `Please wait, you are on cooldown for ${command.data.name}. You can use it again in <t:${expiredTimestamp}:R>`,
        ephemeral: true
      })
    }
  }
  timestamps.set(interaction.user.id, now)

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
