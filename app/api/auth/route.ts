import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { emitWarning } from "process";

export async function POST(request : NextRequest) {

    const body = await request.json();
    console.log(body);

    if(body.email == null){
        return NextResponse.json({
            massage : "Email is required"
        })

    }
   
    const user = await prisma.user.findFirst(
        {
            where :{
                email : body.email
            }
        }
    )

    if(user == null){
        return NextResponse.json({
            massage : "User not found"
        })
    }


    const isPasswordvalid = await compare(body.password , user.password)

    if(isPasswordvalid){
        
        const secretText = process.env.JOSE_SECRET
        const secret = new TextEncoder().encode(secretText)

        const token = await new jose.SignJWT({
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            role : user.role,
            privileges : user.privileges
        }).setProtectedHeader({alg : "HS256"}).sign(secret)

        const response = NextResponse.json({
            massage : "Login Successful",
            role : user.role,
        })

        response.cookies.set({
            name : "Login-token",
            value : token,
            httpOnly : true,
            secure: false,
            sameSite : "lax",
            maxAge : 60 * 60 * 24 * 7 
        })

        return response
    }
    else{
        return NextResponse.json({
            massage : "Login Fail"
        })
    }








}

