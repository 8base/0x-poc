const handler = require('./handler');
module.exports.handler = (event, context, callback) => {
    return handler(event, context, callback, "src/orderCreate", {
        remoteAddress: "undefined"
    });
};
//# sourceMappingURL=wrapper.js.map