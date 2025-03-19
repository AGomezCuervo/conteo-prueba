"use client"
import { Fragment } from "react"
import { usePathname } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({children}) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const createIndex = pathSegments.indexOf("create")

  const aux = pathSegments[createIndex];
  pathSegments[createIndex] = pathSegments[createIndex + 1];
  pathSegments[createIndex + 1] = aux;

  return (
    <div>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "19rem"
          }
        }>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments.map((segment, index) => {
                  const href = "/" + pathSegments.slice(0, index + 1).join("/");
                  const isLast = index === pathSegments.length - 1;

                  return (
                    <Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}

                      {segment !== "dashboard" && (
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage className="capitalize">{segment}</BreadcrumbPage>
                          ) : (
                              <BreadcrumbLink className="capitalize" href={href}>
                                {segment}
                              </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                      )}
                    </Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
