"use client"
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct, deleteCompany } from "@/lib/actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TableAction({row, action}) {
  const record = row.original;
  const router = useRouter();

  const name = (function() {
    switch(action) {
      case "delete_product":
        return "Eliminar Producto"
      case "delete_company":
        return "Eliminar Empresa"
      default:
        return "Eliminar Item"
    }
  })();

  async function handleOnClick() {
    let request = null;
    try {
      switch(action) {
        case "delete_product":
          request = await deleteProduct(record.product_id);
          break;
        case "delete_company":
          request = await deleteCompany(record.company_id);
          break;
        default:
          request = { succeed: false, message: "Error al ejecutar acción"};
      }
      showToast(request, "Acción completada correctamente");
      router.refresh();
    } catch(err) {
      showToast({succeed: false, message: err.message}, "");
      console.log(err.message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleOnClick} className="cursor-pointer text-red-500">{name}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
