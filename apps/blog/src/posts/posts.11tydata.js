module.exports = {
  eleventyComputed: {
    eleventyNavigation: {
      name: data => data.title,
      excerpt: data => data.excerpt,
      description: data => data.description,
    }
  }
};