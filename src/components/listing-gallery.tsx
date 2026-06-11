"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-zinc-100 text-zinc-300">
        <ImageIcon className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={title} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-20 flex-none overflow-hidden rounded-lg border-2",
                i === active ? "border-[#E84A27]" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
