import { StoriesHero } from '../components/StoriesHero';
import { MissionInAction } from '../components/MissionInAction';
import { PhotoGallery } from '../components/PhotoGallery';
import { NextChapterCTA } from '../components/NextChapterCTA';

export function StoriesPage() {
  return (
    <>
      <StoriesHero />
      <MissionInAction />
      <PhotoGallery />
      <NextChapterCTA />
    </>
  );
}