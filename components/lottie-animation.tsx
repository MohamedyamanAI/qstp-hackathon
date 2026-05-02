"use client"

import Lottie from "lottie-react"
import type { CSSProperties } from "react"

interface LottieAnimationProps {
  animationData: Record<string, unknown>
  loop?: boolean
  autoplay?: boolean
  className?: string
  style?: CSSProperties
}

export function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  className,
  style,
}: LottieAnimationProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  )
}
