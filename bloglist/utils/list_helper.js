const dummy = () => 1;

const totalLikes = (blogs) => {
  if (blogs.length < 2) {
    const toReturn = blogs[0] ?? 0;
    return toReturn === 0 ? 0 : blogs[0].likes;
  }
  return blogs.reduce((total, blog) => total + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return undefined;
  }
  const favorite =
    blogs.length === 1
      ? blogs[0]
      : blogs.sort((blog1, blog2) => blog2.likes - blog1.likes)[0];
  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length < 2) {
    if (blogs[0]) {
      return { author: blogs[0].author, blogs: 1 };
    }
    return undefined;
  }
  const authors = blogs.map((blog) => blog.author);
  const blogCounts = authors.reduce((allNames, name) => {
    const currCount = allNames[name] ?? 0;
    return {
      ...allNames,
      [name]: currCount + 1,
    };
  }, {});
  const topAuthor = Object.keys(blogCounts).reduce((a, b) =>
    blogCounts[a] > blogCounts[b] ? a : b
  );
  return { author: topAuthor, blogs: blogCounts[topAuthor] };
};

const mostLikes = (blogs) => {
  if (blogs.length < 2) {
    if (blogs[0]) {
      return { author: blogs[0].author, likes: blogs[0].likes };
    }
    return undefined;
  }
  const authorWithLikes = blogs
    .map((blog) => [blog.author, blog.likes])
    .sort((auth1, auth2) => auth2[1] - auth1[1]);
  const toReturn = {
    author: authorWithLikes[0][0],
    likes: 0,
  };
  blogs.forEach((blog) => {
    if (blog.author === toReturn.author) {
      toReturn.likes += blog.likes;
    }
  });
  return toReturn;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
