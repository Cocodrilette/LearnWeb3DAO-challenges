export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  // The github repo where the image is
  const imageURL =
    "https://raw.githubusercontent.com/Cocodrilette/LearnWeb3DAO-challenges/main/sophomore/NFTCollection/frontend/public/cryptodevs/";

  // More info about Opensea metadata standards:
  // https://docs.opensea.io/docs/metadata-standards
  res.status(200).json({
    name: "Crypto Dev #" + tokenId,
    description: "Crypto Dev is a collection of developers in crypto",
    image: imageURL + tokenId + ".svg",
  });
}
