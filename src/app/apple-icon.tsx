import { ImageResponse } from "next/og";
import { AppIconArt } from "./app-icon-art";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS applies its own corner mask, so the art fills the square.
  return new ImageResponse(<AppIconArt size={180} rounded={false} />, size);
}
