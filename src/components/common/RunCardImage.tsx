interface RunCardImageProps {
  src: string;
  showFullImage?: boolean;
}

export default function RunCardImage({ src, showFullImage }: RunCardImageProps) {
  return (
    <div className="relative isolate w-full h-full overflow-hidden">
      {showFullImage && (
        <span aria-hidden="true" className="pointer-events-none absolute -inset-[18px] blur-[16px] opacity-[.28]">
          <img src={src} alt="" className="block w-full h-full object-cover" />
        </span>
      )}
      <img src={src} alt="" className={`relative block w-full h-full ${showFullImage ? 'object-contain' : 'object-cover'}`} />
    </div>
  );
}
