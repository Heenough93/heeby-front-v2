import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/features/routines/lib/routine-telegram";

export async function POST(request: Request) {
  const { message } = (await request.json()) as {
    message?: string;
  };
  const trimmedMessage = message?.trim() ?? "";

  if (!trimmedMessage) {
    return NextResponse.json(
      {
        code: "invalid_message",
        message: "테스트 발송할 메시지를 입력해주세요."
      },
      { status: 400 }
    );
  }

  try {
    await sendTelegramMessage(trimmedMessage);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "missing_telegram_config") {
      return NextResponse.json(
        {
          code: "missing_telegram_config",
          message:
            "텔레그램 발송 설정이 없습니다. .env.local에 TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID를 추가하세요."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        code: "telegram_send_failed",
        message: "텔레그램 테스트 발송에 실패했습니다."
      },
      { status: 502 }
    );
  }
}
