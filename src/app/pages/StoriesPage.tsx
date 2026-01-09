import { StoriesHero } from '../components/StoriesHero';
import { MissionInAction } from '../components/MissionInAction';
import { PhotoGallery } from '../components/PhotoGallery';
import { NextChapterCTA } from '../components/NextChapterCTA';

export function StoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <StoriesHero />
      <MissionInAction />
      <PhotoGallery />
      <NextChapterCTA />
    </div>
  );
}