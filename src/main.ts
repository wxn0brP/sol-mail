import FalconFrame from "@wxn0brp/falcon-frame";

const app = new FalconFrame();

app.static("public");

app.listen(+process.env.PORT || 19851, true);