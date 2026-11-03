import { NextRequest, NextResponse } from "next/server";
import { getUser, isPrivileged } from "@/utilis/authentication";

export async function GET(request: NextRequest) {
  const user = getUser(request);

  console.log("User :", user);

  return NextResponse.json({
    massage: "ok",
  });
}

export async function POST(request: NextRequest) {
  const hasPrivileges = await isPrivileged(request, "products:add");

  if (hasPrivileges) {
  } else {
    return NextResponse.json(
      {
        message:
          "You don't have the required privileges to perform this action.",
      },
      { status: 403 },
    );
  }
}
