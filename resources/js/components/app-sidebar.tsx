import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, ClipboardList, CreditCard, FacebookIcon, FileText, Folder, LayoutGrid, Shield, Tags, UserCog, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Members',
        href: '/members',
        icon: Users,
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: CreditCard,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
    },
    {
        title: 'Activity Logs',
        href: '/activity-logs',
        icon: ClipboardList,
    },
];

const footerNavItemsSettings: NavItem[] = [
    {
        title: 'Payment Types',
        href: '/payment-types',
        icon: Tags,
    },
    {
        title: 'Users',
        href: '/users',
        icon: UserCog,
    },
    {
        title: 'MFA Settings',
        href: '/settings/mfa',
        icon: Shield,
    },
    {
        title: 'Roles & Permissions',
        href: '/roles',
        icon: Shield,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Facebook',
        href: 'https://www.facebook.com/p/Office-of-the-Senior-Citizens-Affairs-LGU-iligan-61562896852421/',
        icon: FacebookIcon,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={footerNavItemsSettings} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
            {/* <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter> */}
        </Sidebar>
    );
}
