import { Building2, PackageSearch } from "lucide-react"
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CardsSection() {
  const router = [
    {name: "Empresas", href: "/dashboard/create/companies", icon: <Building2/>},
    {name: "Productos", href: "/dashboard/create/products", icon: <PackageSearch/>},
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      {router.map((item, index) => {
        return (
          <Link key={index} href={item.href}>
            <Card className="shadow-none w-[100%] max-h-40">
              <CardHeader className="relative px-[10%]">
                <CardTitle className="justify-around flex text-xs sm:text-base md:text-xl font-semibold tabular-nums">
                  {`Crear ${item.name}`}
                  {
                    item.icon
                  }
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        )
      })
      }
    </div>
  )
}
