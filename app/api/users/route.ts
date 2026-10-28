import prisma from "@/lib/prisma";
import { getUser, isPrivileged } from "@/utilis/authentication";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

  const havePrivilage = await isPrivileged(request,   "users:read")

  if(!havePrivilage){
    return NextResponse.json({
      masssge : "You do not have the privilege to view users"
    },
  {
    status : 403
  })
  }

  
    const users = await prisma.user.findMany({
      select: {
        Id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        privileges: false,
      },
    });

    return NextResponse.json({
      massage: "users fetched successfully",
      users: users,
    });
  }
