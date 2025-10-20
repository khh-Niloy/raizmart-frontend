"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  FileText,
  Frame,
  GalleryVerticalEnd,
  List,
  Map,
  PieChart,
  Settings2,
  ShoppingCart,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavProjects } from "@/components/dashboard/nav-projects";
import { NavUser } from "@/components/dashboard/nav-user";
import { TeamSwitcher } from "@/components/dashboard/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Home, Tag } from "lucide-react";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Product Management",
      // url: "",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "All Product",
          url: "/admin/dashboard/all-product",
        },
        {
          title: "Add Product",
          url: "/admin/dashboard/add-product",
        },
      ],
    },
    {
      title: "Blogs",
      // url: "#",
      icon: FileText,
      items: [
        {
          title: "Add Blog",
          url: "/admin/dashboard/add-blog",
        },
        {
          title: "All Blog",
          url: "/admin/dashboard/all-blog",
        },
      ],
    },

    {
      title: "Blog Categories",
      icon: Tag,
      items: [
        {
          title: "All Blog Category",
          url: "/admin/dashboard/all-blog-category",
        },
        {
          title: "Add Blog Category",
          url: "/admin/dashboard/add-blog-category",
        },
      ],
    },

    {
      title: "Categories",
      // url: "#",
      icon: List,
      items: [
        {
          title: "All Category",
          url: "/admin/dashboard/all-category",
        },
        {
          title: "Create Category",
          url: "/admin/dashboard/create-category",
        },
      ],
    },

    {
      title: "Sub Categories",
      // url: "#",
      icon: List,
      items: [
        {
          title: "All Sub Category",
          url: "/admin/dashboard/all-sub-category",
        },
        {
          title: "Create Sub Category",
          url: "/admin/dashboard/create-sub-category",
        },
      ],
    },
    
    {
      title: "Offers and Free delivery",
      // url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "Manage Offers",
          url: "/admin/dashboard/manage-offers",
        },
        {
          title: "Manage Free Delivery",
          url: "/admin/dashboard/manage-free-delivery",
        },
      ],
    },

    {
      title: "Brand",
      icon: Tag,
      items: [
        {
          title: "All Brand",
          url: "/admin/dashboard/all-brand",
        },
        {
          title: "Create Brand",
          url: "/admin/dashboard/create-brand",
        },
      ],
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="pt-16 md:pt-20" collapsible="icon" {...props}>
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
