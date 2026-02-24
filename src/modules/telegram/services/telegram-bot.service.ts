import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/lib/prisma';

export class TelegramBotService {
  private static bot: TelegramBot | null = null;

  static initialize() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.warn('TELEGRAM_BOT_TOKEN not configured');
      return;
    }

    this.bot = new TelegramBot(token, { polling: false });
  }

  static async sendMessage(chatId: string, message: string) {
    if (!this.bot) this.initialize();
    if (!this.bot) throw new Error('Telegram bot not initialized');

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error: any) {
      console.error('Error sending Telegram message:', error);
      throw new Error(`Failed to send Telegram message: ${error.message}`);
    }
  }

  static async getTenantChatId(tenantId: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({
      where: {
        key_tenantId: {
          key: 'telegram_chat_id',
          tenantId,
        },
      },
    });

    return config?.value || null;
  }

  static async setTenantChatId(tenantId: string, chatId: string): Promise<void> {
    await prisma.systemConfig.upsert({
      where: {
        key_tenantId: {
          key: 'telegram_chat_id',
          tenantId,
        },
      },
      create: {
        key: 'telegram_chat_id',
        value: chatId,
        tenantId,
      },
      update: {
        value: chatId,
      },
    });
  }
}
