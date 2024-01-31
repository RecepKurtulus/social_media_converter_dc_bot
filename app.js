require('dotenv').config()

const {createSlashCommands, executeSlashCommands}=require('./src/slashCommands')
const {
  Events,
  SlashCommandBuilder,
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
  ActivityType,
} = require('discord.js')
const clientLogin = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.on('ready', async (client) => {
    console.log(`✅Logged in as ${client.user.tag}!`)
    client.user.setActivity('Interactionsları yedim')
    await createSlashCommands(client)
    
  })
  client.on('interactionCreate', async (interaction) => {
    await executeSlashCommands(client,interaction)
  })

  client.login(process.env.CLIENT_TOKEN)
  
}

clientLogin()
