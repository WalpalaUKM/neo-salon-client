import prisma from "@/lib/prisma";
import { isPrivileged } from "@/utilis/authentication";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("id");

  if (!productId) {
    return NextResponse.json(
      {
        message: "Product id is required to fetch a product.",
      },
      { status: 400 },
    );
  }
  try {
    const product = await prisma.product.findUnique({
      where: {
        Id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found.",
        },
        { status: 404 },
      );
    }

    if (product.productStatus === "DELETED") {
      return NextResponse.json(
        {
          message: "Product not found.",
        },
        { status: 404 },
      );
    }

    if (product.productStatus === "INACTIVE") {
      const hasPrivileges = await isPrivileged(request, "products:view");

      if (!hasPrivileges) {
        return NextResponse.json(
          {
            message: "Product not found.",
          },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
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
