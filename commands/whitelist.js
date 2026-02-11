const { getWhitelist, addToWhitelist, removeFromWhitelist } = require('../database/supabase');

module.exports = {
    name: 'whitelist',
    description: 'Gere a lista de utilizadores ignorados pelo bot.',
    async execute(message, args) {
        const action = args[0]?.toLowerCase();

        if (action === 'add') {
            const targetId = args[1];
            if (!targetId || !/^\d+$/.test(targetId)) return message.reply('❌ Indica um ID válido.');

            const success = await addToWhitelist(targetId, 'Manual Add');
            return message.reply(success ? `✅ ID \`${targetId}\` adicionado à whitelist.` : '❌ Erro ao adicionar.');
        }

        if (action === 'remove' || action === 'rem') {
            const targetId = args[1];
            if (!targetId || !/^\d+$/.test(targetId)) return message.reply('❌ Indica um ID válido.');

            const success = await removeFromWhitelist(targetId);
            return message.reply(success ? `✅ ID \`${targetId}\` removido da whitelist.` : '❌ Erro ao remover.');
        }

        if (action === 'list' || !action) {
            const list = await getWhitelist();
            if (list.length === 0) return message.reply('⚪ **A whitelist está vazia.**');

            let response = '⚪ **Utilizadores na Whitelist**\n\n';
            list.forEach(u => {
                response += `- \`${u.user_id}\` (${u.username || 'N/A'})\n`;
            });
            response += '\n*Estes utilizadores não disparam alertas.*';

            return message.reply(response);
        }

        message.reply('Uso: `!whitelist <add/remove/list> [ID]`');
    }
};
