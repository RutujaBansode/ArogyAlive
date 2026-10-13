import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:8081/api/auth';

/**
 * Register a new account using the real Spring Boot backend.
 *
 * The frontend Register page sends role-specific information
 * inside the metadata object. We convert the useful fields
 * into the backend RegisterRequest.
 */
export async function register({
  name,
  email,
  password,
  role,
  metadata = {},
}) {
  const payload = {
    name: name?.trim(),
    email: email?.trim(),
    password,
    role: role?.trim().toLowerCase(),
  };

  /*
   * User.java contains a generic phone field.
   * Different registration forms may call it differently,
   * so support the common names used by the frontend.
   */
  const phone =
    metadata.phone ||
    metadata.mobile ||
    metadata.driverPhone ||
    '';

  if (phone) {
    payload.phone = phone;
  }

  /*
   * Admin registration requires the backend-configured key.
   */
  if (metadata.adminKey) {
    payload.adminKey = metadata.adminKey;
  }

  try {
    const response = await axios.post(
      `${AUTH_BASE_URL}/register`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      'Unable to register account. Please try again.';

    const normalizedError = new Error(message);

    normalizedError.status =
      error?.response?.status;

    normalizedError.response =
      error?.response;

    throw normalizedError;
  }
}

/**
 * Login using the real Spring Boot backend.
 *
 * The role selected on the frontend is intentionally NOT sent
 * to the backend. The backend determines the actual role from
 * the user stored in MySQL.
 */
export async function login({
  email,
  password,
}) {
  const payload = {
    email: email?.trim(),
    password,
  };

  try {
    const response = await axios.post(
      `${AUTH_BASE_URL}/login`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      'Invalid email or password. Please try again.';

    const normalizedError = new Error(message);

    normalizedError.status =
      error?.response?.status;

    normalizedError.response =
      error?.response;

    throw normalizedError;
  }
}