module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot logged in as ${client.user.tag} (${client.user.id})`);
        console.log(`Bot is seeing ${client.guilds.cache.size} guilds and ${client.channels.cache.size} channels.`);
        console.log('Bot is ready and monitoring log channels.');
    }
};
