import bcrypt from "bcrypt";


export const hashPassword = async (password) => {
  try {
    if (!password) {
      throw new Error("Password is required for hashing");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
 
};

export const comparePassword = async (password, hashpass) => {
    try {
        if (!password || !hashpass) {
        throw new Error("Both password and hash are required for comparison");
        }
        const isMatch = await bcrypt.compare(password, hashpass);
        return isMatch;
    } catch (error) {
        throw new Error("Error comparing password: " + error.message);
    }
}
