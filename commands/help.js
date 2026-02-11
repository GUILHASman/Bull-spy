module.exports = {
    name: 'commands',
    aliases: ['help', 'ajuda'],
    description: 'Lista todos os comandos disponíveis no bot.',
    async execute(message) {
        const { commands } = message.client;

        let response = '🤖 **Lista de Comandos Disponíveis**\n\n';

        commands.forEach(command => {
            response += `🔹 **!${command.name}**: ${command.description || 'Sem descrição.'}\n`;
        });

        message.reply(response).catch(err => console.error('[ERROR] Help message failed:', err.message));
    }
};
