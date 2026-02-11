const { getCheatServers } = require('../database/supabase');

module.exports = {
    name: 'listservers',
    description: 'Lista todos os servidores de cheats monitorizados.',
    async execute(message) {
        const servers = await getCheatServers();

        if (servers.length === 0) {
            return message.reply('📭 A lista de servidores de cheats está vazia.');
        }

        let response = `📋 **Servidores Monitorizados (${servers.length})**\n\n`;
        servers.forEach((s, i) => {
            response += `${i + 1}. **${s.name}** (\`${s.id}\`)\n`;
        });

        message.reply(response);
    }
};
