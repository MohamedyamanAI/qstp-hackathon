"use client"

import { cn } from "@/lib/utils"
import { LottieAnimation } from "@/components/lottie-animation"
import loaderData from "@/public/animations/Loader.json"

function Spinner({ className }: { className?: string }) {
  return (
    <LottieAnimation
      animationData={loaderData}
      loop
      autoplay
      className={cn("size-8", className)}
    />
  )
}

export { Spinner }
