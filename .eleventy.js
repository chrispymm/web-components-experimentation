module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy({"src/public":"/"});
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/img");

  // eleventyConfig.setServerPassthroughCopyBehavior("copy");

  // Return your Object options:
  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
};
