import Image from "next/image";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <div className="relative w-16 h-16 animate-pulse transition-opacity duration-700">
        <Image
          src="/loader.jpeg"
          alt="Loading..."
          fill
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
