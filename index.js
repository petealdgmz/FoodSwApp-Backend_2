const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // Reemplaza con la URL de tu frontend
    optionsSuccessStatus: 200, // Algunos navegadores pueden requerir esto
  }),
);

//parsear json
app.use(bodyparser.json());

//firebase
const admin = require("firebase-admin");
const serviceAccount = require("./src/services/foodswappCredential.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require("./src/Routes")(app);

app.listen(PORT, () => {
  console.log(`Server is running in PORT: ${PORT}`);
});
