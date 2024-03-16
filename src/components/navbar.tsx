"use client"

import { useSafeAccountClient } from "~/components/safe-account-provider";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import * as React from "react"
import Link from "next/link"

import { cn } from "~/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Artist Dashboard",
    href: "/artist/dashboard",
    description:
      "Manage your music, royalties & more",
  },
  {
    title: "Upload a Tune",
    href: "/artist/dashboard?state=upload",
    description:
      "Create a new tune to be listed on the public marketplace.",
  },
  {
    title: "Settings",
    href: "/artist/dashboard?state=settings",
    description:
      "Update your artist profile.",
  },
]

export function Nav() {
  const safeAccountClient = useSafeAccountClient();
  const {
    handleLogOut,
    primaryWallet
  } = useDynamicContext();

  return (
    <div className="w-full flex items-center justify-between pt-5"> {/* Wrapper to ensure full width and centering */}
      <Link href="/" passHref>
        <div className="font-extrabold tracking-tight ml-5">IndieTunes</div>
      </Link>
      <NavigationMenu className="block w-full flex justify-center align-center">
        <NavigationMenuList className="flex justify-center align-center w-full gap-2">
          <NavigationMenuItem>
            {/* <Link href="/" passHref> */}
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/" passHref>
              Discover
            </NavigationMenuLink>
            {/* </Link> */}
          </NavigationMenuItem>

          {!primaryWallet && !safeAccountClient?.account ? (
            <>
              <NavigationMenuItem>
                <DynamicWidget />
              </NavigationMenuItem>
            </>
          ) : (
            <>
              <NavigationMenuItem>
                <NavigationMenuTrigger>For Artists</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-1 lg:w-[400px] ">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/profile" passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    My Profile
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
