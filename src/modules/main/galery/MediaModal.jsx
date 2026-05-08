import { useEffect } from "react";

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getMediaSrc(post) {
  if (post.media_type === "VIDEO") return post.thumbnail_url;
  return post.media_url;
}

export default function MediaModal({ post, onClose, username, initials }) {
  const isOpen = !!post;
  const src = post ? getMediaSrc(post) : null;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      style={{
        background: "rgba(26,26,26,0.88)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "all" : "none",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[color:var(--color-white)] rounded-xl overflow-hidden w-full max-w-[520px] max-h-[90vh] flex flex-col"
        style={{
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.92) translateY(14px)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div className="w-full aspect-square bg-black flex-shrink-0 relative overflow-hidden">
          {src && (
            <img
              src={src}
              alt={post?.caption?.slice(0, 60)}
              className="w-full h-full object-cover"
            />
          )}
          {post?.media_type === "VIDEO" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-md">
                <span className="text-2xl ml-1">▶</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))",
                }}
              >
                {initials}
              </div>
              <span className="text-sm font-semibold text-[color:var(--color-text-dark)]">
                {username}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[color:var(--color-text-light)] hover:text-[color:var(--color-text-dark)] text-xl leading-none px-1.5 py-1 rounded-md transition-colors hover:bg-[color:var(--color-primary-light)]/30"
            >
              ✕
            </button>
          </div>

          {post?.caption && (
            <p className="text-[13px] text-[color:var(--color-text-dark)] leading-relaxed">
              <strong className="font-semibold mr-1">{username}</strong>
              {post.caption}
            </p>
          )}

          <div
            className="flex gap-4 pt-3 text-[13px] text-[color:var(--color-text-light)]"
            style={{ borderTop: "1px solid rgba(212,184,150,0.25)" }}
          >
            <span className="flex items-center gap-1">
              ♥{" "}
              <strong className="text-[color:var(--color-text-dark)] font-semibold">
                {post?.like_count?.toLocaleString()}
              </strong>{" "}
              me gusta
            </span>
            <span className="flex items-center gap-1">
              💬{" "}
              <strong className="text-[color:var(--color-text-dark)] font-semibold">
                {post?.comments_count}
              </strong>{" "}
              comentarios
            </span>
            <span className="flex items-center gap-1">
              🔖{" "}
              <strong className="text-[color:var(--color-text-dark)] font-semibold">
                {post?.saved_count}
              </strong>
            </span>
          </div>

          {post?.timestamp && (
            <p className="text-[11px] text-[color:var(--color-text-light)] uppercase tracking-wider">
              {formatDate(post.timestamp)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
