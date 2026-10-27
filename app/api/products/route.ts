import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { getUser } from "@/utilis/authentication";


export async function GET(request : NextRequest){

    const user = getUser(request)

    console.log("User :",user);
    
    return NextResponse.json({
                massage : "ok"
            })

}