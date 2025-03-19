"use server"
import { CreateForm } from "@/components/create-product-form";
import { getCurrentUserID, getCompanies } from "@/lib/actions"

export default async function DashboardCreateProductPage() {
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
    console.log(err.message)
  }

  return (
    <div>
      <CreateForm companies={companies} />
    </div>
  );
}
