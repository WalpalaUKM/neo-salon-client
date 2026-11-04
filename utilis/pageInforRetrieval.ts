import { NextRequest } from "next/server";

export default function getPaginationInfo(request: NextRequest) {
  // Implementation for retrieving pagination information
  const pageNumberInstring =
    request.nextUrl.searchParams.get("pageNumber") || " 1";
  const pageSizeInstring = request.nextUrl.searchParams.get("pageSize") || "10";

  const pageNumber = parseInt(pageNumberInstring);
  const pagesize = parseInt(pageSizeInstring);

  return { pageNumber: pageNumber, pagesize: pagesize };
}
