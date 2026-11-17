import { Carousel } from '@mantine/carousel';
import { CarouselCard } from './CarouselCard';
import { useI18n } from '../hooks/i18n';

const dataPreview = (i18n: ReturnType<typeof useI18n>) => [
  {
    image: '/assets/img/preview/tyr.avif',
    title: i18n._t('Mobile assistant'),
  },
  {
    image: '/assets/img/preview/sigrun1.avif',
    title: i18n._t('Personal stats'),
  },
  {
    image: '/assets/img/preview/sigrun3.avif',
    title: i18n._t('Recent games'),
  },
  {
    image: '/assets/img/preview/sigrun2.avif',
    title: i18n._t('Rating table'),
  },
];

export function CardsCarousel() {
  const i18n = useI18n();

  const slides = dataPreview(i18n).map((item) => (
    <Carousel.Slide key={item.image}>
      <CarouselCard {...item} />
    </Carousel.Slide>
  ));

  return (
    <Carousel
      slideSize={{ base: '100%', sm: '50%' }}
      slideGap={{ base: 2, sm: 'xl' }}
      emblaOptions={{ align: 'start', slidesToScroll: 1, loop: true }}
    >
      {slides}
    </Carousel>
  );
}
