import { Layout } from "@/components/Layout";
import { posts } from "@/data/posts";
import { Link } from "react-router-dom";

const Home = () => {
  const latestPosts = posts.slice(0, 5);

  return (
    <Layout>
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-4">Welcome</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          I am Abdullah Bari Asif. I am not a scholar, but I am a student of knowledge and a researcher.
          This space is where I share my findings, reflections, and thoughts on various topics,
          primarily focused on Islamic principles and their application in the modern world.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">Latest Posts</h2>
        <div className="space-y-10">
          {latestPosts.map((post) => {
            const date = new Date(post.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const postUrl = `/${year}/${month}/${day}/${post.id}`;

            return (
              <article key={post.id} className="group">
                <Link to={postUrl} className="block">
                  <div className="aspect-video w-full mb-4 overflow-hidden rounded-sm border border-border">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-bold group-hover:underline underline-offset-4 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {post.date} • {post.author}
                  </p>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.summary}
                  </p>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
