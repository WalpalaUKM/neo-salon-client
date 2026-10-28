import prisma from "@/lib/prisma";
import { getUser, isPrivileged } from "@/utilis/authentication";
import bcrypt, { hash } from "bcryptjs";
import { getURL } from "next/dist/shared/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const havePrivilege = await isPrivileged(request, "users:read");

  if (!havePrivilege) {
    return NextResponse.json(
      {
        message: "You do not have the privilege to view users",
      },
      {
        status: 403,
      },
    );
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
    },
  });

  return NextResponse.json({
    message: "users fetched successfully",
    users: users,
  });
}

export async function POST(request: NextRequest) {
  // Check if caller has privilege to add users (e.g. admin)
  const havePrivilege = await isPrivileged(request, "users:add");

  if (!havePrivilege) {
    return NextResponse.json(
      {
        message: "You do not have the privilege to add users",
      },
      {
        status: 403,
      },
    );
  }

  try {
    // email, firstName, lastName, password, phone (optional)
    const body = await request.json();

    // 1. Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 422 },
      );
    }

    if (!body.firstName) {
      return NextResponse.json(
        { message: "First name is required" },
        { status: 422 },
      );
    }

    if (!body.lastName) {
      return NextResponse.json(
        { message: "Last name is required" },
        { status: 422 },
      );
    }

    if (!body.password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 422 },
      );
    }

    // 2. Check for duplicate email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          ...(body.phone ? [{ phone: body.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            existingUser.email === body.email
              ? "Email is already registered"
              : "Phone number is already registered",
        },
        { status: 409 },
      );
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // 4. Create the user
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: hashedPassword,
        phone: body.phone || null,
      }
    });

    return NextResponse.json(
      {
        message: "User created successfully"
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

//user's data update
export async function PUT(request: NextRequest) {
  
  const id = request.nextUrl.searchParams.get("id")
  
  const requiredUser =await getUser(request)

  if(requiredUser ==null){
    return NextResponse.json({
      massage : "Your not logged in"
    },{
      status :401
    })
  }

  if(requiredUser.Id == id){
    return NextResponse.json({
      massage : ""
    })
    
  }else{
    return NextResponse.json({

    })
  }
  




}