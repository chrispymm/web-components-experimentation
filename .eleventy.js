module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy({"src/public":"/"});
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/img");

  eleventyConfig.addPassthroughCopy({ "node_modules/tabbable/src/index.js": "assets/js/utils/tabbable.js" });

  // eleventyConfig.setServerPassthroughCopyBehavior("copy");

  // Return your Object options:
  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
};
