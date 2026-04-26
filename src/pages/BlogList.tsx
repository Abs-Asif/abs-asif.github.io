import { Layout } from "@/components/Layout";
import { posts } from "@/data/posts";
import { Link, useParams } from "react-router-dom";

const BlogList = () => {
  const { year, month, day } = useParams();

  const filteredPosts = posts.filter(post => {
    const postDate = new Date(post.date);
    const pYear = String(postDate.getFullYear());
    const pMonth = String(postDate.getMonth() + 1).padStart(2, '0');
    const pDay = String(postDate.getDate()).padStart(2, '0');

    if (day) return pYear === year && pMonth === month && pDay === day;
    if (month) return pYear === year && pMonth === month;
    if (year) return pYear === year;
    return true;
  });

  const title = day
    ? `Posts from ${day}/${month}/${year}`
    : month
    ? `Posts from ${month}/${year}`
    : year
    ? `Posts from ${year}`
    : "All Posts";

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">{title}</h1>

      {filteredPosts.length > 0 ? (
        <div className="space-y-12">
          {filteredPosts.map((post) => {
            const date = new Date(post.date);
            const pYear = date.getFullYear();
            const pMonth = String(date.getMonth() + 1).padStart(2, '0');
            const pDay = String(date.getDate()).padStart(2, '0');
            const postUrl = `/${pYear}/${pMonth}/${pDay}/${post.id}`;

            return (
              <article key={post.id} className="flex flex-col md:flex-row gap-6 group">
                <Link to={postUrl} className="md:w-1/3 aspect-video overflow-hidden rounded-sm border border-border">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="md:w-2/3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {post.date}
                  </p>
                  <Link to={postUrl}>
                    <h2 className="text-xl font-bold group-hover:underline underline-offset-4 mb-3 leading-tight">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground line-clamp-2">
                    {post.summary}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-lg text-muted-foreground">No posts found for this period.</p>
      )}
    </Layout>
  );
};

export default BlogList;
