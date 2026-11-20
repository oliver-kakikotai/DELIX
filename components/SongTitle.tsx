import Image from 'next/image';

type SongTitleProps = {
  title: string;
  titleImage?: string;
  /** Heading element to render (h1 on the song page, h2 on planet cards). */
  as?: 'h1' | 'h2' | 'h3';
  /** Applied to the heading. With an image, sizes it via width; without, styles the text. */
  className?: string;
  /** Render the (white) wordmark as black, for light backgrounds. */
  dark?: boolean;
  /** next/image `sizes` hint for the wordmark. */
  sizes?: string;
  /** Extra classes for the wordmark image, e.g. a max-height cap so two-line
      titles don't eat short viewports (pair with object-contain). */
  imageClassName?: string;
};

// Song titles use a hand-lettered wordmark image when the song has one (so
// they match the DELIX logo exactly) and fall back to the script font.
export default function SongTitle({
  title,
  titleImage,
  as: Tag = 'h2',
  className = '',
  dark = false,
  sizes = '(min-width: 768px) 40vw, 80vw',
  imageClassName = '',
}: SongTitleProps) {
  if (!titleImage) {
    return <Tag className={`font-script ${className}`}>{title}</Tag>;
  }

  return (
    <Tag className={className}>
      {/* Wordmark files are 2172×724 (3:1), white on transparent. */}
      <Image
        src={titleImage}
        alt={title}
        width={2172}
        height={724}
        sizes={sizes}
        className={`h-auto w-full ${dark ? 'brightness-0' : ''} ${imageClassName}`}
      />
    </Tag>
  );
}
