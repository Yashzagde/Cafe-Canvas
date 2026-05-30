"use client";

export default function Skeleton({ className = "", variant = "rect" }) {
  const baseClass = "skeleton";
  
  const variants = {
    rect: "w-full h-4",
    circle: "w-10 h-10 rounded-full",
    card: "w-full h-48 rounded-2xl",
    text: "w-3/4 h-3",
    title: "w-1/2 h-5",
    avatar: "w-12 h-12 rounded-full",
    image: "w-full aspect-square rounded-2xl",
    price: "w-16 h-5",
    button: "w-24 h-10 rounded-full",
  };

  return (
    <div
      className={`${baseClass} ${variants[variant] || variants.rect} ${className}`}
      aria-hidden="true"
    />
  );
}

// Composed skeleton for a menu card
export function MenuCardSkeleton() {
  return (
    <div className="card p-0">
      <Skeleton variant="image" className="aspect-[4/3] rounded-b-none" />
      <div className="p-4 flex flex-col gap-2.5">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <div className="flex items-center justify-between mt-1">
          <Skeleton variant="price" />
          <Skeleton variant="button" />
        </div>
      </div>
    </div>
  );
}

// Blog card skeleton
export function BlogCardSkeleton() {
  return (
    <div className="card p-0">
      <Skeleton className="w-full h-48 rounded-b-none" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
  );
}
