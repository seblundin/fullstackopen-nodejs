const listHelper = require('../utils/list_helper');
const helper = require('./test_helper');

test('dummy returns one', () => {
  const result = listHelper.dummy(helper.listWithNoBlogs);
  expect(result).toBe(1);
});

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0);
  });

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.listWithOneBlog);
    expect(result).toBe(5);
  });

  test('total likes of a bigger list is calculated correctly', () => {
    expect(listHelper.totalLikes(helper.listWithManyBlogs)).toBe(36);
  });
});

describe('most liked blog', () => {
  test('should be undefined when the given blog list is empty', () => {
    expect(listHelper.favoriteBlog(helper.listWithNoBlogs)).toBe(undefined);
  });

  test('should match the only given blog', () => {
    expect(listHelper.favoriteBlog(helper.listWithOneBlog)).toEqual({
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5,
    });
  });

  test('should be the one with the most likes, when many blogs are given', () => {
    expect(listHelper.favoriteBlog(helper.listWithManyBlogs)).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    });
  });
});

describe('the author with the most blogs', () => {
  test('when the list is empty should be undefined', () => {
    expect(listHelper.mostBlogs(helper.listWithNoBlogs)).toBe(undefined);
  });

  test('is the only author of a list with one blog', () => {
    expect(listHelper.mostBlogs(helper.listWithOneBlog)).toEqual({
      author: 'Edsger W. Dijkstra',
      blogs: 1,
    });
  });

  test('of the list with many entries is Robert C. Martin', () => {
    expect(listHelper.mostBlogs(helper.listWithManyBlogs)).toEqual({
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });
});

describe('the author with the most likes', () => {
  test('is undefined when no blogs are given', () => {
    expect(listHelper.mostLikes(helper.listWithNoBlogs)).toBe(undefined);
  });

  test('is the only author when one blog is given', () => {
    expect(listHelper.mostLikes(helper.listWithOneBlog)).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 5,
    });
  });

  test('is the one with the most combined likes of a list of blogs', () => {
    expect(listHelper.mostLikes(helper.listWithManyBlogs)).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
