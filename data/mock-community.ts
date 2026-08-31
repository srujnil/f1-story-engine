// DEV FIXTURE ONLY — not imported by the live /community route.
// Real content now lives in Supabase (seeded via supabase/schema.sql); these
// fictional accounts and discussions are kept here for reference/dev use only.

import type { CommunityPost } from "@/types";

export const communityTeams = [
  "Mercedes",
  "Ferrari",
  "McLaren",
  "Red Bull",
  "Williams",
  "Aston Martin",
] as const;

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "development-race",
    author: "Story Engine Desk",
    authorRole: "Editor",
    favoriteTeam: "McLaren",
    category: "Paddock Debate",
    headline: "Which team would you trust most in a development race?",
    body: "Forget the current points table for a moment. Pick the team you think would make the smartest upgrades across the next six rounds—and tell the paddock why.",
    createdAtLabel: "18 min ago",
    reactions: { fire: 38, agree: 21, wild: 7, disagree: 4 },
    comments: [
      {
        id: "development-comment-1",
        author: "ApexMaya",
        favoriteTeam: "Williams",
        body: "I care less about one big upgrade and more about whether every package works immediately.",
        createdAtLabel: "9 min ago",
      },
      {
        id: "development-comment-2",
        author: "LateBrakeLeo",
        favoriteTeam: "Ferrari",
        body: "The best answer changes depending on whether the next circuits reward efficiency or downforce.",
        createdAtLabel: "4 min ago",
      },
    ],
  },
  {
    id: "team-orders",
    author: "SectorThree",
    authorRole: "Member",
    favoriteTeam: "Mercedes",
    category: "Hot Take",
    headline:
      "Team orders should arrive earlier—not only when the title maths gets obvious.",
    body: "Waiting until the final third of a season can waste points. If one driver has the clearer championship route, the team should commit while the advantage still matters.",
    createdAtLabel: "42 min ago",
    reactions: { fire: 64, agree: 46, wild: 19, disagree: 12 },
    comments: [
      {
        id: "orders-comment-1",
        author: "PapayaPulse",
        favoriteTeam: "McLaren",
        body: "Only if the performance gap is consistent across different circuit types.",
        createdAtLabel: "31 min ago",
      },
    ],
  },
  {
    id: "perfect-weekend",
    author: "KerbWatcher",
    authorRole: "Member",
    favoriteTeam: "Red Bull",
    category: "Race Chat",
    headline: "What matters most in a perfect race weekend?",
    body: "Pole position, tyre management, clean pit stops, or adapting fastest when the race changes? Choose one—no fence-sitting.",
    createdAtLabel: "1 hr ago",
    reactions: { fire: 27, agree: 18, wild: 11, disagree: 3 },
    comments: [],
  },
];

export const mockTrendingTopics = [
  { label: "Development race", posts: 84 },
  { label: "Team orders", posts: 61 },
  { label: "Perfect weekend", posts: 43 },
];
