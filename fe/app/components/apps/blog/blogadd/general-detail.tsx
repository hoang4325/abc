"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import TiptapEdit from "@/app/components/shared/editor/tiptap-edit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GeneralDetail = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h5>Thông tin bài viết</h5>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="mb-2 block">
              <Label htmlFor="prednm">
                Tiêu đề bài viết
                <span className="text-destructive ">*</span>
              </Label>
            </div>
            <Input id="prednm" type="text" placeholder="Nhập tiêu đề bài viết..." />
            <small className="text-xs text-muted-foreground">
              Tiêu đề bài viết là bắt buộc và nên là duy nhất.
            </small>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="desc">Nội dung bài viết</Label>
            </div>
            <TiptapEdit />
            <small className="text-xs  text-muted-foreground">
              Nhập nội dung chi tiết cho bài viết.
            </small>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GeneralDetail;
