import prisma from "@/lib/prisma";
import { UserRegistrationRequestSchema } from "@/types/dto/userRegisterationRequ";
import { UserUpdatedByAdminSchema } from "@/types/dto/UserUpdatedByAdmin";
import { UserSelfUpdateRequestSchema } from "@/types/dto/UseSelfUpdateRequ";
import { getUser, isPrivileged } from "@/utilis/authentication";
import getPaginationInfo from "@/utilis/pageInforRetrieval";
import bcrypt from "bcryptjs";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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

  const paginationInfo = getPaginationInfo(request);

  const userCount = await prisma.user.count();

  const totalPage = Math.ceil(userCount / paginationInfo.pageNumber);

  if (paginationInfo.pageNumber > totalPage) {
    return NextResponse.json(
      {
        massage: "Page number exceeds total pages",
      },
      {
        status: 400,
      },
    );
  }

  console.log({
    pageNumber: paginationInfo.pageNumber,
    pageSize: paginationInfo.pagesize,
  });

  const users = await prisma.user.findMany({
    skip: (paginationInfo.pageNumber - 1) * paginationInfo.pagesize,
    take: paginationInfo.pagesize,
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
    pagination: {
      pageNumber: paginationInfo.pageNumber,
      pageSize: paginationInfo.pagesize,
      totalPage: totalPage,
      totalCount: userCount,
    },
  });
}

export async function POST(request: NextRequest) {
  // // Check if caller has privilege to add users (e.g. admin)
  // const havePrivilege = await isPrivileged(request, "users:add");

  // if (!havePrivilege) {
  //   return NextResponse.json(
  //     {
  //       message: "You do not have the privilege to add users",
  //     },
  //     {
  //       status: 403,
  //     },
  //   );
  // }

  // email, firstName, lastName, password, phone (optional)

  const body = await request.json();
  try {
    const parseBody = UserRegistrationRequestSchema.parse(body);

    // 2. Check for duplicate email or phone
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parseBody.email,
      },
    });

    if (existingUser != null) {
      return NextResponse.json(
        {
          message: "Email is already registered",
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
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      //console.log(error.issues[0]?.message ?? "Invalid Input");

      return NextResponse.json(
        {
          message: error.issues[0]?.message ?? "Invalid Input",
        },
        {
          status: 400,
        },
      );
    }

    console.log(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

//user's data update function
export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const requiredUser = await getUser(request);

  if (requiredUser == null) {
    return NextResponse.json(
      {
        message: "You are not logged in",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body = await request.json();

    if (requiredUser.Id == id) {
      //never allow users to update their own role and privileges,status

      UserSelfUpdateRequestSchema.parse(body);

      const user = await prisma.user.findUnique({
        where: {
          Id: id,
        },
      });

      if (user == null) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          {
            status: 404,
          },
        );
      }
      await prisma.user.update({
        where: {
          Id: id,
        },
        data: {
          email: body.email || user.email,
          firstName: body.firstName || user.firstName,
          lastName: body.lastName || user.lastName,
          phone: body.phone || user.phone,
          proflePicture: body.proflePicture || user.proflePicture,
        },
      });

      return NextResponse.json({
        message: "User updated successfully",
      });
    } else {
      const havePrivilege = await isPrivileged(request, "users:edit");

      if (!havePrivilege) {
        return NextResponse.json(
          {
            message: "You do not have the privilege to edit oter users",
          },
          {
            status: 403,
          },
        );
      }

      UserUpdatedByAdminSchema.parse(body);

      const user = await prisma.user.findUnique({
        where: {
          Id: id || "0000", // it can be string or null
        },
      });

      if (user == null) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          {
            status: 404,
          },
        );
      }

      await prisma.user.update({
        where: {
          Id: id || "0000", // it can be string or null
        },
        data: {
          //email: body.email || user.email,
          //firstName: body.firstName || user.firstName,
          //lastName: body.lastName || user.lastName,
          //phone: body.phone || user.phone,
          //proflePicture: body.proflePicture || user.proflePicture,
          role: body.role || user.role,
          status: body.status || user.status,
          //privileges: body.privileges || user.privileges,
        },
      });

      return NextResponse.json({
        message: "User updated successfully",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.issues[0]?.message ?? "Invalid Input",
        },
        {
          status: 400,
        },
      );
    } else {
      return NextResponse.json(
        {
          message: "Internal server error",
        },
        {
          status: 500,
        },
      );
    }
  }
}
