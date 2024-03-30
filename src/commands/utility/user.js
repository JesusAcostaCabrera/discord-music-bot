const { SlashCommandBuilder } = require('discord.js')

const user = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information from the user'),
  async execute (interaction) {
    await interaction.reply(
      `This command was run by ${interaction.user.username}, who joined at ${interaction.user.joinedAt}`
    )
  }
}

module.exports = user;