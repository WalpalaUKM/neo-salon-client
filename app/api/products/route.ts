import { NextRequest, NextResponse } from "next/server";
import { getUser, isPrivileged } from "@/utilis/authentication";
import productCreationSchema from "@/types/dto/productCreationReq";
import z from "zod";
import prisma from "@/lib/prisma";
import getPaginationInfo from "@/utilis/pageInforRetrieval";
import { ProductStatus } from "@/app/generated/prisma/enums";
import {
  MediaArraySchema,
  productUpdateSchema,
} from "@/types/dto/productUpdate";

export async function GET(request: NextRequest) {
  const paginationInfo = getPaginationInfo(request);

  const hasPrivileges = await isPrivileged(request, "products:view");

  if (hasPrivileges) {
    //All products except DELETED
    const totalProductCount = await prisma.product.count({
      where: {
        NOT: {
          productStatus: ProductStatus.DELETED,
        },
      },
    });

    const totalPage = Math.ceil(totalProductCount / paginationInfo.pageNumber);
    /*
  if (paginationInfo.pageNumber > totalPage) {
    return NextResponse.json(
      {
        message: "Page number exceeds total pages",
      },
      {
        status: 400,
      },
    );
  }*/

    const products = await prisma.product.findMany({
      skip: (paginationInfo.pageNumber - 1) * paginationInfo.pagesize,
      take: paginationInfo.pagesize,
      include: {
        media: true,
      },
      where: {
        NOT: {
          productStatus: ProductStatus.DELETED,
        },
      },
    });

    return NextResponse.json({
      message: "Products fetched successfully",
      products: products,
      pagination: {
        pageNumber: paginationInfo.pageNumber,
        pageSize: paginationInfo.pagesize,
        totalPage: totalPage,
        totalCount: totalProductCount,
      },
    });
  } else {
    const totalProductCount = await prisma.product.count({
      where: {
        productStatus: ProductStatus.ACTIVE,
      },
    });

    const totalPage = Math.ceil(totalProductCount / paginationInfo.pageNumber);

    const products = await prisma.product.findMany({
      skip: (paginationInfo.pageNumber - 1) * paginationInfo.pagesize,
      take: paginationInfo.pagesize,
      include: {
        media: true,
      },
      where: {
        productStatus: ProductStatus.ACTIVE,
      },
    });

    return NextResponse.json({
      message: "Products fetched successfully",
      products: products,
      pagination: {
        pageNumber: paginationInfo.pageNumber,
        pageSize: paginationInfo.pagesize,
        totalPage: totalPage,
        totalCount: totalProductCount,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  const hasPrivileges = await isPrivileged(request, "products:add");

  if (hasPrivileges) {
    try {
      const body = await request.json();
      const parsedBody = productCreationSchema.parse(body);

      //const a = {...parsedBody};

      await prisma.product.create({
        data: {
          sku: parsedBody.sku,
          name: parsedBody.name,
          altName: parsedBody.altName,
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

export async function DELETE(request: NextRequest) {
  const hasPrivileges = await isPrivileged(request, "products:delete");

  if (!hasPrivileges) {
    return NextResponse.json(
      {
        message:
          "You don't have the required privileges to perform this action.",
      },
      { status: 403 },
    );
  }

  const productId = request.nextUrl.searchParams.get("id");

  if (!productId) {
    return NextResponse.json(
      {
        message: "Product id is required to delete a product.",
      },
      { status: 400 },
    );
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        Id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          message: "Product not found.",
        },
        { status: 404 },
      );
    }

    await prisma.product.update({
      where: {
        Id: productId,
      },
      data: {
        productStatus: ProductStatus.DELETED,
      },
    });

    return NextResponse.json(
      {
        message: "Product deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  const hasPrivileges = await isPrivileged(request, "products:update");

  if (!hasPrivileges) {
    return NextResponse.json(
      {
        message: "You don't have privileges for update products",
      },
      { status: 403 },
    );
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        message: "Product id is required to update a product.",
      },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const parsedBody = productUpdateSchema.parse(body);

    const existingProduct = await prisma.product.findUnique({
      where: {
        Id: id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          message: "Product not found.",
        },
        { status: 404 },
      );
    }

    if (existingProduct.productStatus === ProductStatus.DELETED) {
      return NextResponse.json(
        { message: "Cannot update a deleted product." },
        { status: 400 },
      );
    }

    await prisma.product.update({
      where: {
        Id: id,
      },
      data: {
        sku: parsedBody.sku || existingProduct.sku,
        name: parsedBody.name || existingProduct.name,
        altName: parsedBody.altName || existingProduct.altName,
        description: parsedBody.description || existingProduct.description,
        stock: parsedBody.stock || existingProduct.stock,
        price: parsedBody.price || existingProduct.price,
        compareAtPrice:
          parsedBody.compareAtPrice || existingProduct.compareAtPrice,
        brand: parsedBody.brand || existingProduct.brand,
        category: parsedBody.category || existingProduct.category,
        productStatus:
          parsedBody.productStatus || existingProduct.productStatus,
      },
    });

    if (parsedBody.media != null && parsedBody.media.length > 0) {
      const parseMediaArray = MediaArraySchema.parse(parsedBody.media);

      await prisma.media.deleteMany({
        where: {
          productId: id,
        },
      });
      await prisma.product.update({
        where: {
          Id: id,
        },
        data: {
          media: {
            create: parseMediaArray,
          },
        },
      });
    }

    return NextResponse.json(
      {
        message: "Product updated successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error updating product:", error);
      return NextResponse.json(
        {
          message: error.issues[0]?.message ?? "Invalid Input",
        },
        { status: 400 },
      );
    }

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
