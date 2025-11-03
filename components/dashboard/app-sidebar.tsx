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
  Landmark,
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
import { Home, LayoutDashboard, Tag, Star, TicketPercentIcon as CouponIcon, PercentIcon, TruckIcon } from "lucide-react";

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
        {
          title: "Stock",
          url: "/admin/dashboard/stock",
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
      title: "Sub-Sub Categories",
      // url: "#",
      icon: List,
      items: [
        {
          title: "All Sub-Sub Category",
          url: "/admin/dashboard/all-sub-sub-category",
        },
        {
          title: "Create Sub-Sub Category",
          url: "/admin/dashboard/create-sub-sub-category",
        },
      ],
    },

    {
      title: "Free delivery",
      // url: "#",
      icon: TruckIcon,
      items: [
        {
          title: "All Offers",
          url: "/admin/dashboard/all-offer",
        },
      ],
    },

    {
      title: "Offers",
      // url: "#",
      icon: PercentIcon,
      items: [
        {
          title: "All Offers",
          url: "/admin/dashboard/all-offer",
        },
        {
          title: "Create offer",
          url: "/admin/dashboard/create-offer",
        },
      ],
    },

    {
      title: "Coupons",
      // url: "#",
      icon: CouponIcon,
      items: [
        {
          title: "All Coupons",
          url: "/admin/dashboard/all-coupons",
        },
        {
          title: "Create Coupon",
          url: "/admin/dashboard/create-coupons",
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
    },

    {
      title: "Featured Management",
      icon: Star,
      items: [
        {
          title: "Featured Category",
          url: "/admin/dashboard/featured-category",
        },
        {
          title: "Featured Product",
          url: "/admin/dashboard/featured-product",
        },
      ],
    },

    {
      title: "Landing Page",
      icon: LayoutDashboard,
      items: [
        {
          title: "Create Slider Images",
          url: "/admin/dashboard/create-slider-page",
        },
        {
          title: "All Slider Images",
          url: "/admin/dashboard/all-slider-images",
        },
        {
          title: "Create Others Images",
          url: "/admin/dashboard/create-others-images",
        },
        {
          title: "All Others Images",
          url: "/admin/dashboard/all-other-images",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="" collapsible="icon" {...props}>
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
