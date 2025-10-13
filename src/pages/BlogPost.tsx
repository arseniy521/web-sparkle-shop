import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBlogPost, getRecentPosts } from "@/data/blogPosts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;
  const recentPosts = getRecentPosts(3);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-secondary mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Back Button */}
        <div className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <Link to="/blog">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {post.readTime}
                </div>
                <div>By {post.author}</div>
              </div>

              {/* Featured Image */}
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-12">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-secondary prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-secondary prose-ul:text-muted-foreground prose-ol:text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
              </div>

              {/* Keywords */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-sm font-semibold text-secondary mb-4">KEYWORDS</h3>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted text-sm text-muted-foreground rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Ready to Book a Home Nurse?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Professional nursing care in the comfort of your Prague home. Available 7 days a week.
              </p>
              <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="group">
                  Book Your Appointment
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-secondary mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {recentPosts
                  .filter(p => p.id !== post.id)
                  .slice(0, 3)
                  .map((relatedPost) => (
                    <Card key={relatedPost.id} className="overflow-hidden hover:shadow-card transition-all duration-300">
                      <Link to={`/blog/${relatedPost.slug}`}>
                        <div className="aspect-video bg-muted overflow-hidden">
                          <img
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-6">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {relatedPost.category}
                          </span>
                          <h3 className="text-lg font-semibold text-secondary mt-3 mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </Link>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* JSON-LD Structured Data for Blog Post */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "image": `https://www.sestranahodinu.cz${post.image}`,
          "author": {
            "@type": "Organization",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Nurse in Prague",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.sestranahodinu.cz/logo.png"
            }
          },
          "datePublished": post.date,
          "dateModified": post.date,
          "keywords": post.keywords.join(", "),
          "articleSection": post.category,
          "wordCount": post.content.split(/\s+/).length
        })
      }} />
    </div>
  );
};

export default BlogPost;
