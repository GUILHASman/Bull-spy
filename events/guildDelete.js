module.exports = {
    name: 'guildDelete',
    async execute(guild) {
        const { usageLogChannelId } = require('../config');
        const client = guild.client;

        console.log(`[ALERT] Left/Kicked from guild: ${guild.name} (${guild.id})`);

        const channel = client.channels.cache.get(usageLogChannelId);
        if (channel) {
            const msg = `@everyone ⚠️ **ALERTA CRÍTICO: MONITORIZAÇÃO PARADA**\n\n` +
                `O bot foi **removido/expulso** de um servidor de cheats ou o servidor foi apagado.\n` +
                `🏠 **Servidor:** ${guild.name}\n` +
                `🆔 **ID:** \`${guild.id}\`\n\n` +
                `*Garante que voltamos a entrar se necessário para manter a vigilância.*`;

            channel.send(msg).catch(err => console.error('[ERROR] Failed to send guildDelete alert:', err.message));
        }
    }
};
