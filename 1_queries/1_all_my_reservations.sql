SELECT reservations.id, properties.title, reservations.start_date, properties.cost_per_night, AVG(rating) AS average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 4
GROUP BY properties.title, reservations.id, properties.cost_per_night
ORDER BY reservations.start_date 
LIMIT 10;


