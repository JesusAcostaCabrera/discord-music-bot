// discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js')
const {discord_token:token} = require('../config.json')

// Creating client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
// Guilds means discord servers

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! logged in as ${readyClient.user.tag}`)
})

// Log in to discord
client.login(token);