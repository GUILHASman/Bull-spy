const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseKey } = require('../config');

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are required in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
    supabase,

    /**
     * Gets all guilds from the cheat_servers table.
     */
    async getCheatServers() {
        const { data, error } = await supabase
            .from('cheat_servers')
            .select('id, name');

        if (error) {
            console.error('Error fetching cheat_servers:', error.message);
            return [];
        }
        return data;
    },

    /**
     * WHITELIST FUNCTIONS
     */
    async isWhitelisted(userId) {
        const { data, error } = await supabase
            .from('whitelist')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        return !!data;
    },

    async getWhitelist() {
        const { data } = await supabase.from('whitelist').select('*');
        return data || [];
    },

    async addToWhitelist(userId, username) {
        const { error } = await supabase
            .from('whitelist')
            .upsert({ user_id: userId, username: username });
        return !error;
    },

    async removeFromWhitelist(userId) {
        const { error } = await supabase
            .from('whitelist')
            .delete()
            .eq('user_id', userId);
        return !error;
    },

    /**
     * DETECTION LOG FUNCTIONS
     */
    async logDetection(userId, servers, type = 'auto') {
        const { error } = await supabase
            .from('detection_logs')
            .upsert({
                user_id: userId,
                detected_in: servers,
                type: type,
                detected_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        if (error) console.error('Error logging detection:', error.message);
    },

    async getDetectionHistory(userId) {
        let query = supabase.from('detection_logs').select('*').order('detected_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);

        const { data } = await query.limit(10);
        return data || [];
    },

    /**
     * USAGE TRACKING FUNCTIONS
     */
    async getUserUsage(userId) {
        try {
            const { data, error } = await supabase
                .from('user_usage')
                .select('usage_count')
                .eq('user_id', userId)
                .maybeSingle(); // Better than .single() when record might not exist

            if (error) {
                console.error('Error fetching user_usage:', error.message);
                return 0;
            }
            return data ? data.usage_count : 0;
        } catch (err) {
            console.error('Database error in getUserUsage:', err.message);
            return 0;
        }
    },

    async incrementUserUsage(userId) {
        try {
            const currentCount = await module.exports.getUserUsage(userId);
            const newCount = currentCount + 1;

            const { data, error } = await supabase
                .from('user_usage')
                .upsert({
                    user_id: userId,
                    usage_count: newCount,
                    last_use: new Date().toISOString()
                }, { onConflict: 'user_id' })
                .select('usage_count')
                .single();

            if (error) {
                console.error(`[DB ERROR] Failed to increment usage for ${userId}:`, error.message);
                return currentCount; // Return old count if upsert fails
            }

            console.log(`[DB SUCCESS] Usage incremented for ${userId}: ${newCount}`);
            return data ? data.usage_count : newCount;
        } catch (err) {
            console.error(`[DB CRITICAL] Error in incrementUserUsage for ${userId}:`, err.message);
            return 0;
        }
    },

    /**
     * TOP STATISTICS FUNCTIONS
     */
    async getTopDetections(limit = 10) {
        try {
            console.log('[DB] Fetching top detections...');
            const { data, error } = await supabase
                .from('detection_logs')
                .select('user_id, detected_in');

            if (error) {
                console.error('[DB ERROR] getTopDetections:', error.message);
                throw error;
            }

            if (!data || data.length === 0) {
                console.log('[DB] No detections found in table.');
                return [];
            }

            const sorted = data.map(entry => ({
                user_id: entry.user_id,
                serverCount: entry.detected_in ? entry.detected_in.split(',').length : 0
            })).sort((a, b) => b.serverCount - a.serverCount);

            console.log(`[DB] Found ${data.length} total detection records.`);
            return sorted.slice(0, limit);
        } catch (err) {
            console.error('[DB CRITICAL] Error in getTopDetections:', err.message);
            return [];
        }
    },

    async getTopStaff(limit = 10) {
        try {
            console.log('[DB] Fetching top staff...');
            const { data, error } = await supabase
                .from('user_usage')
                .select('user_id, usage_count')
                .order('usage_count', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[DB ERROR] getTopStaff:', error.message);
                throw error;
            }

            console.log(`[DB] Found ${data ? data.length : 0} usage records.`);
            return data || [];
        } catch (err) {
            console.error('[DB CRITICAL] Error in getTopStaff:', err.message);
            return [];
        }
    }
};
