"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Status = () => {
  const statusOptions = [
    { value: "Publish", label: "Đã xuất bản" },
    { value: "Draft", label: "Bản nháp" },
    { value: "Schedule", label: "Lên lịch" },
    { value: "Inactive", label: "Ngừng hoạt động" },
  ];
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    "Publish"
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <h5>Trạng thái bài viết</h5>
              {selectedStatus === "Publish" ? (
                <span className="h-3 w-3 p-0 bg-chart-2 rounded-full" />
              ) : selectedStatus === "Schedule" ? (
                <span className="h-3 w-3 p-0 bg-secondary rounded-full" />
              ) : selectedStatus === "Draft" ? (
                <span className="h-3 w-3 p-0 bg-destructive rounded-full" />
              ) : (
                <span className="h-3 w-3 p-0 bg-chart-4 rounded-full" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value);
              }}
              defaultValue={"Publish"}
            >
              <SelectTrigger className="w-full" id="status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Trạng thái</SelectLabel>
                  {statusOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <small className="text-xs text-muted-foreground">
              Thiết lập trạng thái hiển thị của bài viết.
            </small>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Status;
