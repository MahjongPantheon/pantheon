import { Carousel } from '@mantine/carousel';
import { rem } from '@mantine/core';
import { CarouselCard } from './CarouselCard';
import { useStorage } from '../hooks/storage';

const dataPreview = [
  {
    image: '/assets/img/preview/tyr.avif',
    title: {
      en: 'Mobile assistant',
      ru: 'Мобильный ассистент',
    },
  },
  {
    image: '/assets/img/preview/sigrun1.avif',
    title: {
      en: 'Personal stats',
      ru: 'Личная статистика',
    },
  },
  {
    image: '/assets/img/preview/sigrun2.avif',
    title: {
      en: 'Recent games',
      ru: 'Последние игры',
    },
  },
  {
    image: '/assets/img/preview/sigrun3.avif',
    title: {
      en: 'Rating table',
      ru: 'Рейтинговая таблица',
    },
  },
];

export function CardsCarousel() {
  const storage = useStorage();
  const locale = storage.getLang();

  const slides = dataPreview.map((item, idx) => (
    <Carousel.Slide key={`card${idx}`}>
      <CarouselCard {...item} locale={locale ?? 'en'} />
    </Carousel.Slide>
  ));

  return (
    <Carousel
      slideSize='50%'
      breakpoints={[{ maxWidth: 'sm', slideSize: '100%', slideGap: rem(2) }]}
      slideGap='xl'
      align='start'
      slidesToScroll={1}
      loop
    >
      {slides}
    </Carousel>
  );
}
