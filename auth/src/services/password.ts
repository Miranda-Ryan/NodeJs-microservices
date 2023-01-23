import * as bcrypt from "bcrypt";

export class Password {
  static async toHash(password: string): Promise<string> {
    const saltRounds = 10;
    const genSalt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, genSalt);
  }

  static async compare(
    storedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(suppliedPassword, storedPassword);
  }
}
