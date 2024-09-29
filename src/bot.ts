import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import { makanCommand } from './commands/makan';
import { minumCommand } from './commands/minum';
import { statusCommand } from './commands/status';
import { connectDB } from './database';
import { User } from './database';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const tavernChannelId = '1275821324127834123';   // ID Channel untuk Tavern
const innChannelId = '1275821995224727664';      // ID Channel untuk Penginapan

if (!token || !clientId || !guildId) {
    throw new Error('TOKEN, CLIENT_ID, and GUILD_ID must be provided');
}

// Connect to MongoDB
connectDB();

// Function to update user status gradually (decrease when outside, increase when inside)
async function updateUserStatus(userId: string) {
    const interval = setInterval(async () => {
        let user = await User.findOne({ userId });
        if (!user) return;

        // If user is resting in the Tavern
        if (user.isResting) {
            user.hunger = Math.min(user.hunger + 2, 100);  // Increase hunger
            user.thirst = Math.min(user.thirst + 2, 100);  // Increase thirst
            user.tiredness = Math.min(user.tiredness + 1, 100);  // Increase tiredness
        }
        // If user is sleeping in the Inn
        else if (user.isSleeping) {
            user.sleepiness = Math.min(user.sleepiness + 2, 100);  // Increase sleepiness
            user.tiredness = Math.max(user.tiredness - 3, 0);  // Decrease tiredness
        } 
        // If not resting or sleeping, decrease hunger, thirst, and increase tiredness
        else {
            user.hunger = Math.max(user.hunger - 1, 0);  // Decrease hunger
            user.thirst = Math.max(user.thirst - 1, 0);  // Decrease thirst
            user.tiredness = Math.min(user.tiredness + 1, 100);  // Increase tiredness
            user.sleepiness = Math.min(user.sleepiness + 1, 100);  // Increase sleepiness
        }

        await user.save();
    }, 5000);  // Adjust every 5 seconds
}

// Function to handle message events in the Tavern and Inn
client.on('messageCreate', async (message) => {
    const userId = message.author.id;
    let user = await User.findOne({ userId });
    if (!user) {
        user = new User({ userId });
        await user.save();
    }

    // Handle Tavern logic
    if (message.channel.id === tavernChannelId) {
        if (message.content.includes("masuk tavern")) {
            if (!user.isResting) {  // Ensure notification is sent only once
                user.isResting = true;
                user.isSleeping = false;
                await user.save();
                await message.channel.send(`<@${userId}>, selamat datang di Tavern! Istirahat yang cukup ya! 💖`);
                updateUserStatus(userId);
            }
        }

        if (message.content.includes("keluar tavern")) {
            if (user.isResting) {
                user.isResting = false;
                await user.save();
                await message.channel.send(`<@${userId}>, terima kasih sudah beristirahat di Tavern! Sampai jumpa! 😄`);
            }
        }
    }

    // Handle Inn logic
    if (message.channel.id === innChannelId) {
        if (message.content.includes("masuk penginapan")) {
            if (!user.isSleeping) {  // Ensure notification is sent only once
                user.isSleeping = true;
                user.isResting = false;
                await user.save();
                await message.channel.send(`<@${userId}>, selamat datang di Penginapan! Tidur yang cukup ya! 💖`);
                updateUserStatus(userId);
            }
        }

        if (message.content.includes("keluar penginapan")) {
            if (user.isSleeping) {
                user.isSleeping = false;
                await user.save();
                await message.channel.send(`<@${userId}>, terima kasih sudah tidur di Penginapan! Semoga segar kembali! 😄`);
            }
        }
    }
});

// Bot ready event
client.once('ready', async () => {
    console.log('Bot is ready!');
    const commands = [makanCommand.data, minumCommand.data, statusCommand.data];
    await client.application?.commands.set(commands, guildId);
});

// Interaction event listener
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'makan') {
        await makanCommand.execute(interaction);
    } else if (interaction.commandName === 'minum') {
        await minumCommand.execute(interaction);
    } else if (interaction.commandName === 'status') {
        await statusCommand.execute(interaction);
    }
});

// Login the bot
client.login(token);
