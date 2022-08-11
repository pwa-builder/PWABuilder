const siteSettings = require("./src/globals/site.json")

module.exports = (config) => {
  const markdownIt = require("markdown-it")
  config.setLibrary(
    "md",
    markdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
    })
  )
  config.addPlugin(require("@11ty/eleventy-plugin-syntaxhighlight"))
  config.addPlugin(require("@11ty/eleventy-plugin-rss"))

  config.addFilter("dateDisplay", require("./filters/date-display.js"))
  config.addFilter("filterTagList", (tags) => {
    // should match the list in tags.njk
    return (tags || []).filter(
      (tag) => ["all", "nav", "post", "posts", "docs", "doc"].indexOf(tag) === -1
    )
  })
  config.addCollection("tagList", function (collection) {
    let tagSet = new Set()
    collection.getAll().forEach((item) => {
      ;(item.data.tags || []).forEach((tag) => tagSet.add(tag))
    })

    return [...tagSet]
  })
  config.addPassthroughCopy({ public: "./" })
  config.addPassthroughCopy("src/**/*.jpg")
  config.addPassthroughCopy("src/**/*.png")

  config.setBrowserSyncConfig({
    files: ["dist/**/*"],
    open: true,
  })

  config.setDataDeepMerge(true)

  config.addCollection("postsWithoutDrafts", (collection) =>
    [...collection.getFilteredByGlob("src/posts/*.md")].filter(
      (post) => !post.data.draft
    )
  )

  config.addCollection("docsWithoutDrafts", (collection) =>
    [...collection.getFilteredByGlob("src/docs/*.md")].filter(
      (docs) => !docs.data.draft
    )
  )

  config.addCollection("demosWithoutDrafts", (collection) =>
  [...collection.getFilteredByGlob("src/demos/*.md")].filter(
    (demos) => !demos.data.draft
  )
)

  return {
    pathPrefix: siteSettings.baseUrl,
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      layouts: "includes/layouts",
      data: "globals",
      assets: "assets",
    },
  }
}
