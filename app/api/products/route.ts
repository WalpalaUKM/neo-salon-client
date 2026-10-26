import { NextRequest } from "next/server";

export function GET(request : NextRequest){

    const cookies = request.cookies.get("login-token")?.value
    console.log(cookies)

    console.log("Get request reveived")

}