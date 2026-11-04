import { NextRequest, NextResponse } from "next/server";
import { getUser, isPrivileged } from "@/utilis/authentication";
import productCreationSchema from "@/types/dto/productCreationReq";
import z from "zod";
import prisma from "@/lib/prisma";
import { Inter } from "next/font/google";

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
    try {
      const body = await request.json();
      const parsedBody = productCreationSchema.parse(body);

      await prisma.product.create({
        data: {
          sku: parsedBody.sku,
          name: parsedBody.name,
          altName: parsedBody.altNmae,
          description: parsedBody.description,
          stock: parsedBody.stock,
          price: parsedBody.price,
          compareAtPrice: parsedBody.compareAtPrice,
          brand: parsedBody.brand,
          category: parsedBody.category,
          productStatus: parsedBody.productStatus,
          media: {
            create: parsedBody.media,
          },
        },
      });

      return NextResponse.json(
        {
          message: "Product created successfully",
        },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            message: error.issues[0]?.message ?? "Invalid Input",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          message: "Internal Server Error",
        },
        { status: 500 },
      );
    }
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
