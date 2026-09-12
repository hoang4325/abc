"use client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogContext } from "@/app/context/blog-context";
import { Label } from "@/components/ui/label";

const GeneralDetail = () => {
  const { posts } = useContext(BlogContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (posts.length > 0) {
      const firstPost = posts[0];
      setTitle(firstPost.title || "");
      setContent(firstPost.content || "");
    }
  }, [posts]);
  console.log(title);

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
            <div className="mb-2">
              <Label htmlFor="prednm ">
                Tiêu đề bài viết <span className="text-destructive ">*</span>
              </Label>
            </div>
            <Input
              id="prednm"
              type="text"
              placeholder="Nhập tiêu đề bài viết"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <small className="text-xs  text-muted-foreground">
              Tiêu đề bài viết là bắt buộc và nên là duy nhất.
            </small>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="desc">Nội dung bài viết</Label>
            </div>
            <Textarea
              id="comment"
              placeholder="Nhập nội dung bài viết..."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <small className="text-xs text-muted-foreground ">
              Nhập nội dung chi tiết cho bài viết để hiển thị đầy đủ thông tin.
            </small>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GeneralDetail;
