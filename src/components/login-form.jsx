"use client"

import { cn } from "@/lib/utils";
import { useActionState, useEffect, useState } from "react";
import { showToast } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function LoginForm({
  className,
}) {

  const initialState = {
    message: "",
  };

  const [actionState, setActionState] = useState({
    message: "",
  })

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    try {
      return await login(formData);
    } catch(err) {
      if(err.message == "NEXT_REDIRECT") {
        setActionState({succeed: true, message: ""})
        return {succeed: true, message: ""}
      }
    }
  }, initialState);

  useEffect(() => {showToast(state, "Sesión iniciada")}, [state]);
  useEffect(() => {showToast(actionState, "Sesión iniciada")}, [actionState]);


  return (
    <form className={cn("flex flex-col gap-6", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">¡Bienvenido de nuevo!</h1>
      <div className="grid gap-6">
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
          <Button 
            variant="none" 
            onClick={() => showToast({succeed: false, message: "Comunicate con el administrador"})}
             className="cursor-pointer ml-auto text-sm underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
        <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
          Ingresa
        </Button>
      </div>
      <div className="text-center text-sm">
        ¿No estás registrado?{" "}
        <Link href="/signup" className="underline underline-offset-4">
          Regístrate
        </Link>
      </div>
    </form>
  );
}
