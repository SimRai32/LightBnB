const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'vagrant'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const setQuery = `
  SELECT *
  FROM users
  WHERE email = $1
  `;
  const values = [email]
  return pool.query(setQuery, values).then((result) => {
    console.log(result.rows);
    return (result.rows);
  })
  .catch((err) => {
    console.log(err.message);
    return null;
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const setQuery = `
  SELECT *
  FROM users
  WHERE id = $1
  `;
  const values = [id]
  return pool.query(setQuery, values).then((result) => {
    console.log(result.rows);
    return (result.rows);
  })
  .catch((err) => {
    console.log(err.message);
    return null;
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const setQuery = `
  INSERT INTO users (name, password, email) VALUES ($1, $2, $3);
  `
  const values = [user.name, user.password, user.email];
  return pool.query(setQuery, values).then((result) => {
    console.log(result.rows);
    return (result.rows);
  })
  .catch((err) => {
    console.log(err.message);
    return null;
  });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const setQuery = `
  SELECT properties.title
  FROM reservations
  JOIN properties on property_id = properties.id
  WHERE guest_id = $1
  LIMIT $2
  `;
  const values = [guest_id, limit];
  return pool
  .query(
    setQuery, 
    values)
  .then((result) => {
    console.log(result.rows);
    return (result.rows);
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryParams.push(options.maximum_price_per_night);
    if (queryParams.length > 2) {
      queryString += `AND cost_per_night > $${queryParams.length-1} AND cost_per_night < $${queryParams.length}`;
    } else {
      queryString += `WHERE cost_per_night > $${queryParams.length-1} AND cost_per_night < $${queryParams.length}`;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    if (queryParams.length > 1) {
      queryString += `AND $${queryParams.length} <= (SELECT AVG(rating) FROM property_reviews GROUP BY properties.id)`;
    } else {
      queryString += `WHERE $${queryParams.length} <= (SELECT AVG(rating) FROM property_reviews GROUP BY properties.id)`;
    } 
    queryString
  }
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    if (queryParams.length > 1) {
      queryString += `AND owner_id = $${queryParams.length} `;
    }
    else {
      queryString += `WHERE owner_id = $${queryParams.length} `;
    }
  }


  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) =>  {
    console.log(res.rows);
    return res.rows});
  };
 
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const setQuery = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
  `
  const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.postal_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  console.log(setQuery, values);
  return pool.query(setQuery, values).then((res) => {
    console.log('done',res.rows);
    return res.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.addProperty = addProperty;

