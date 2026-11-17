export function GuideScreenshot({
  name,
  alt,
  caption,
  height = 900,
  mobile = false,
}: {
  name: string;
  alt: string;
  caption: string;
  height?: number;
  mobile?: boolean;
}) {
  const src = `/assets/img/guides/en/${name}.png`;
  return (
    <figure className={mobile ? 'guideScreenshot mobile' : 'guideScreenshot'}>
      <a href={src}>
        <img
          src={src}
          width={mobile ? 390 : 1280}
          height={mobile ? 844 : height}
          alt={alt}
          loading='lazy'
        />
      </a>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
