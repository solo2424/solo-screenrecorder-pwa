const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');
admin.initializeApp();

exports.serveFile = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const file = admin.storage().bucket().file(req.query.path);
        const [metadata] = await file.getMetadata();
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', metadata.contentType);
        file.createReadStream().pipe(res);
    });
});