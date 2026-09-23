/** A local, device-only account. There is no backend yet, and the password is never stored. */
export interface Account {
  email: string;
  name?: string;
}

export interface Credentials {
  email: string;
  password: string;
  name?: string;
}
