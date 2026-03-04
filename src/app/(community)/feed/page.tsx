import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockPosts = [
  {
    id: 1,
    author: "PlantBreeder42",
    species: "Tomato",
    gene: "SlCLV3",
    title: "Successfully increased fruit size by editing CLAVATA3",
    summary: "Used SpCas9 with Agrobacterium delivery. T1 plants showing ~30% larger fruits with extra locules. Heterozygous edits confirmed by Sanger sequencing.",
    method: "Agrobacterium",
    status: "T1 confirmed",
    likes: 24,
    comments: 7,
    timeAgo: "2 days ago",
  },
  {
    id: 2,
    author: "CRISPRgardener",
    species: "Lettuce",
    gene: "LsNCED4",
    title: "Delayed senescence in lettuce — shelf life doubled!",
    summary: "Protoplast transformation with RNP (DNA-free). Edited NCED4 to reduce ABA biosynthesis. Leaves stay green 2x longer after harvest.",
    method: "Protoplast (RNP)",
    status: "T2 homozygous",
    likes: 31,
    comments: 12,
    timeAgo: "5 days ago",
  },
  {
    id: 3,
    author: "RiceResearcher",
    species: "Rice",
    gene: "OsGW2",
    title: "Grain weight improvement in japonica rice",
    summary: "Targeted GW2 using Cas12a for the AT-rich region. Callus transformation of Nipponbare. T0 plants in greenhouse, PCR screening shows ~60% editing efficiency.",
    method: "Agrobacterium",
    status: "T0 screening",
    likes: 18,
    comments: 4,
    timeAgo: "1 week ago",
  },
];

export default function CommunityFeedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">
            See what other plant breeders are editing. Share experiments, discuss
            methods, and learn together.
          </p>
        </div>
        <Button size="lg">Share Experiment</Button>
      </div>

      <div className="flex gap-2">
        {["All", "Tomato", "Rice", "Arabidopsis", "Lettuce", "Wheat"].map(
          (filter) => (
            <Badge
              key={filter}
              variant={filter === "All" ? "default" : "outline"}
              className="cursor-pointer"
            >
              {filter}
            </Badge>
          )
        )}
      </div>

      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card key={post.id} className="transition-colors hover:border-green-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                    {post.author[0]}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{post.author}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {post.timeAgo}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{post.species}</Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {post.gene}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    {post.status}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-base mt-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{post.summary}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <button className="hover:text-green-600">
                  {post.likes} upvotes
                </button>
                <button className="hover:text-green-600">
                  {post.comments} comments
                </button>
                <button className="hover:text-green-600">Fork experiment</button>
                <span className="text-xs">Method: {post.method}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Community features coming soon. Sign up to be notified when sharing
            and discussion are live.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
