import { useState } from "react";

import GridCell from "./gridCell";
import MediaModal from "./mediaModal";

const MOCK_POSTS = [
  {
    id: "1",
    media_type: "IMAGE",
    media_url: "https://picsum.photos/seed/ig1/600/600",
    caption: "La luz de la mañana sobre el taller — esos primeros rayos que lo cambian todo ✨",
    like_count: 342,
    comments_count: 28,
    saved_count: 56,
    timestamp: "2026-04-20T08:32:00Z",
  },
  {
    id: "2",
    media_type: "VIDEO",
    thumbnail_url: "https://picsum.photos/seed/ig2/600/600",
    media_url: null,
    caption: "Un proceso de 3 horas resumido en 30 segundos. El barro nunca miente 🏺",
    like_count: 891,
    comments_count: 74,
    saved_count: 203,
    timestamp: "2026-04-18T15:10:00Z",
  },
  {
    id: "3",
    media_type: "IMAGE",
    media_url: "https://picsum.photos/seed/ig3/600/600",
    caption: "Nueva colección cápsula lista para el verano. Tonos tierra que abrazan 🌿",
    like_count: 519,
    comments_count: 41,
    saved_count: 88,
    timestamp: "2026-04-15T12:00:00Z",
  },
  {
    id: "4",
    media_type: "IMAGE",
    media_url: "https://picsum.photos/seed/ig4/600/600",
    caption: "Detalle de la textura en el telar de madera. Cada hilo cuenta una historia",
    like_count: 287,
    comments_count: 19,
    saved_count: 67,
    timestamp: "2026-04-12T09:45:00Z",
  },
  {
    id: "5",
    media_type: "CAROUSEL_ALBUM",
    media_url: "https://picsum.photos/seed/ig5/600/600",
    caption:
      "Paso a paso de la técnica de batik que aprendí en Oaxaca 🎨 Guarda este post para el tutorial completo",
    like_count: 1243,
    comments_count: 156,
    saved_count: 412,
    timestamp: "2026-04-09T11:20:00Z",
  },
  {
    id: "6",
    media_type: "IMAGE",
    media_url: "https://picsum.photos/seed/ig6/600/600",
    caption: "El mercado al amanecer. Colores que no necesitan filtro 🌅",
    like_count: 678,
    comments_count: 53,
    saved_count: 124,
    timestamp: "2026-04-05T07:15:00Z",
  },
  {
    id: "7",
    media_type: "VIDEO",
    thumbnail_url: "https://picsum.photos/seed/ig7/600/600",
    media_url: null,
    caption: "GRWM para un día de feria artesanal 🕯 Lento, con intención",
    like_count: 934,
    comments_count: 88,
    saved_count: 176,
    timestamp: "2026-04-01T16:30:00Z",
  },
  {
    id: "8",
    media_type: "IMAGE",
    media_url: "https://picsum.photos/seed/ig8/600/600",
    caption: "Rincón de inspiración recién reorganizado. El caos ordenado también es arte",
    like_count: 445,
    comments_count: 37,
    saved_count: 93,
    timestamp: "2026-03-28T14:00:00Z",
  },
  {
    id: "9",
    media_type: "CAROUSEL_ALBUM",
    media_url: "https://picsum.photos/seed/ig9/600/600",
    caption: "Antes y después del año de práctica. El progreso no siempre es recto 💪",
    like_count: 2187,
    comments_count: 234,
    saved_count: 587,
    timestamp: "2026-03-24T10:10:00Z",
  },
];

/**
 * InstagramCollage
 *
 * Props:
 * - posts: array de objetos media de Instagram Graph API (default: MOCK_POSTS)
 * - username: string (default: "maria.artesana")
 * - displayName: string (default: "María Artesana")
 * - initials: string (default: "MA")
 * - stats: { posts, followers, following }
 */
export default function InstagramCollage({
  posts = MOCK_POSTS,
  username = "onanails",
  displayName = "Ona Nails",
  initials = "ONA",
  stats = { posts: 142, followers: "8.4k", following: 312 },
}) {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="bg-[color:var(--color-background)] min-h-screen p-5 font-sans">
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-center justify-between mb-5 pb-4"
            style={{ borderBottom: "1px solid rgba(212,184,150,0.25)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))",
                  border: "2px solid var(--color-primary)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                {initials}
              </div>
              <div>
                <div
                  className="text-base font-semibold text-[color:var(--color-text-dark)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {displayName}
                </div>
                <div className="text-xs text-[color:var(--color-text-light)]">
                  @{username}
                </div>
              </div>
            </div>

            <div className="flex gap-5 text-xs text-[color:var(--color-text-light)]">
              {[
                { label: "posts", val: stats.posts },
                { label: "seguidores", val: stats.followers },
                { label: "seguidos", val: stats.following },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <strong
                    className="block text-[15px] font-semibold text-[color:var(--color-text-dark)]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {val}
                  </strong>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[3px]">
            {posts.map((post, i) => (
              <GridCell key={post.id} post={post} index={i} onClick={setSelectedPost} />
            ))}
          </div>
        </div>
      </div>

      <MediaModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        username={username}
        initials={initials}
      />
    </>
  );
}
