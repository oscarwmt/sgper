import bcrypt from "bcryptjs";

const passwordIngresada = "admin123"; // la que usás en login
const hashEnDB = "$2b$10$C65.EdUt7ZCHFz4KJvBytu4v8W8IjYdTBXopjtMA27RrhGvhe3Shy"; // el que imprimiste

bcrypt.compare(passwordIngresada, hashEnDB).then(res => {
  console.log("¿Coinciden?", res); // debe ser true si todo está OK
});
