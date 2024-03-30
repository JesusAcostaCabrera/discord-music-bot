const { SlashCommandBuilder } = require('discord.js')

const secretPong = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('secret')
    .setDescription('It does something secret'),
  async execute (interaction) {
    await interaction.reply({content:'Secreeet',ephemeral: true})
  }
}

module.exports = secretPong;
