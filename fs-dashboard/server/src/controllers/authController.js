import { registerUser, loginUser } from "../services/authService.js";

/**
 * Register new user
 * POST /auth/register
 */
export async function register(req, res, next) {
  try {
    const { username, password, name, email, role } = req.body;

    const result = await registerUser(username, password, name, email, role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: result.user.id,
          username: result.user.username,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 * POST /auth/login
 */
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const result = await loginUser(username, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: result.user.id,
          username: result.user.username,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
}
