"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Plus, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const CategoryTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");

  const [Cats, setCats] = useState<string[]>([]);
  const [showCatOptions, setShowCatOptions] = useState<boolean>(false);
  const [catOptions] = useState<string[]>([
    "Công nghệ",
    "Đời sống",
    "Du lịch",
    "Ẩm thực",
    "Kinh doanh",
    "Xã hội",
  ]);

  const [showTagOptions, setShowTagOptions] = useState<boolean>(false);
  const [tagOptions] = useState<string[]>([
    "Xu hướng",
    "Mẹo hay",
    "Tin tức",
    "Hướng dẫn",
    "Nổi bật",
  ]);

  const handleCatInputChange = () => {
    setShowCatOptions(true);
  };

  const handleCatInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && Cats.length > 0) {
      setCats([]);
      setShowCatOptions(false);
    }
  };

  const handleCatClick = (option: string) => {
    if (!Cats.includes(option)) {
      setCats([...Cats, option]);
    }
    setShowCatOptions(false);
  };

  const handleCatDelete = (catToDelete: string) => {
    const updatedCats = Cats.filter((cat) => cat !== catToDelete);
    setCats(updatedCats);
  };

  const handleTagInputChange = () => {
    setShowTagOptions(true);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagClick = (option: string) => {
    if (!tags.includes(option)) {
      setTags([...tags, option]);
    }
    setShowTagOptions(false);
  };

  const handleTagDelete = (tagToDelete: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToDelete);
    setTags(updatedTags);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h5>Danh mục bài viết</h5>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="">
          <div className="mb-2 block">
            <Label htmlFor="cat">
              Chuyên mục
              <span className="text-destructive">*</span>
            </Label>
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-1 min-h-[40px] w-full rounded-md border border-input bg-background px-2 py-1 focus-within:ring-1 focus-within:ring-primary">
              {Cats.map((cat, index) => (
                <span
                  key={index}
                  className="flex items-center rounded-full bg-primary/5 px-2 py-1 text-sm text-primary"
                >
                  {cat}
                  <X
                    size={12}
                    className="ml-1 cursor-pointer"
                    onClick={() => handleCatDelete(cat)}
                  />
                </span>
              ))}

              <input
                type="text"
                placeholder="Chọn hoặc nhập chuyên mục..."
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                onFocus={handleCatInputChange}
                onKeyDown={handleCatInputKeyDown}
              />
            </div>

            <small className="text-xs text-muted-foreground">
              Chọn chuyên mục cho bài viết.
            </small>

            {showCatOptions && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-card shadow-lg border border-border">
                {catOptions.map((option, index) => (
                  <div
                    key={index}
                    className="cursor-pointer px-3 py-2 hover:bg-muted text-sm"
                    onClick={() => handleCatClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          <Button variant="outline" size="sm">
            <Plus size={16} /> Thêm chuyên mục
          </Button>
        </div>

        <div className="mt-4">
          <div className="mb-2 block">
            <Label htmlFor="tags">Thẻ (Tags)</Label>
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-1 min-h-[40px] w-full rounded-md border border-input bg-background px-2 py-1 focus-within:ring-1 focus-within:ring-primary">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className=" py-1 px-2 rounded-full text-primary bg-primary/5 flex items-center text-sm"
                >
                  {tag}
                  <X
                    onClick={() => handleTagDelete(tag)}
                    className="cursor-pointer ml-1"
                    size={12}
                  />
                </span>
              ))}

              <input
                type="text"
                placeholder="Nhập thẻ rồi nhấn Enter..."
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onFocus={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
              />
            </div>

            <small className="text-xs text-muted-foreground">
              Thêm từ khóa thẻ cho bài viết (nhấn Enter để thêm).
            </small>

            {showTagOptions && (
              <div>
                {tagOptions.map((option, index) => (
                  <div
                    key={index}
                    className="py-2 px-3 bg-hover cursor-pointer"
                    onClick={() => handleTagClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryTags;
