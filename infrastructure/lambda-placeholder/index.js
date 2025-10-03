exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: '<h1>LAPSloop Infrastructure Deployed</h1><p>Next.js application will be deployed shortly.</p>',
  };
};
