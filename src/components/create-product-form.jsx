"use client"

import { cn } from "@/lib/utils";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { showToast } from "@/lib/utils";
import { createProduct } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateForm({
  className,
  companies
}) {

  const initialState = {
    message: "",
  };

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    return await createProduct(formData);
  }, initialState);

  function handleChange(e) {
    const input = e.target.value;
    if(!/^[0-9]$/.test(input)) {
      e.target.value = input.replace(/\D/g, "");
    }
    if(e.target.name === "product_quantity") {
      setQuantity(e.target.value)
    }

    if(e.target.name === "product_price") {
      setPrice(e.target.value)
    }
  }
  useEffect(() => {
    if(state.succeed) {
      setName("");
      setQuantity("");
      setPrice("");
      setDescription("");
      setCompany("");
    }
    showToast(state, "Producto creado correctamente")}, 
    [state]);

  return (
    <form className={cn("flex flex-col gap-6 lg:mx-[5%] xl:mx-[10%]", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">Crea tu producto</h1>
      <div className="grid gap-6">

        <div className="grid gap-3">
          <Label htmlFor="name">Nombre de producto</Label>
          <Input
          id="product_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="name"
          name="product_name"
          placeholder="Producto 1"
          required 
          />
        </div>

        <div className="grid grid-cols-2 gap-5">

          <div className="grid justify-items-start">
            <div className="w-[70%]">
              <Label className="mb-3" htmlFor="password">Cantidad de producto</Label>
              <Input
                onChange={handleChange}
                value={quantity}
                placeholder="6"
                id="product_quantity"
                name="product_quantity"
                required
              />
            </div>
          </div>

          <div className="grid justify-items-end">
            <div className="w-[70%]">
              <Label className="mb-3" htmlFor="password">Precio de producto (COP)</Label>
              <Input
                onChange={handleChange}
                placeholder="15000"
                value={price}
                id="product_price"
                name="product_price"
                required
              />
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="commission">Empresa</Label>
            <Select onValueChange={(value) => setCompany(String(value))} name="company_id" required>
              <SelectTrigger className="w-[70%]">
                <SelectValue placeholder="Selecciona una empresa"/>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) =>
                  <SelectItem 
                    key={company.company_id}
                    value={String(company.company_id)}
                  >
                    {`${company.company_name}`}
                  </SelectItem>
                )}

                {!companies.length && (
                  <SelectItem disabled value="''">
                    No hay Datos
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>


        </div>

          <div className="w-[100%]">
            <Label className="mb-3" htmlFor="password">Descripción del  producto</Label>
            <Textarea
              className="min-h-[100px] max-h-[150px]"
              id="product_description"
              onChange={(e)=> setDescription(e.target.value)}
              value={description}
              name="product_description"
              placeholder="Descripción del producto..."
              required
            />
          </div>

        <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
          Generar producto
        </Button>

      </div>
    </form>
  );
}
