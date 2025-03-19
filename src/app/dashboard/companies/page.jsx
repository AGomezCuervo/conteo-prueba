"use server"
import { columns } from "./columns.jsx";
import { DataTable } from "./data-table.jsx";
import { getCurrentUserID, getCompanies } from "@/lib/actions"

export default async function DashboardPage() {
  let userID = null;
  let companies = [];

  try {
    const requestID = await getCurrentUserID();
    if(requestID.succeed) {

      userID = requestID.payload;

      const requestCompanies = await getCompanies(userID);
      if(requestCompanies.succeed) {
        companies = requestCompanies.payload
      }
    }
  } catch(err) {
    console.log(err.message);
  }
  return (
    <div>
      <DataTable columns={columns} data={companies} />
    </div>
  );
}
