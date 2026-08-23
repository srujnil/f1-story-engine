import { NavBar } from "@/components/nav-bar";
import { MomentumSpotlight } from "@/components/momentum-spotlight";
import { QuickStoryCard } from "@/components/quick-story-card";
import { mockDriverForm } from "@/data/mock-momentum";
import { mockStories } from "@/data/mock-stories";
import { computeMomentum } from "@/lib/momentum";

export default function StorylineHubPage() {
  const momentum = computeMomentum(mockDriverForm);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
        <section aria-labelledby="momentum-heading" className="flex flex-col gap-3">
          <h1 id="momentum-heading" className="text-sm font-medium text-muted-foreground">
            What&apos;s the story right now
          </h1>
          <MomentumSpotlight result={momentum} />
        </section>

        <section aria-labelledby="stories-heading" className="flex flex-col gap-3">
          <h2 id="stories-heading" className="text-sm font-medium text-muted-foreground">
            Quick stories
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {mockStories.map((story) => (
              <QuickStoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
