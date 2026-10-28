import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { emitWarning } from "process";
import { use } from "react";

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log(body);

  if (body.email == null) {
    return NextResponse.json(
      {
        massage: "Email is required",
      },
      {
        status: 422,
      },
    );
  }

  if (body.password == null) {
    return NextResponse.json(
      {
        massage: "password is required",
      },
      {
        status: 422,
      },
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
  });

  if (user == null) {
    return NextResponse.json(
      {
        massage: "User not found",
      },
      {
        status: 404,
      },
    );
  }

  if (user.status != "ACTIVE") {
    return NextResponse.json(
      {
        massage: "Your account is disable. Please contact the Administrator.",
      },
      {
        status: 403,
      },
    );
  }

  const isPasswordvalid = await compare(body.password, user.password);

  if (isPasswordvalid) {
    await prisma.user.update({
      where: {
        Id: user.Id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    const secretText = process.env.JOSE_SECRET;
    const secret = new TextEncoder().encode(secretText);

    const token = await new jose.SignJWT({
      Id : user.Id,  
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      privileges: user.privileges,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    const response = NextResponse.json({
      massage: "Login Successful",
      role: user.role,
    });

    response.cookies.set({
      name: "Login-token",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } else {
    return NextResponse.json(
      {
        massage: "Login Fail",
      },
      {
        status: 403,
      },
    );
  }
}
