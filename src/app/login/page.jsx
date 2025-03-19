import { HeartHandshake } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { login } from "@/lib/actions.js"


export default function LoginPage() {

  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div
              className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <HeartHandshake className="size-4" />
            </div>
            Conteo
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm action={login} method={"POST"}/>
          </div>
        </div>
      </div>
    </div>
  );
}
