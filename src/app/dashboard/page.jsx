"use server"
import { columns } from "./columns.jsx";
import { DataTable } from "./data-table.jsx";
import { getCurrentUserID, getProductsAndCompanies } from "@/lib/actions"

export default async function DashboardPage() {
  let userID = null;
  let products = [];

  try {
    const requestID = await getCurrentUserID();
    if(requestID.succeed) {

      userID = requestID.payload;

      const requestProducts = await getProductsAndCompanies(userID);
      if(requestProducts.succeed) {
        products = requestProducts.payload
      }
    }
  } catch(err) {
    console.log(err.message);
  }
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={products} />
    </div>
  );
}
