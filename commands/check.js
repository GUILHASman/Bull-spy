const { getCheatServers, isWhitelisted, logDetection, getUserUsage, incrementUserUsage } = require('../database/supabase');
const { authorizedUsers, usageLogChannelId } = require('../config');

// Configuração de Canais e Idiomas
const CHANNELS = {
    PT: '1470110414275871043',
    EN: '1470110570161111203'
};

const STRINGS = {
    PT: {
        usageLimit: '❌ Já atingiste o limite de 10 utilizações gratuitas.',
        wrongChannel: '❌ Este comando só pode ser usado nos canais de consulta pública.',
        checking: '🔍 A verificar ID...',
        whitelisted: '⚪ Este utilizador está na **Whitelist** e é considerado seguro.',
        notFound: '✅ Procura concluída. O utilizador **não foi encontrado** em nenhum servidor de cheats.',
        found: (count) => `⚠️ O utilizador foi encontrado em **${count}** servidores de cheats:\n`,
        usageLeft: (remain) => `\n*Ainda tens ${remain} consultas disponíveis.*`
    },
    EN: {
        usageLimit: '❌ You have already reached the limit of 10 free uses.',
        wrongChannel: '❌ This command can only be used in public consultation channels.',
        checking: '🔍 Checking ID...',
        whitelisted: '⚪ This user is on the **Whitelist** and is considered safe.',
        notFound: '✅ Search completed. User **was not found** in any cheat servers.',
        found: (count) => `⚠️ User was found in **${count}** cheat servers:\n`,
        usageLeft: (remain) => `\n*You still have ${remain} searches available.*`
    }
};

module.exports = {
    name: 'check',
    aliases: ['checar', 'verificar'],
    description: 'Verifica se um ID de Discord está em servidores de cheats.',
    async execute(message, args) {
        const isOwner = authorizedUsers.includes(message.author.id);
        const lang = message.channelId === CHANNELS.EN ? 'EN' : 'PT';
        const t = STRINGS[lang];

        // 1. Restrição de Canal para utilizadores públicos
        if (!isOwner && message.channelId !== CHANNELS.PT && message.channelId !== CHANNELS.EN) {
            return message.reply(t.wrongChannel);
        }

        // 2. Controlo de Uso (Limite de 10)
        if (!isOwner) {
            const usage = await getUserUsage(message.author.id);
            if (usage >= 10) {
                return message.reply(t.usageLimit);
            }
        }

        const targetUserId = args[0];
        if (!targetUserId || !/^\d+$/.test(targetUserId)) {
            return message.reply(lang === 'PT' ? 'Uso: `!check <ID>`' : 'Usage: `!check <ID>`');
        }

        // 3. Whitelist check
        const whitelisted = await isWhitelisted(targetUserId);
        if (whitelisted) {
            return message.reply(t.whitelisted);
        }

        const statusMsg = await message.reply(t.checking);

        // 4. Cheat Server Check (Live)
        const cheatServers = await getCheatServers();
        const cheatServerIds = cheatServers.map(s => s.id);

        const hits = [];
        for (const guildId of cheatServerIds) {
            const guild = message.client.guilds.cache.get(guildId);
            if (!guild) continue;

            try {
                const foundMember = await guild.members.fetch(targetUserId);
                if (foundMember) {
                    hits.push({
                        guild_name: guild.name,
                        roles: foundMember.roles.cache.map(r => r.name).filter(n => n !== '@everyone')
                    });
                }
            } catch (err) { /* Not in guild */ }
        }

        // 5. Build Response
        let response = '';
        if (hits.length === 0) {
            response = t.notFound;
        } else {
            response = t.found(hits.length);
            hits.forEach(h => {
                const highlightedRoles = h.roles.map(role => {
                    const isDanger = require('../config').dangerRoles.some(dr =>
                        role.toLowerCase().includes(dr.toLowerCase())
                    );
                    return isDanger ? `🚨 **${role}**` : role;
                });
                response += `- **${h.guild_name}** (Cargos: ${highlightedRoles.join(', ') || 'Nenhuns'})\n`;
            });

            // Log to Analytics
            const serversFound = hits.map(h => h.guild_name).join(', ');
            await logDetection(targetUserId, serversFound, 'manual');
        }

        // 6. Increment Usage if not owner
        if (!isOwner) {
            try {
                const newUsage = await incrementUserUsage(message.author.id);
                response += t.usageLeft(10 - newUsage);
                console.log(`[CHECK] Usage for ${message.author.id}: ${newUsage}/10`);

                // 7. STAFF LOGGING
                const staffLogChannel = message.client.channels.cache.get(usageLogChannelId);
                if (staffLogChannel) {
                    const logMsg = `📝 **Usage Log:**\n` +
                        `👤 **User:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                        `🔍 **Target ID:** \`${targetUserId}\`\n` +
                        `📈 **Used:** ${newUsage}/10\n` +
                        `📉 **Remaining:** ${10 - newUsage}\n` +
                        `🌐 **Channel:** <#${message.channelId}>`;
                    staffLogChannel.send(logMsg).catch(err => console.error('[ERROR] Failed to send staff log:', err.message));
                }
            } catch (err) {
                console.error('[ERROR] Usage tracking failed in check command:', err.message);
            }
        } else {
            console.log(`[CHECK] Owner/Authorized user ${message.author.id} bypasses usage limit.`);
        }

        statusMsg.edit(response).catch(err => console.error('[ERROR] Edit check failed:', err.message));
    }
};
