import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Home, Compass, Bell, Menu, Film, Ticket, LogOut, Settings, Heart, LogIn } from "lucide-react";
import { Wordmark } from "./Logo";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const linkCls = "relative grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground";
const active = { className: "!text-primary bg-secondary" };

export function Header() {
  const { profile, userId } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: unread = 0, refetch } = useQuery({
    queryKey: ["unread", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return 0;
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("read", false);
      return count ?? 0;
    },
  });
  const { data: savedCount = 0 } = useQuery({
    queryKey: ["savedCount", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return 0;
      const { count } = await supabase.from("saves").select("content_id", { count: "exact", head: true }).eq("user_id", userId);
      return count ?? 0;
    },
  });
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel("notif-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, refetch]);

  const nav = (
    <>
      <Link to="/" className={linkCls} activeProps={active} activeOptions={{ exact: true }} aria-label="Home"><Home className="h-5 w-5" /></Link>
      <Link to="/reels" className={linkCls} activeProps={active} aria-label="Reels"><Film className="h-5 w-5" /></Link>
      <Link to="/explore" className={linkCls} activeProps={active} aria-label="Explore"><Compass className="h-5 w-5" /></Link>
      <Link to="/notifications" className={linkCls} activeProps={active} aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
      </Link>
      <Link to="/messages" className={linkCls} activeProps={active} aria-label="Messages"><span aria-hidden="true" className="text-lg leading-none">🗣️</span></Link>
    </>
  );

  if (pathname.startsWith("/create")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 pt-[var(--app-safe-top)] pl-[var(--app-safe-left)] pr-[var(--app-safe-right)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-5">
        <Link to="/" className="min-w-0 flex-1 sm:flex-none" aria-label="SAC Community home"><Wordmark /></Link>
        {userId ? (
          <>
            <nav aria-label="Primary navigation" className="hidden items-center gap-1 sm:flex">{nav}</nav>
             <div className="flex shrink-0 items-center gap-0 sm:gap-1">
              <Link to="/saved" className={linkCls} activeProps={active} aria-label="Favourites">
                <Heart className="h-5 w-5" />
                {savedCount > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{savedCount}</span>}
              </Link>
              {profile && (
                <Link to="/u/$username" params={{ username: profile.username }} aria-label="Profile" className="rounded-full p-0.5 transition hover:ring-2 hover:ring-primary">
                  <UserAvatar src={profile.avatar_url} name={profile.display_name} size={34} />
                </Link>
              )}
            </div>
          </>
        ) : (
           <Button asChild variant="hero" className="shrink-0"><Link to="/auth">Sign in</Link></Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-muted-foreground" aria-label="Menu" title="Menu"><Menu className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-48">
            {userId && <>
              <DropdownMenuItem onSelect={() => navigate({ to: "/explore" })}><Compass className="mr-2 h-4 w-4" />Search</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate({ to: "/bookings" })}><Ticket className="mr-2 h-4 w-4" />My bookings</DropdownMenuItem>
            </>}
            <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            {userId
              ? <DropdownMenuItem onSelect={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
              : <DropdownMenuItem onSelect={() => navigate({ to: "/auth" })}><LogIn className="mr-2 h-4 w-4" />Sign in</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {userId && (
        <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/60 bg-background/95 px-2 pt-1.5 pb-[calc(var(--app-safe-bottom)+0.375rem)] backdrop-blur-xl sm:hidden">{nav}</nav>
      )}
    </header>
  );
}
