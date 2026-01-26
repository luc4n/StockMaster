
import { supabase } from '../supabaseClient';

export const sendTelegramMessage = async (text: string) => {
    try {
        const { data } = await supabase
            .from('integrations_config')
            .select('*')
            .eq('provider', 'telegram')
            .single();

        if (!data || !data.is_active) {
            console.log('Telegram integration is disabled or not configured.');
            return;
        }

        const { bot_token, chat_id } = data.settings;

        if (!bot_token || !chat_id) {
            console.warn('Telegram bot_token or chat_id missing.');
            return;
        }

        const response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chat_id,
                text: text,
                parse_mode: 'Markdown',
            }),
        });

        const result = await response.json();
        if (!result.ok) {
            console.error('Telegram API error:', result.description);
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};
