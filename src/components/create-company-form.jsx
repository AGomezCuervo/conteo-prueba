"use client"

import { cn } from "@/lib/utils";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createCompany } from "@/lib/actions"
import { Label } from "@/components/ui/label";
import { getCurrentUserID } from "@/lib/actions.js";

export function CreateForm({
  className,
}) {

  const router = useRouter()
  const initialState = {
    message: "",
  };

  const [companyName, setCompanyName] = useState("");

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    const companyName = formData.get("company_name");
    const request = await getCurrentUserID();
    let user_id = null;
    if(request.succeed) {
      user_id = request.payload;
    } else {
      return { succeed: false, message: request.message }
    }

    formData.append("user_id", user_id);

    if (companyName.length === 0) {
      return { succeed: false, message: "La empresa debe tener un nombre"};
    } else {
      const response =  await createCompany(formData);
      if(response.succeed) {
        setCompanyName("");
      }
      return response;
    }
  }, initialState);

  useEffect(() => { showToast(state, "Empresa creada correctamente") } ,[state]);

  return (
    <div>
      <form className={cn("flex flex-col gap-6 lg:mx-[5%] xl:mx-[10%]", className)} action={formAction}>
        <h1 className="text-2xl font-bold text-center">Crea tu nueva empresa</h1>
        <div className="grid gap-6">

          <div className="grid gap-3">
            <Label htmlFor="company_name">Nombre de la empresa</Label>
            <Input
              onChange={(e) => setCompanyName(e.target.value)}
              value={companyName}
              id="company_name"
              type="company_name"
              name="company_name"
              placeholder="Conteo"
              required
            />

          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
            Crear empresa
          </Button>
        </div>
      </form>
    </div>
  );
}
