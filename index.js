const { Client, Collection } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const { discordToken } = require('./config');

const client = new Client({
    // Self-bots don't use intents but partials help see everything
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    checkUpdate: false,
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        console.log(`[LOADER] Loading command: ${command.name}`);
        client.commands.set(command.name, command);
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log(`[LOADER] Loading event: ${event.name} from ${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Global error handling to prevent bot from crashing
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

if (!discordToken || discordToken === 'YOUR_TOKEN_HERE') {
    console.error('ERROR: DISCORD_TOKEN is missing or not set in .env');
    process.exit(1);
}

client.login(discordToken).catch(err => {
    console.error('Failed to login:', err.message);
});
