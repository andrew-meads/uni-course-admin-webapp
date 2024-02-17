import jwt from "jsonwebtoken";
import { User } from "../data/schema.js";
import { v4 as uuid } from "uuid";

/**
 * Function to verify the JWT token in the authorization header in the request and add it to a request object if successful.
 *
 * @param {*} req Incoming request. Obtains the authorization header from here. Adds the authenticated user as req.user.
 * @throws error if no token provided in request headers, token is invalid, or no matching user found in database.
 */
async function verifyToken(req) {
  let token = req.headers["authorization"]; // Check header

  // If no token provided, send a 401, don't continue.
  if (!token) throw "No JWT provided";

  // get rid of the "Bearer " bit at the front
  token = token.slice(token.indexOf(" ") + 1);

  // console.log("Auth token from header", token);

  // Decode the token and if it succeeds, stick the DB User object into the req for all to use,
  // then continue processing the request
  const decoded = jwt.verify(token, process.env.JWT_KEY);

  // console.log("Info in token", decoded);

  const user = await User.findOne({
    emailAddress: decoded.emailAddress,
    loginUuid: decoded.uuid
  });

  // console.log("User", user);

  if (!user) throw "No matching user";
  req.user = user;
}

/**
 * Returns an Express middleware function which will use verifyToken() above to populate req.user.
 *
 * If successfully authenticated, we will then check the given roles, if provided. If provided, the user
 * must have ALL of the given roles. If not, we will return a 403 error.
 *
 * If initial auth (via verifyToken()) was not successful, we will return a 401 error.
 *
 * If auth and role checks are both successful, we call the next funciton in the list (next()).
 *
 * @param {...string} roles required roles. If undefined or an empty array, we will not do role checks.
 */
export default function requireAuth(...roles) {
  return async (req, res, next) => {
    try {
      // console.log("Auth check!");

      // Try to verify the token
      await verifyToken(req);

      // If success, also check roles.
      // If no roles provided, assume any role is ok.
      if (!roles || roles.length === 0) return next();

      // Otherwise, make sure the user has all of the required roles.
      const user = req.user;
      for (let requiredRole of roles) {
        if (!user.roles.includes(requiredRole)) return res.sendStatus(403);
      }

      // If role checks pass, continue.
      return next();
    } catch {
      // If fail, get outta here.
      return res.sendStatus(401);
    }
  };
}

/**
 * Create a JWT for the given username, expures in 24h by default. Returns an array with the JWT in
 * the first slot and a unique random value in the second slot (which is also part of the JWT).
 *
 * @param {*} data
 * @param {*} expiresIn
 * @returns {[string, string]}
 */
export function createToken(data, expiresIn = "24h") {
  const uniq = uuid();
  const token = jwt.sign({ uuid: uniq, ...data }, process.env.JWT_KEY, { expiresIn });
  return [token, uniq];
}
