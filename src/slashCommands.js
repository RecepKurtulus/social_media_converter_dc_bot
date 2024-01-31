const { ytVideoModule } = require('../modules/Youtube/ytVideoModule')
const { tiktokVideoModule } = require('../modules/TikTok/tiktokVideoModule')
const { xVideoModule } = require('../modules/X/xVideoModule')
const {SlashCommandBuilder,} = require('discord.js')

module.exports.createSlashCommands = async(client)=>{
    const tiktok = new SlashCommandBuilder()
      .setName('tiktok')
      .setDescription('For TikTok video downloads')
      .addStringOption((option) =>
        option.setName('link').setDescription('Video link').setRequired(true),
      );
    const x = new SlashCommandBuilder()
      .setName('x')
      .setDescription('For X video downloads')
      .addStringOption((option) =>
        option.setName('link').setDescription('Video link').setRequired(true),
      );
    const youtube = new SlashCommandBuilder()
      .setName('youtube')
      .setDescription('For Youtube video downloads')
      .addStringOption((option) =>
        option.setName('link').setDescription('Video link').setRequired(true),
      );

    client.application.commands.create(tiktok)
    client.application.commands.create(x)
    client.application.commands.create(youtube)
}

module.exports.executeSlashCommands=async(client,interaction)=>{
    console.log(interaction)
    if (!interaction.isChatInputCommand()) return

    if (interaction.commandName === 'tiktok') {
      console.log(interaction.options.getString('link'))
      await tiktokVideoModule(interaction, client)
    }
    if (interaction.commandName === 'x') {  
      console.log(interaction.options.getString('link'))
      await xVideoModule(interaction, client)
    }
    if (interaction.commandName === 'youtube') {  
        console.log(interaction.options.getString('link'))
        await ytVideoModule(interaction, client)
      }
}