/**
 * User Model
 * Simple data model for user entities
 */

/**
 * @class User
 * @classdesc Simple user data model
 */
class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password;
    this.name = data.name;
    this.email = data.email;
    this.updated_at = data.updated_at;
    this.created_at = data.created_at;
    this.role = data.role || "viewer";
  }
}

export default User;
