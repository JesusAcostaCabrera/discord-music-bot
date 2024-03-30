const { SlashCommandBuilder } = require('discord.js')

const ping = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies to the user with Pong'),
  async execute(interaction){
    await interaction.reply('¡Pong!')
  }
}

module.exports = ping;