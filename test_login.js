const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

const client = new Client({ checkUpdate: false });

console.log('Tentando login com token:', process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.substring(0, 10) + '...' : 'Nulo');

client.on('ready', () => {
    console.log('SUCESSO: Logado como', client.user.tag);
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('ERRO DE LOGIN:', err.message);
    process.exit(1);
});
