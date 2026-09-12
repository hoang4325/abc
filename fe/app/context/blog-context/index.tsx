"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import {
  BlogType,
  BlogPostType,
} from "../../(dashboard-layout)/types/apps/blog";
import { getFetcher } from "@/app/api/global-fetcher";
import useSWR from "swr";

export interface BlogContextProps {
  posts: BlogPostType[];
  sortBy: string;
  selectedPost: BlogPostType | null;
  isLoading: boolean;
  setPosts: Dispatch<SetStateAction<BlogPostType[]>>;
  setSortBy: Dispatch<SetStateAction<string>>;
  setSelectedPost: Dispatch<SetStateAction<BlogPostType | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  addComment: (postId: number, newComment: BlogType) => void;
  fetchPostById: (id: number) => void;
  error: Error | null;
}

export const BlogContext = createContext<BlogContextProps>({
  posts: [],
  sortBy: "newest",
  selectedPost: null,
  isLoading: true,
  setPosts: () => {},
  setSortBy: () => {},
  setSelectedPost: () => {},
  setLoading: () => {},
  addComment: () => {},
  fetchPostById: () => {},
  error: null,
});

export const BlogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
  } = useSWR("/api/blog", getFetcher);

  useEffect(() => {
    if (postsData) {
      setPosts(postsData.data || []);
      setLoading(isPostsLoading);
    } else if (postsError) {
      setError(postsError instanceof Error ? postsError : new Error(String(postsError)));
      setLoading(isPostsLoading);
    } else {
      setLoading(isPostsLoading);
    }
  }, [postsData, postsError, isPostsLoading]);

  const addComment = (postId: number, newComment: BlogType) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [newComment, ...(post.comments || [])] }
          : post
      )
    );
  };

  const fetchPostById = () => {};

  const value: BlogContextProps = {
    posts,
    sortBy,
    selectedPost,
    isLoading,
    setPosts,
    setSortBy,
    setSelectedPost,
    setLoading,
    addComment,
    fetchPostById,
    error,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};
