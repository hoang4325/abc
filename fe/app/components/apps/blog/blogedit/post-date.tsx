"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState, useContext, useEffect } from "react";
import { BlogContext } from "@/app/context/blog-context";
import { format } from "date-fns";
import { CalendarCog } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";

const PostDate = () => {
  const { posts } = useContext(BlogContext);

  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (posts.length > 0 && posts[0].createdAt) {
      setPublishDate(new Date(posts[0].createdAt));
    }
  }, [posts]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <h5>Ngày xuất bản</h5>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="publishDate">
              Chọn ngày xuất bản <span className="text-destructive">*</span>
            </Label>
          </div>
          <div>
            <Popover>
              <PopoverTrigger
                suppressHydrationWarning
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-left font-normal",
                  !publishDate && "text-muted-foreground"
                )}
              >
                <CalendarCog />
                {publishDate ? (
                  <span suppressHydrationWarning>{format(publishDate, "PPP")}</span>
                ) : (
                  <span>Chọn ngày</span>
                )}
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={publishDate}
                  onSelect={setPublishDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <small className="text-xs text-muted-foreground">
            Chọn ngày bài viết này sẽ được xuất bản.
          </small>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostDate;
