import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Blog = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
                Healthcare Blog
              </h1>
              <p className="text-lg text-muted-foreground">
                Expert insights on home healthcare, nursing services, and medical care in Prague
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-secondary mb-3 line-clamp-2 hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Need Professional Home Nursing Care?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Book a qualified nurse to visit your home in Prague. Same-day appointments available.
              </p>
              <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="group">
                  Book a Nurse Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
