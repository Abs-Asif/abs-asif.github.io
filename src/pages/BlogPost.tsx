import { Layout } from "@/components/Layout";
import { posts } from "@/data/posts";
import { useParams, Navigate } from "react-router-dom";

const BlogPost = () => {
  const { year, month, day, id } = useParams();

  const post = posts.find(p => {
    const postDate = new Date(p.date);
    const pYear = String(postDate.getFullYear());
    const pMonth = String(postDate.getMonth() + 1).padStart(2, '0');
    const pDay = String(postDate.getDate()).padStart(2, '0');

    return p.id === id && pYear === year && pMonth === month && pDay === day;
  });

  if (!post) {
    return <Navigate to="/404" />;
  }

  return (
    <Layout>
      <article className="max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest">
            {post.date} • By {post.author}
          </p>
          <h1 className="text-4xl font-bold mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="aspect-video w-full overflow-hidden rounded-sm border border-border shadow-md">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        <div
          className="blog-content prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground italic">
            Note: This content is based on personal research and reflection. Please consult scholars for religious fatwas.
          </p>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
