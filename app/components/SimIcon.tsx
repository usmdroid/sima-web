import Image from "next/image";
export default function SimIcon({ size = 16, className }: { size?: number; className?: string }) {
  return <Image src="/sim-icon.png" alt="sim" width={size} height={size} className={className} priority={false} />;
}
