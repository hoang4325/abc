"use client";

import Link from "next/link";
import NavItem from "../nav-items/index";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { MenuItem, ChildItem } from "../sidebaritems";

interface NavCollapseProps {
  menu: MenuItem[];
  className?: string;
}

export default function NavCollapse({ menu, className }: NavCollapseProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapse = state === "collapsed";

  const isItemActive = (item: ChildItem | MenuItem, path: string): boolean => {
    if (!item.url) return false;

    if (item.url === "/blogs" || item.name === "Bài viết") {
      return path === "/blogs" || path.startsWith("/blogs/");
    }

    if (path === item.url) return true;

    return false;
  };

  const isActiveRoute = (item: ChildItem): boolean => {
    if (isItemActive(item, pathname)) return true;
    if (item.items) return item.items.some(isActiveRoute);
    return false;
  };

  return (
    <>
      {menu.map((section, index) => (
        <div key={index}>
          <span
            className={cn(
              "text-xs uppercase block font-semibold text-muted-foreground mb-2 transition-all duration-200",
              isCollapse
                ? "text-center group-hover:text-start group-data-[state=expanded]:text-start"
                : ""
            )}
          >
            {isCollapse ? (
              <>
                <span className="group-hover:hidden group-data-[state=expanded]:hidden">
                  ...
                </span>
                <span className="hidden group-hover:inline group-data-[state=expanded]:inline">
                  {section.heading ?? ""}
                </span>
              </>
            ) : (
              section.heading ?? ""
            )}
          </span>

          {section.items?.map((item: ChildItem, index) => {
            const hasChildren =
              Array.isArray(item.items) && item.items.length > 0;
            const active = isActiveRoute(item);

            if (!hasChildren)
              return (
                <Link
                  key={index}
                  href={item.url || "#"}
                  target={item.external ? "_blank" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md transition-all duration-200 ease-in-out",
                    className
                  )}
                >
                  <NavItem item={item} hasChildren={false} isActive={active} />
                </Link>
              );

            return (
              <details
                key={index}
                className="group/nav"
                open={active || item.isActive}
              >
                <summary
                  className={cn(
                    "cursor-pointer rounded-md flex items-center transition-all duration-200 ease-in-out"
                  )}
                >
                  <NavItem
                    item={item}
                    hasChildren={true}
                    className={className}
                    isActive={active}
                  />
                </summary>

                <div className="pl-3 ml-5 border-l border-border">
                  {item.items?.map((sub: ChildItem, index) => {
                    if (sub.items) {
                      return (
                        <NavCollapse
                          key={index}
                          menu={[{ items: [sub] }]}
                          className={className}
                        />
                      );
                    }

                    const isSubActive = isItemActive(sub, pathname);
                    let linkHref = sub.url || "#";
                    const blogIdMatch = pathname.match(/^\/blogs\/([^\/]+)/);
                    const currentBlogId =
                      blogIdMatch && blogIdMatch[1] !== "create"
                        ? blogIdMatch[1]
                        : null;
                    if (currentBlogId) {
                      if (sub.name === "Chi tiết bài viết") {
                        linkHref = `/blogs/${currentBlogId}`;
                      } else if (sub.name === "Chỉnh sửa bài viết") {
                        linkHref = `/blogs/${currentBlogId}/edit`;
                      }
                    }

                    return (
                      <Link
                        key={index}
                        href={linkHref}
                        target={sub.external ? "_blank" : undefined}
                        className={cn(
                          "block rounded-md transition-all duration-200 ease-in-out",
                          className
                        )}
                      >
                        <NavItem
                          item={sub}
                          hasChildren={false}
                          className={cn(
                            "px-2! py-1! my-1!",
                            isSubActive &&
                              "bg-primary/5 text-primary font-medium"
                          )}
                          isActive={isSubActive}
                        />
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      ))}
    </>
  );
}