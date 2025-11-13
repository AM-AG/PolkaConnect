import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Send,
  Clock,
  Users2,
  Lock,
  Vote,
  Network,
  History,
  Code2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const coreItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Assets",
    url: "/assets",
    icon: Wallet,
    testId: "link-assets",
  },
  {
    title: "Swap",
    url: "/swap",
    icon: ArrowLeftRight,
    testId: "link-swap",
  },
  {
    title: "Transfer",
    url: "/transfer",
    icon: Send,
    testId: "link-transfer",
  },
  {
    title: "History",
    url: "/history",
    icon: Clock,
    testId: "link-history",
  },
  {
    title: "Community",
    url: "/community",
    icon: Users2,
    testId: "link-community",
  },
];

const polkadotItems = [
  {
    title: "Staking",
    url: "/staking",
    icon: Lock,
    testId: "link-staking",
  },
  {
    title: "Governance",
    url: "/governance",
    icon: Vote,
    testId: "link-governance",
  },
  {
    title: "Network",
    url: "/network",
    icon: Network,
    testId: "link-network",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: History,
    testId: "link-transactions",
  },
];

const developerItems = [
  {
    title: "Developer SDK",
    url: "/developer",
    icon: Code2,
    testId: "link-developer",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">●</span>
            </div>
            <span className="font-bold text-xl">PolkaConnect</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.url} 
                        className="flex items-center gap-2"
                        data-testid={item.testId}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Polkadot Network</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {polkadotItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.url} 
                        className="flex items-center gap-2"
                        data-testid={item.testId}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Developer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {developerItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.url} 
                        className="flex items-center gap-2"
                        data-testid={item.testId}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
