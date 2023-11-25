const admin = require("firebase-admin");
const { validatePassword } = require("./functions/validePass");

module.exports = function (app) {
  //default
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Todo good" });
  });

  //registro
  app.post("/register", async (req, res) => {
    const { email, password, userName, phoneNumber, direc, tipoCuenta } =
      req.body;

    //Valida contraseña
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ error: "La contraseña no cumple con los requisitos mínimos" });
    } else {
      try {
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
        });

        const timestamp = admin.firestore.FieldValue.serverTimestamp(); // Obtiene el timestamp actual

        if (tipoCuenta === "Negocio") {
          await admin
            .firestore()
            .collection("Usuarios_Negocio")
            .doc(userRecord.uid)
            .set({
              nombre: userName,
              correo: email,
              password: password,
              telefono: phoneNumber,
              direccion: direc,
              timestamp: timestamp, // Agrega el timestamp al documento
            });
        } else if (tipoCuenta === "Estándar") {
          await admin
            .firestore()
            .collection("Usuarios_Estandar")
            .doc(userRecord.uid)
            .set({
              nombre: userName,
              correo: email,
              password: password,
              telefono: phoneNumber,
              direccion: direc,
              timestamp: timestamp, // Agrega el timestamp al documento
            });
        }
        // Registro exitoso
        res
          .status(200)
          .json({
            message: "Usuario registrado correctamente",
            user: userRecord,
          });
      } catch (error) {
        console.error("Error al registrar usuario: ", error);
        res.status(500).json({ error: "Error al registrar usuario" });
      }
    }
  });

  // Ruta de inicio de sesión
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Correo electrónico y contraseña son obligatorios" });
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(email);

      if (!userRecord) {
        return res.status(401).json({ error: "Usuario no registrado" });
      }

      // Verificar la contraseña
      const isPasswordCorrect = await verifyUserPassword(email, password);

      if (!isPasswordCorrect) {
        console.log("error aqui");
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      // Si la contraseña es correcta, generar y enviar un token
      const token = await generateAuthToken(userRecord.uid);
      //res.status(200).json({ message: 'Inicio de sesión exitoso' });
      res.json({ token });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(401).json({ error: "Inicio de sesión fallido" });
    }
  });

  // Función para verificar la contraseña del usuario
  async function verifyUserPassword(email, password) {
    try {
      const userCredential = await admin.auth().getUserByEmail(email);
      const { uid } = userCredential;

      // Realizar la verificación de la contraseña aquí (puedes usar tu propia lógica o bibliotecas como bcrypt)
      // Por ejemplo, puedes comparar la contraseña proporcionada con la almacenada en tu base de datos
      // Aquí asumimos que la contraseña está almacenada en una colección "Usuarios" en Firestore
      const userDoc = await admin
        .firestore()
        .collection("Usuarios_Negocio")
        .doc(uid)
        .get();
      const storedPassword = userDoc.data().password;

      // Compara las contraseñas (esto es solo un ejemplo, deberías usar una lógica segura)
      return password === storedPassword;
    } catch (error) {
      console.error("Error al verificar la contraseña:", error);
      return false;
    }
  }

  // Función para generar un token de Firebase
  async function generateAuthToken(uid) {
    try {
      const token = await admin.auth().createCustomToken(uid);
      return token;
    } catch (error) {
      console.error("Error al generar el token:", error);
      throw new Error("Error al generar el token");
    }
  }
};
