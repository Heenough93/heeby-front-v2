function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
}

function getTelegramChatId() {
  return process.env.TELEGRAM_CHAT_ID?.trim() ?? "";
}

export function getTelegramConfigStatus() {
  const botToken = getTelegramBotToken();
  const chatId = getTelegramChatId();

  return {
    isConfigured: Boolean(botToken && chatId),
    missingBotToken: !botToken,
    missingChatId: !chatId
  };
}

export async function sendTelegramMessage(text: string) {
  const botToken = getTelegramBotToken();
  const chatId = getTelegramChatId();

  if (!botToken || !chatId) {
    throw new Error("missing_telegram_config");
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    throw new Error("telegram_send_failed");
  }

  return response.json();
}
