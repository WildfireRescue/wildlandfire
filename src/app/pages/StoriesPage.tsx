import { SEOHead } from '../components/SEOHead';
import { StoriesHero } from '../components/StoriesHero';
import { MissionInAction } from '../components/MissionInAction';
import { PhotoGallery } from '../components/PhotoGallery';
import { NextChapterCTA } from '../components/NextChapterCTA';

export function StoriesPage() {
  return (
    <>
      <SEOHead
        title="Wildfire Survivor Stories | The Wildland Fire Recovery Fund"
        description="Read real stories of wildfire survivors and families helped by The Wildland Fire Recovery Fund. See how your donations rebuild lives after devastating wildfires."
        url="https://thewildlandfirerecoveryfund.org/stories"
      />
      <StoriesHero />
      <MissionInAction />
      <PhotoGallery />
      <NextChapterCTA />
    </>
  );
}