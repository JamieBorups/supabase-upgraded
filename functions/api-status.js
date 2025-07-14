
// This serverless function is no longer in use.
// The application now directly uses the API key provided in the environment.
exports.handler = async function(event, context) {
    return {
        statusCode: 410, // Gone
        body: JSON.stringify({ message: "This function is obsolete." }),
    };
};
