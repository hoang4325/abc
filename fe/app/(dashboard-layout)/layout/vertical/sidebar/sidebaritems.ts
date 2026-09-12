export interface ChildItem {
  id?: number | string;
  name: string;
  icon?: LucideIcon;
  items?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
  isActive?: boolean;
  external?: boolean;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: LucideIcon;
  id?: number;
  to?: string;
  item?: MenuItem[];
  items?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
  isActive?: boolean;
  isPro?: boolean;
}

import { uniqueId } from "lodash";

import {
  House,
  Table2,
  Form,
  CircleUserRound,
  NotebookText,
  BookOpen,
  Ticket,
  Component,
  Banknote,
  CreditCard,
  PieChart,
  Smile,
  Unlink,
  LogIn,
  UserPlus,
  Lock,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

const SidebarContent: MenuItem[] = [
  {
    heading: "Dashboard",
    items: [
      {
        id: uniqueId(),
        name: "Modern",
        icon: House,
        url: "/",
      },
    ],
  },
  {
    heading: "Pages",
    items: [
      {
        id: uniqueId(),
        name: "Table",
        icon: Table2,
        url: "/pages/tables",
      },
      {
        id: uniqueId(),
        name: "Form",
        icon: Form,
        url: "/pages/form",
      },
      {
        id: uniqueId(),
        name: "User Profile",
        icon: CircleUserRound,
        url: "/pages/user-profile",
      },
    ],
  },
  {
    heading: "Apps",
    items: [
      {
        id: uniqueId(),
        name: "Ghi chú",
        icon: NotebookText,
        url: "/apps/notes",
      },
      {
        id: uniqueId(),
        name: "Bài viết",
        icon: BookOpen,
        url: "/blogs",
      },
      {
        id: uniqueId(),
        name: "Tickets",
        icon: Ticket,
        url: "/apps/tickets",
      },
    ],
  },
  {
    heading: "UI ELEMENTS",
    items: [
      {
        name: "ShadCn",
        id: uniqueId(),
        icon: Component,
        items: [
          {
            id: uniqueId(),
            name: "Button",
            url: "https://shadcndashboard.dev/components/button",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Avatar",
            url: "https://shadcndashboard.dev/components/avatar",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Badge",
            url: "https://shadcndashboard.dev/components/badge",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Tooltip",
            url: "https://shadcndashboard.dev/components/tooltip",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Input",
            url: "https://shadcndashboard.dev/components/input",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Textarea",
            url: "https://shadcndashboard.dev/components/textarea",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Switch",
            url: "https://shadcndashboard.dev/components/switch",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Tab",
            url: "https://shadcndashboard.dev/components/tab",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Select",
            url: "https://shadcndashboard.dev/components/select",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Checkbox",
            url: "https://shadcndashboard.dev/components/checkbox",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Accordion",
            url: "https://shadcndashboard.dev/components/accordion",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Card",
            url: "https://shadcndashboard.dev/components/card",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Radio Group",
            url: "https://shadcndashboard.dev/components/radio-group",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Datepicker",
            url: "https://shadcndashboard.dev/components/calendar",
            external: true,
          },
        ],
      },
    ],
  },
  {
    heading: "FORM ELEMENTS",
    items: [
      {
        name: "Shadcn Forms",
        id: uniqueId(),
        icon: Banknote,
        items: [
          {
            id: uniqueId(),
            name: "Input",
            url: "https://shadcndashboard.dev/components/input",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Select",
            url: "https://shadcndashboard.dev/components/select",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Checkbox",
            url: "https://shadcndashboard.dev/components/checkbox",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Radio",
            url: "https://shadcndashboard.dev/components/radio-group",
            external: true,
          },
          {
            id: uniqueId(),
            name: "Datepicker",
            url: "https://shadcndashboard.dev/components/calendar",
            external: true,
          },
        ],
      },
    ],
  },
  {
    heading: "Widgets",
    items: [
      {
        name: "Cards",
        id: uniqueId(),
        icon: CreditCard,
        url: "https://shadcndashboard.dev/ui-blocks/card",
        external: true,
      },
      {
        name: "Charts",
        id: uniqueId(),
        icon: PieChart,
        url: "https://shadcndashboard.dev/ui-blocks/chart",
        external: true,
      },
    ],
  },
  {
    heading: "Icons",
    items: [
      {
        id: uniqueId(),
        name: "Iconify Icons",
        icon: Smile,
        url: "/icons/iconify",
      },
    ],
  },
  {
    heading: "Auth",
    items: [
      {
        id: uniqueId(),
        name: "Error",
        icon: Unlink,
        url: "/auth/error",
      },
      {
        name: "Login",
        id: uniqueId(),
        icon: LogIn,
        items: [
          {
            id: uniqueId(),
            name: "Boxed Login",
            url: "/auth/auth2/login",
          },
        ],
      },
      {
        name: "Register",
        id: uniqueId(),
        icon: UserPlus,
        items: [
          {
            id: uniqueId(),
            name: "Boxed Register",
            url: "/auth/auth2/register",
          },
        ],
      },
      {
        name: "Forgot Password",
        id: uniqueId(),
        icon: Lock,
        items: [
          {
            id: uniqueId(),
            name: "Boxed Forgot Pwd",
            url: "/auth/auth2/forgot-password",
          },
        ],
      },
      {
        name: "Two Steps",
        id: uniqueId(),
        icon: ShieldCheck,
        items: [
          {
            id: uniqueId(),
            name: "Boxed Two Steps",
            url: "/auth/auth2/two-steps",
          },
        ],
      },
    ],
  },
];

export default SidebarContent;
