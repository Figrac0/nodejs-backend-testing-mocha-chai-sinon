const { expect } = require("chai");
const JWT = require("jsonwebtoken");
const sinon = require("sinon");

const authMiddleware = require("../middleware/is-auth");

describe("Auth middleware", function () {
    it("should throw an error if no authorization header is present", function () {
        const req = {
            get: function (headerName) {
                return null;
            },
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
            "Not authenticated.",
        );
    });

    it("should throw an error if authorization header is only one string", function () {
        const req = {
            get: function (headerName) {
                return "xyz";
            },
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it("should throw an error if the token cannot be verified", function () {
        const req = {
            get: function (headerName) {
                return "Bearer xyz";
            },
        };
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it("should yeild a userId after decoding the token", function () {
        const req = {
            get: function (headerName) {
                return "Bearer dgfpiadhofuioahsipfd";
            },
        };
        sinon.stub(JWT, "verify");
        JWT.verify.returns({ userId: "abc" });
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property("userId");
        expect(req).to.have.property("userId", "abc");
        expect(JWT.verify.called).to.be.true;
        JWT.verify.restore();
    });
});
