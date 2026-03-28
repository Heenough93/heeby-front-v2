import { NextResponse } from "next/server";

function getLoginEmail() {
  return process.env.APP_LOGIN_EMAIL?.trim() ?? "";
}

function getLoginPassword() {
  return process.env.APP_LOGIN_PASSWORD?.trim() ?? "";
}

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const loginEmail = getLoginEmail();
  const loginPassword = getLoginPassword();

  if (!loginEmail || !loginPassword) {
    return NextResponse.json(
      {
        code: "missing_credentials",
        message:
          "로그인 계정이 설정되지 않았습니다. .env.local에 APP_LOGIN_EMAIL, APP_LOGIN_PASSWORD를 추가하세요."
      },
      { status: 500 }
    );
  }

  if (email?.trim() !== loginEmail || password?.trim() !== loginPassword) {
    return NextResponse.json(
      {
        code: "invalid_credentials",
        message: "이메일 또는 비밀번호가 올바르지 않습니다."
      },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
