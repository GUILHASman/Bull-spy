const { getTopDetections, getTopStaff } = require('../database/supabase');

module.exports = {
    name: 'top',
    aliases: ['ranking', 'melhores'],
    description: 'Mostra o ranking de infratores e staff mais ativo.',
    async execute(message, args) {
        console.log('[DEBUG] Executing !top command...');
        const topCheaters = await getTopDetections(5);
        const topStaff = await getTopStaff(5);

        let response = '🏆 **SPY BULL - RANKING GERAL** 🏆\n\n';

        response += '🔥 **TOP INFRATORES (MAIS SERVIDORES)**\n';
        if (topCheaters.length > 0) {
            topCheaters.forEach((u, i) => {
                response += `${i + 1}. \`${u.user_id}\` - **${u.serverCount}** servidores\n`;
            });
        } else {
            response += 'Nenhum registo encontrado.\n';
        }

        response += '\n⭐ **TOP STAFF (MAIS ATIVO)**\n';
        if (topStaff.length > 0) {
            topStaff.forEach((u, i) => {
                response += `${i + 1}. <@${u.user_id}> - **${u.usage_count}** usos\n`;
            });
        } else {
            response += 'Nenhum registo encontrado.\n';
        }

        response += '\n*Spy Bull Analytics*';

        console.log('[DEBUG] Sending plain text reply...');
        message.reply(response).catch(err => {
            console.error('[ERROR] Top message failed:', err.message);
        });
    }
};
