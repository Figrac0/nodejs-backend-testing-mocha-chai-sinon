require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_TESTS}?retryWrites=true&w=majority`;

describe("Auth Controller", function () {
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
                    status: "I am new!",
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
        User.findById("5c0f66b979af55031b34728a")
            .then((user) => {
                if (!user) {
                    const newUser = new User({
                        email: "test@test.com",
                        password: "tester",
                        name: "Test",
                        status: "I am new!",
                        posts: [],
                        _id: "5c0f66b979af55031b34728a",
                    });
                    return newUser.save();
                }

                user.email = "test@test.com";
                user.password = "tester";
                user.name = "Test";
                user.status = "I am new!";
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

    afterEach(function () {
        if (User.findOne.restore) {
            User.findOne.restore();
        }
        if (User.findById.restore) {
            User.findById.restore();
        }
        if (bcrypt.compare.restore) {
            bcrypt.compare.restore();
        }
        if (bcrypt.hash.restore) {
            bcrypt.hash.restore();
        }
        if (jwt.sign.restore) {
            jwt.sign.restore();
        }
        if (User.prototype.save.restore) {
            User.prototype.save.restore();
        }
    });

    it("should throw an error with code 500 if accessing the database fails", function (done) {
        sinon.stub(User, "findOne");
        User.findOne.throws();

        const req = {
            body: {
                email: "test@test.com",
                password: "tester",
            },
        };

        AuthController.login(req, {}, () => {})
            .then((result) => {
                expect(result).to.be.an("error");
                expect(result).to.have.property("statusCode", 500);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should throw an error with code 401 if no user is found", function (done) {
        sinon.stub(User, "findOne");
        User.findOne.returns(Promise.resolve(null));

        const req = {
            body: {
                email: "nouser@test.com",
                password: "tester",
            },
        };

        AuthController.login(req, {}, () => {})
            .then((result) => {
                expect(result).to.be.an("error");
                expect(result).to.have.property("statusCode", 401);
                expect(result.message).to.equal(
                    "A user with this email could not be found.",
                );
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should throw an error with code 401 if password is wrong", function (done) {
        sinon.stub(User, "findOne");
        User.findOne.returns(
            Promise.resolve({
                _id: "5c0f66b979af55031b34728a",
                email: "test@test.com",
                password: "hashedpassword",
            }),
        );

        sinon.stub(bcrypt, "compare");
        bcrypt.compare.returns(Promise.resolve(false));

        const req = {
            body: {
                email: "test@test.com",
                password: "wrongpassword",
            },
        };

        AuthController.login(req, {}, () => {})
            .then((result) => {
                expect(result).to.be.an("error");
                expect(result).to.have.property("statusCode", 401);
                expect(result.message).to.equal("Wrong password!");
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should return a token if login succeeds", function (done) {
        sinon.stub(User, "findOne");
        User.findOne.returns(
            Promise.resolve({
                _id: "5c0f66b979af55031b34728a",
                email: "test@test.com",
                password: "hashedpassword",
            }),
        );

        sinon.stub(bcrypt, "compare");
        bcrypt.compare.returns(Promise.resolve(true));

        sinon.stub(jwt, "sign");
        jwt.sign.returns("sometoken");

        const req = {
            body: {
                email: "test@test.com",
                password: "tester",
            },
        };

        const res = {
            statusCode: null,
            token: null,
            userId: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.token = data.token;
                this.userId = data.userId;
            },
        };

        AuthController.login(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.equal(200);
                expect(res.token).to.equal("sometoken");
                expect(res.userId).to.equal("5c0f66b979af55031b34728a");
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should send a response with a valid user status for an existing user", function (done) {
        const req = { userId: "5c0f66b979af55031b34728a" };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status;
            },
        };

        AuthController.getUserStatus(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal("I am new!");
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should call next with an error if user is not found in getUserStatus", function (done) {
        sinon.stub(User, "findById");
        User.findById.returns(Promise.resolve(null));

        const req = { userId: "123" };

        AuthController.getUserStatus(req, {}, (err) => {
            try {
                expect(err).to.be.an("error");
                expect(err).to.have.property("statusCode", 404);
                expect(err.message).to.equal("User not found.");
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it("should update the user status", function (done) {
        const req = {
            userId: "5c0f66b979af55031b34728a",
            body: {
                status: "Updated status",
            },
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

        AuthController.updateUserStatus(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.equal(200);
                expect(res.message).to.equal("User updated.");

                return User.findById("5c0f66b979af55031b34728a");
            })
            .then((user) => {
                expect(user.status).to.equal("Updated status");
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should call next with an error if user is not found in updateUserStatus", function (done) {
        sinon.stub(User, "findById");
        User.findById.returns(Promise.resolve(null));

        const req = {
            userId: "123",
            body: {
                status: "Updated status",
            },
        };

        AuthController.updateUserStatus(req, {}, (err) => {
            try {
                expect(err).to.be.an("error");
                expect(err).to.have.property("statusCode", 404);
                expect(err.message).to.equal("User not found.");
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it("should create a new user on signup", function (done) {
        sinon.stub(bcrypt, "hash");
        bcrypt.hash.returns(Promise.resolve("hashedpassword"));

        const req = {
            body: {
                email: "newuser@test.com",
                password: "tester",
                name: "New User",
            },
        };

        const res = {
            statusCode: null,
            message: null,
            userId: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.message = data.message;
                this.userId = data.userId;
            },
        };

        AuthController.signup(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.equal(201);
                expect(res.message).to.equal("User created!");
                expect(res.userId).to.exist;

                return User.findOne({ email: "newuser@test.com" });
            })
            .then((user) => {
                expect(user).to.exist;
                expect(user.name).to.equal("New User");
                expect(user.password).to.equal("hashedpassword");
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should call next with an error if signup fails", function (done) {
        sinon.stub(bcrypt, "hash");
        bcrypt.hash.returns(Promise.resolve("hashedpassword"));

        sinon.stub(User.prototype, "save");
        User.prototype.save.throws();

        const req = {
            body: {
                email: "erroruser@test.com",
                password: "tester",
                name: "Error User",
            },
        };

        AuthController.signup(req, {}, (err) => {
            try {
                expect(err).to.be.an("error");
                expect(err).to.have.property("statusCode", 500);
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    after(function (done) {
        User.deleteMany({})
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
