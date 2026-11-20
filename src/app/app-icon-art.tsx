/** Home-screen icon: three rising bars on the app's indigo. Rendered by next/og. */
export function AppIconArt({ size, rounded }: { size: number; rounded: boolean }) {
  const u = size / 16;
  const bars = [5, 7.5, 10];
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: u * 1.1,
        paddingBottom: u * 3.6,
        background: "#4f46e5",
        borderRadius: rounded ? u * 3.6 : 0,
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: u * 2.3,
            height: u * h,
            borderRadius: u * 0.7,
            background: i === bars.length - 1 ? "#ffffff" : "rgba(255,255,255,0.72)",
          }}
        />
      ))}
    </div>
  );
}
