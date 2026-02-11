require('dotenv').config();

module.exports = {
    discordToken: process.env.DISCORD_TOKEN,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    mainGuildId: process.env.MAIN_GUILD_ID,
    alertChannelId: process.env.ALERT_CHANNEL_ID,
    joinLogsChannelId: process.env.JOIN_LOGS_CHANNEL_ID,
    usageLogChannelId: '1470131966064988456', // Canal para staff ver logs de uso
    authorizedUsers: ['1431403743911346383'], // IDs dos administradores que podem tudo
    dangerRoles: ['Customer', 'Buyer', 'Vip', 'Premium', 'Client', 'Socio', '🔥', '💎', '🛒'] // Cargos que indicam compra de cheats
};
