"use client"

import { cn } from "@/lib/utils"
import { useActionState, useState, useEffect } from "react"
import { showToast } from "@/lib/utils";
import { signup } from "@/lib/actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm({
  className,
}) {

  const initialState = {
    message: "",
  };

  const [actionState, setActionState] = useState({
    message: "",
  })

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkpassword, setCheckpassword] = useState("");

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    try {
      const pass = formData.get("password");
      const checkpassword = formData.get("checkpassword");

      if (pass === checkpassword) {
        formData.delete("checkpassword");
        return await signup(formData);
      } else {
        return { succeed: false, message: "Las contraseñas no coinciden" };
      }
    } catch(err) {
      if(err.message == "NEXT_REDIRECT") {
        setActionState({succeed: true, message: ""})
        return {succeed: true, message: ""}
      }
    }
  }, initialState);

  useEffect(() => {showToast(state, "Cuenta creada correctamente")}, [state]);
  useEffect(() => {showToast(actionState, "Cuenta creada correctamente")}, [actionState]);

  return (
    <form className={cn("flex flex-col gap-6", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">¡Regístrate en Conteo!</h1>
      <div className="grid gap-6">

        <div className="grid gap-3">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)} 
            id="name"
            type="name"
            name="name"
            placeholder="Pepito Pérez"
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            id="password"
            type="password"
            name="password"
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="checkpassword">Ingresa de nuevo tu contraseña</Label>
          <Input
            value={checkpassword}
            onChange={(e) => setCheckpassword(e.target.value)} 
            id="checkpassword"
            type="password"
            name="checkpassword"
            required
          />
        </div>
        <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
          Regístrate
        </Button>
      </div>
    </form>
  );
}
