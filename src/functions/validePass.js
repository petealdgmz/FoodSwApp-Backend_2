function validatePassword(password) {
  // Al menos una mayúscula, un número y un carácter especial.
  const uppercaseRegex = /[A-Z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[¡!@#$%^&*(),.¿?":\{\}|\[\]\-_<>]/;

  // Verificar longitud mínima (por ejemplo, al menos 8 caracteres)
  const minLength = 8;

  return (
    password.length >= minLength &&
    uppercaseRegex.test(password) &&
    numberRegex.test(password) &&
    specialCharRegex.test(password)
  );
}

module.exports = {
  validatePassword,
};
