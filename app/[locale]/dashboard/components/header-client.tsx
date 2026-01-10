"use client";

import { Search, Bell, MessageSquare, Grid } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";
import { useTranslations } from "next-intl";

export function HeaderClient() {
  const t = useTranslations("common");
  const tHeader = useTranslations("header");

  return (
    <div className="flex h-16 items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-lg">
          A
        </div>
        <span className="text-xl font-bold">Amdash</span>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("search")}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />

        <Button variant="ghost" size="icon">
          <Grid className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                7
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t("notifications")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem
                  key={i}
                  className="flex flex-col items-start p-3"
                >
                  <p className="text-sm font-medium">New Notification {i}</p>
                  <p className="text-xs text-muted-foreground">2 min ago</p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                8
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Messages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem
                  key={i}
                  className="flex flex-col items-start p-3"
                >
                  <p className="text-sm font-medium">New Message {i}</p>
                  <p className="text-xs text-muted-foreground">5 min ago</p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Pauline Sei</p>
                <p className="text-xs text-muted-foreground">Web Designer</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{tHeader("myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
            <DropdownMenuItem>{t("logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
