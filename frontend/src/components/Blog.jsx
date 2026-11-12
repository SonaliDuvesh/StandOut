import { useState, useEffect } from 'react';
import { blogAPI } from '../services/api';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await blogAPI.getAll();
                setPosts(response.data.results || response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blog posts:', error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <section id="blog" className="section bg-soft-cream-50 dark:bg-navy-900">
            <div className="container-custom">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-on-scroll">
                    Latest <span className="gradient-text">Articles</span>
                </h2>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600 dark:border-soft-cream-400"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <article
                                key={post.id}
                                className="card group hover:shadow-2xl hover:shadow-navy-200 dark:hover:shadow-navy-900/50 animate-on-scroll flex flex-col h-full"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-soft-cream-100 dark:bg-navy-800 shrink-0">
                                    {post.featured_image_url ? (
                                        <img
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-navy-300 dark:text-navy-700">
                                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm text-xs font-bold text-navy-700 dark:text-soft-cream-300 shadow-sm">
                                        {formatDate(post.published_date)}
                                    </div>
                                </div>

                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold mb-3 text-navy-800 dark:text-soft-cream-100 group-hover:text-navy-600 dark:group-hover:text-soft-cream-300 transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-navy-600 dark:text-soft-cream-400 mb-4 line-clamp-3 text-sm leading-relaxed flex-grow">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                        {post.tags?.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="tag text-xs">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center text-navy-700 dark:text-soft-cream-300 font-medium group/link mt-auto">
                                        <span>Read Article</span>
                                        <svg
                                            className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover/link:translate-x-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {posts.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-navy-600 dark:text-soft-cream-400 text-lg">
                            No blog posts published yet. Check back soon!
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Blog;
