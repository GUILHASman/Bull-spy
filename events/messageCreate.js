const { MessageEmbed } = require('discord.js-selfbot-v13');
const { getCheatServers, isWhitelisted, logDetection } = require('../database/supabase');
const { mainGuildId, alertChannelId, joinLogsChannelId, authorizedUsers } = require('../config');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const prefix = '!';
        const publicChannels = ['1470110414275871043', '1470110570161111203'];

        const isAuthorized = authorizedUsers.includes(message.author.id) || message.author.id === message.client.user.id;
        const isPublicChannel = publicChannels.includes(message.channelId);

        // Command handling
        if ((isAuthorized || isPublicChannel) && message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            console.log(`[DEBUG] Attempting to run command: ${commandName} in ${message.channelId}`);

            // Support aliases
            const command = message.client.commands.get(commandName) ||
                message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            // Public users can ONLY run 'check'
            if (!isAuthorized && commandName !== 'check' && !command?.aliases?.includes('check')) {
                return; // Silently ignore other commands for public users
            }

            if (command) {
                console.log(`[COMMAND] Found ${commandName}. Executing...`);
                try {
                    await command.execute(message, args);
                } catch (error) {
                    console.error(`[ERROR] Execution failed:`, error);
                    message.reply('Houve um erro ao tentar executar esse comando!');
                }
                return;
            }
        }

        // Ignore authorized users for log monitoring to avoid loops
        if (authorizedUsers.includes(message.author.id)) return;

        // Only trigger for the join logs channel
        if (message.channelId !== joinLogsChannelId) return;

        console.log(`New log detected. Checking for Discord ID...`);

        // Regex to extract Discord ID from "id discord: 1061271820411621377" or similar
        const discordIdRegex = /id discord:\s*(\d+)/i;
        const match = message.content.match(discordIdRegex);

        if (!match) return;

        const targetUserId = match[1];

        // CHECK WHITELIST
        const whitelisted = await isWhitelisted(targetUserId);
        if (whitelisted) {
            console.log(`[LOG] User ${targetUserId} is whitelisted. Skipping alert.`);
            return;
        }

        console.log(`Extracted Discord ID: ${targetUserId}. Searching real-time...`);

        const cheatServers = await getCheatServers();
        const cheatServerIds = cheatServers.map(s => s.id);

        const hits = [];
        for (const guildId of cheatServerIds) {
            const guild = message.client.guilds.cache.get(guildId);
            if (!guild || guild.id === mainGuildId) continue;

            try {
                // Fetch member in real-time
                const foundMember = await guild.members.fetch(targetUserId);
                if (foundMember) {
                    hits.push({
                        guild_name: guild.name,
                        username: foundMember.user.username,
                        roles: foundMember.roles.cache.map(r => r.name)
                    });
                }
            } catch (err) {
                // Not in this guild
            }
        }

        if (hits.length > 0) {
            console.log(`Alert! User ${targetUserId} found in ${hits.length} servers.`);

            const alertChannel = message.client.channels.cache.get(alertChannelId);
            if (alertChannel) {
                const serversFound = hits.map(h => h.guild_name).join(', ');

                // FEATURE 7: Highlight Danger Roles
                const dangerRoles = require('../config').dangerRoles;
                const rolesFound = hits.map(h => {
                    const highlighted = h.roles.map(role => {
                        const isDanger = dangerRoles.some(dr => role.toLowerCase().includes(dr.toLowerCase()));
                        return isDanger ? `🚨 **${role}**` : role;
                    });
                    return highlighted.join(', ') || 'Sem cargos';
                }).join(' | ');

                // LOG TO ANALYTICS
                await logDetection(targetUserId, serversFound, 'auto');

                // CONVERT TO PLAIN TEXT FOR SELF-BOT COMPATIBILITY
                const alertMsg = `⚠️ **ALERTA: ATIVIDADE EM SERVIDORES DE CHEATS**\n\n` +
                    `👤 **ID Discord Detetado:** \`${targetUserId}\`\n` +
                    `🏠 **Servidores:** ${serversFound}\n` +
                    `🛡️ **Cargos:** ${rolesFound}\n\n` +
                    `*Spy Bull Live Monitoring*`;

                alertChannel.send(alertMsg).catch(err => console.error('Error sending alert:', err.message));
            }
        }
    }
};
