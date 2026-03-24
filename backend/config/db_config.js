require("dotenv").config();


const user = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASSWORD);

const clusterAddress = process.env.DB_CLUSTER_ADDRESS;
const appName = process.env.DB_APP_NAME;
const collectionName = process.env.DB_COLLECTION_NAME;
const url = `mongodb+srv://${user}:${password}@${clusterAddress}/${collectionName}?appName=${appName}`;

module.exports = {
    url,
}