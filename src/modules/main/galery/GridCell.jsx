import { useState } from "react";

import TypeBadge from "./typeBadge";

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function getMediaSrc(post) {
  if (post.media_type === "VIDEO") return post.thumbnail_url;
  return post.media_url;
}

export default function GridCell({ post, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const src = getMediaSrc(post);

  return (
    <div
      className="relative aspect-square overflow-hidden cursor-pointer bg-[color:var(--color-primary-light)]"
      style={{ animation: `fadeSlide 0.45s ease ${index * 0.06}s both` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(post)}
    >
      <img
        src={src}
        alt={post.caption?.slice(0, 50)}
        className="w-full h-full object-cover transition-transform duration-500"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        loading="lazy"
      />

      <div
        className="absolute inset-0 flex items-center justify-center gap-4 transition-all duration-300"
        style={{ background: hovered ? "rgba(45,45,45,0.45)" : "rgba(45,45,45,0)" }}
      >
        <span
          className="text-white text-[13px] font-semibold flex items-center gap-1 transition-all duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(6px)",
          }}
        >
          ♥ {formatNum(post.like_count)}
        </span>
        <span
          className="text-white text-[13px] font-semibold flex items-center gap-1 transition-all duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(6px)",
            transitionDelay: hovered ? "0.04s" : "0s",
          }}
        >
          💬 {formatNum(post.comments_count)}
        </span>
      </div>

      <TypeBadge type={post.media_type} />
    </div>
  );
}
