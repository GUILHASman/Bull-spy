const { getDetectionHistory } = require('../database/supabase');

module.exports = {
    name: 'stats',
    aliases: ['status', 'registos', 'historico'],
    description: 'Mostra o histórico de deteções recentes.',
    async execute(message, args) {
        const targetId = args[0];
        const history = await getDetectionHistory(targetId);

        if (history.length === 0) {
            return message.reply('📊 **Nenhum registo de deteção encontrado.**');
        }

        let response = targetId ? `📊 **Histórico: ${targetId}**\n\n` : '📊 **Últimas 10 Deteções**\n\n';

        history.forEach((log, i) => {
            const date = new Date(log.detected_at).toLocaleString('pt-PT');
            response += `ID: \`${log.user_id}\` (${log.type === 'auto' ? 'AUTO' : 'MANUAL'})\n`;
            response += `📅 ${date}\n`;
            response += `🏠 **Servidores:** ${log.detected_in}\n`;
            response += '────────────────────\n';
        });

        message.reply(response).catch(err => console.error('[ERROR] Stats message failed:', err.message));
    }
};
