import { auth } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const JWT_EXPIRES_IN = "2h";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login." },
        { status: 401 }
      );
    }

    if (session.user.isBlocked === true) {
      return NextResponse.json(
        { success: false, message: "Your account has been blocked." },
        { status: 403 }
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT issuance error: JWT_SECRET is not configured");
      return NextResponse.json(
        { success: false, message: "Server authentication configuration is missing." },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
      },
      secret,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: "pizzahub",
      }
    );

    return NextResponse.json(
      {
        success: true,
        token,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("JWT issuance error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to issue authentication token." },
      { status: 500 }
    );
  }
}
