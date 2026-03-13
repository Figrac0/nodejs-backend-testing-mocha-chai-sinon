require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const fs = require("fs");

const User = require("../models/user");
const Post = require("../models/post");
const FeedController = require("../controllers/feed");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_TESTS}?retryWrites=true&w=majority`;

describe("Feed Controller", function () {
    before(function (done) {
        mongoose
            .connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => {
                return User.findById("5c0f66b979af55031b34728a");
            })
            .then((user) => {
                if (user) {
                    return;
                }

                const newUser = new User({
                    email: "test@test.com",
                    password: "tester",
                    name: "Test",
                    posts: [],
                    _id: "5c0f66b979af55031b34728a",
                });
                return newUser.save();
            })
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    beforeEach(function (done) {
        Post.deleteMany({})
            .then(() => {
                return User.findById("5c0f66b979af55031b34728a");
            })
            .then((user) => {
                user.posts = [];
                return user.save();
            })
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should add a created post to the posts of the creator", function (done) {
        const req = {
            body: {
                title: "Test post",
                content: "A test post",
            },
            file: {
                path: "abc",
            },
            userId: "5c0f66b979af55031b34728a",
        };

        const res = {
            statusCode: null,
            data: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
            },
        };

        FeedController.createPost(req, res, () => {})
            .then((savedUser) => {
                expect(res.statusCode).to.equal(201);
                expect(savedUser).to.have.property("posts");
                expect(savedUser.posts).to.have.length(1);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should throw an error with code 422 if no image is provided", function (done) {
        const req = {
            body: {
                title: "Test post",
                content: "A test post",
            },
            userId: "5c0f66b979af55031b34728a",
        };

        FeedController.createPost(req, {}, () => {})
            .then(() => {
                done(new Error("Test should have failed."));
            })
            .catch((err) => {
                expect(err).to.be.an("error");
                expect(err).to.have.property("statusCode", 422);
                expect(err.message).to.equal("No image provided.");
                done();
            });
    });

    it("should call next with an error if creating a post failed", function (done) {
        const req = {
            body: {
                title: "Test post",
                content: "A test post",
            },
            file: {
                path: "abc",
            },
            userId: "5c0f66b979af55031b34728a",
        };

        sinon.stub(Post.prototype, "save").throws();

        FeedController.createPost(req, {}, (err) => {
            Post.prototype.save.restore();

            try {
                expect(err).to.be.an("error");
                expect(err).to.have.property("statusCode", 500);
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it("should send fetched posts with totalItems", function (done) {
        const post1 = new Post({
            title: "First post",
            content: "First content",
            imageUrl: "images/first.jpg",
            creator: "5c0f66b979af55031b34728a",
        });

        const post2 = new Post({
            title: "Second post",
            content: "Second content",
            imageUrl: "images/second.jpg",
            creator: "5c0f66b979af55031b34728a",
        });

        Promise.all([post1.save(), post2.save()])
            .then(() => {
                const req = {
                    query: {
                        page: 1,
                    },
                };

                const res = {
                    statusCode: null,
                    message: null,
                    posts: null,
                    totalItems: null,
                    status: function (code) {
                        this.statusCode = code;
                        return this;
                    },
                    json: function (data) {
                        this.message = data.message;
                        this.posts = data.posts;
                        this.totalItems = data.totalItems;
                    },
                };

                return FeedController.getPosts(req, res, () => {}).then(() => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.message).to.equal("Fetched posts successfully.");
                    expect(res.posts).to.be.an("array");
                    expect(res.posts).to.have.length(2);
                    expect(res.totalItems).to.equal(2);
                    done();
                });
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should send a single post", function (done) {
        const post = new Post({
            title: "Single post",
            content: "Single content",
            imageUrl: "images/single.jpg",
            creator: "5c0f66b979af55031b34728a",
        });

        post.save()
            .then((savedPost) => {
                const req = {
                    params: {
                        postId: savedPost._id.toString(),
                    },
                };

                const res = {
                    statusCode: null,
                    message: null,
                    post: null,
                    status: function (code) {
                        this.statusCode = code;
                        return this;
                    },
                    json: function (data) {
                        this.message = data.message;
                        this.post = data.post;
                    },
                };

                return FeedController.getPost(req, res, () => {}).then(() => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.message).to.equal("Post fetched.");
                    expect(res.post).to.have.property("title", "Single post");
                    done();
                });
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should update an existing post", function (done) {
        const post = new Post({
            title: "Old title",
            content: "Old content",
            imageUrl: "images/old.jpg",
            creator: "5c0f66b979af55031b34728a",
        });

        post.save()
            .then((savedPost) => {
                const req = {
                    params: {
                        postId: savedPost._id.toString(),
                    },
                    body: {
                        title: "Updated title",
                        content: "Updated content",
                        image: "images/old.jpg",
                    },
                    userId: "5c0f66b979af55031b34728a",
                };

                const res = {
                    statusCode: null,
                    message: null,
                    post: null,
                    status: function (code) {
                        this.statusCode = code;
                        return this;
                    },
                    json: function (data) {
                        this.message = data.message;
                        this.post = data.post;
                    },
                };

                return FeedController.updatePost(req, res, () => {}).then(
                    () => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.message).to.equal("Post updated!");
                        expect(res.post).to.have.property(
                            "title",
                            "Updated title",
                        );
                        expect(res.post).to.have.property(
                            "content",
                            "Updated content",
                        );
                        done();
                    },
                );
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should delete a post", function (done) {
        let createdPost;

        const post = new Post({
            title: "Delete post",
            content: "Delete content",
            imageUrl: "images/delete.jpg",
            creator: "5c0f66b979af55031b34728a",
        });

        sinon.stub(fs, "unlink").callsFake((filePath, cb) => {
            cb(null);
        });

        post.save()
            .then((savedPost) => {
                createdPost = savedPost;
                return User.findById("5c0f66b979af55031b34728a");
            })
            .then((user) => {
                user.posts.push(createdPost);
                return user.save();
            })
            .then(() => {
                const req = {
                    params: {
                        postId: createdPost._id.toString(),
                    },
                    userId: "5c0f66b979af55031b34728a",
                };

                const res = {
                    statusCode: null,
                    message: null,
                    status: function (code) {
                        this.statusCode = code;
                        return this;
                    },
                    json: function (data) {
                        this.message = data.message;
                    },
                };

                return FeedController.deletePost(req, res, () => {})
                    .then(() => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.message).to.equal("Deleted post.");

                        return Post.findById(createdPost._id);
                    })
                    .then((postAfterDelete) => {
                        expect(postAfterDelete).to.be.null;
                        return User.findById("5c0f66b979af55031b34728a");
                    })
                    .then((user) => {
                        expect(user.posts).to.have.length(0);
                        fs.unlink.restore();
                        done();
                    });
            })
            .catch((err) => {
                if (fs.unlink.restore) {
                    fs.unlink.restore();
                }
                done(err);
            });
    });

    after(function (done) {
        Post.deleteMany({})
            .then(() => {
                return User.deleteMany({});
            })
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
